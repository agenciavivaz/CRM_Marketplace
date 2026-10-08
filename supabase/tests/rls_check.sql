-- Teste automatizado de isolamento entre organizações (ADR-003, R1).
--
-- Roda dentro de um único bloco DO e termina SEMPRE com uma exceção, o que desfaz tudo:
--   * 'RLS_OK: ...'   → todas as verificações passaram
--   * qualquer outra  → falha (a mensagem diz qual tabela e qual verificação)
-- Pode rodar no Postgres local (tests/db/rls.test.ts) e no projeto Supabase real, sem deixar rastro.
--
-- Regras verificadas para TODA tabela do schema public:
--   1. RLS habilitada.
--   2. Tabela com org_id precisa ter fixture abaixo (tabela nova sem fixture = falha).
--   3. Usuário da org B não lê, não altera, não apaga e não insere dados da org A.
--   4. Usuário da org A lê os próprios dados (exceto tabelas "service_only").
--   5. anon não lê nada.
do $rls$
declare
  -- %1$L = org_id · %2$L = usuário owner dessa org · %3$L = uuid novo · %4$L = outro usuário (sem org)
  fixtures jsonb := $json${
    "memberships": "insert into public.memberships (org_id, user_id, role) values (%1$L, %4$L, 'member')",
    "audit_log": "insert into public.audit_log (org_id, actor_id, action) values (%1$L, %2$L, 'rls.test')"
  }$json$::jsonb;
  -- Tabelas que só o service_role acessa (filas internas, webhooks brutos, cache).
  service_only text[] := array[]::text[];
  -- Tabelas sem org_id com verificação própria abaixo.
  special text[] := array['organizations', 'platform_admins'];

  user_a uuid := gen_random_uuid();
  user_b uuid := gen_random_uuid();
  user_x uuid := gen_random_uuid();
  user_y uuid := gen_random_uuid();
  org_a uuid;
  org_b uuid;
  t record;
  n bigint;
  checked int := 0;
  failures text[] := array[]::text[];
  fixture text;
begin
  -- Usuários e orgs (via RPC, como no app)
  insert into auth.users (id, email) values
    (user_a, 'rls-a-' || user_a || '@example.test'),
    (user_b, 'rls-b-' || user_b || '@example.test'),
    (user_x, 'rls-x-' || user_x || '@example.test'),
    (user_y, 'rls-y-' || user_y || '@example.test');

  perform set_config('request.jwt.claims', json_build_object('sub', user_a, 'role', 'authenticated')::text, true);
  set local role authenticated;
  select id into org_a from public.create_organization('RLS Loja A');
  reset role;
  perform set_config('request.jwt.claims', json_build_object('sub', user_b, 'role', 'authenticated')::text, true);
  set local role authenticated;
  select id into org_b from public.create_organization('RLS Loja B');
  reset role;

  insert into public.platform_admins (user_id) values (user_a);

  -- Fixtures como superusuário para as duas orgs
  for t in
    select c.relname as name
    from pg_class c join pg_namespace s on s.oid = c.relnamespace
    where s.nspname = 'public' and c.relkind in ('r', 'p')
      and exists (select 1 from pg_attribute a where a.attrelid = c.oid and a.attname = 'org_id' and not a.attisdropped)
    order by c.relname
  loop
    fixture := fixtures ->> t.name;
    if fixture is null then
      failures := failures || format('%s: tabela com org_id sem fixture em supabase/tests/rls_check.sql', t.name);
      continue;
    end if;
    execute format(fixture, org_a, user_a, gen_random_uuid(), user_x);
    execute format(fixture, org_b, user_b, gen_random_uuid(), user_y);
  end loop;

  -- 1. RLS habilitada em todas as tabelas
  for t in
    select c.relname as name from pg_class c join pg_namespace s on s.oid = c.relnamespace
    where s.nspname = 'public' and c.relkind in ('r', 'p') and not c.relrowsecurity
  loop
    failures := failures || format('%s: RLS desabilitada', t.name);
  end loop;

  -- 3 e 4. Isolamento por tabela com org_id
  for t in
    select c.relname as name
    from pg_class c join pg_namespace s on s.oid = c.relnamespace
    where s.nspname = 'public' and c.relkind in ('r', 'p')
      and exists (select 1 from pg_attribute a where a.attrelid = c.oid and a.attname = 'org_id' and not a.attisdropped)
      and fixtures ? c.relname
    order by c.relname
  loop
    checked := checked + 1;

    -- Usuário B tentando a org A
    perform set_config('request.jwt.claims', json_build_object('sub', user_b, 'role', 'authenticated')::text, true);
    set local role authenticated;

    begin
      execute format('select count(*) from public.%I where org_id = %L', t.name, org_a) into n;
      if n <> 0 then failures := failures || format('%s: B leu %s linha(s) de A', t.name, n); end if;
    exception when insufficient_privilege then null;
    end;

    begin
      execute format('update public.%I set org_id = org_id where org_id = %L', t.name, org_a);
      get diagnostics n = row_count;
      if n <> 0 then failures := failures || format('%s: B alterou %s linha(s) de A', t.name, n); end if;
    exception when insufficient_privilege then null;
    end;

    begin
      execute format('update public.%I set org_id = %L where org_id = %L', t.name, org_a, org_b);
      get diagnostics n = row_count;
      if n <> 0 then failures := failures || format('%s: B moveu linha(s) para A', t.name); end if;
    exception when insufficient_privilege or check_violation then null;
    end;

    begin
      execute format('delete from public.%I where org_id = %L', t.name, org_a);
      get diagnostics n = row_count;
      if n <> 0 then failures := failures || format('%s: B apagou %s linha(s) de A', t.name, n); end if;
    exception when insufficient_privilege then null;
    end;

    begin
      execute format(fixtures ->> t.name, org_a, user_b, gen_random_uuid(), user_b);
      failures := failures || format('%s: B inseriu linha na org A', t.name);
    exception when insufficient_privilege then null;
    end;

    reset role;

    -- Usuário A lê os próprios dados
    perform set_config('request.jwt.claims', json_build_object('sub', user_a, 'role', 'authenticated')::text, true);
    set local role authenticated;
    begin
      execute format('select count(*) from public.%I where org_id = %L', t.name, org_a) into n;
    exception when insufficient_privilege then n := 0;
    end;
    reset role;
    if t.name = any (service_only) then
      if n <> 0 then failures := failures || format('%s: tabela interna visível para authenticated', t.name); end if;
    elsif n = 0 then
      failures := failures || format('%s: A não consegue ler os próprios dados', t.name);
    end if;

    -- 5. anon
    perform set_config('request.jwt.claims', json_build_object('role', 'anon')::text, true);
    set local role anon;
    begin
      execute format('select count(*) from public.%I', t.name) into n;
      if n <> 0 then failures := failures || format('%s: anon leu %s linha(s)', t.name, n); end if;
    exception when insufficient_privilege then null;
    end;
    reset role;
  end loop;

  -- organizations
  perform set_config('request.jwt.claims', json_build_object('sub', user_b, 'role', 'authenticated')::text, true);
  set local role authenticated;
  select count(*) into n from public.organizations where id = org_a;
  if n <> 0 then failures := failures || 'organizations: B leu a org A'::text; end if;
  update public.organizations set name = 'invadida' where id = org_a;
  get diagnostics n = row_count;
  if n <> 0 then failures := failures || 'organizations: B alterou a org A'::text; end if;
  begin
    delete from public.organizations where id = org_a;
    get diagnostics n = row_count;
    if n <> 0 then failures := failures || 'organizations: B apagou a org A'::text; end if;
  exception when insufficient_privilege then null;
  end;
  begin
    insert into public.organizations (name, slug) values ('x', 'rls-direct-insert');
    failures := failures || 'organizations: insert direto permitido (deve ser só via create_organization)'::text;
  exception when insufficient_privilege then null;
  end;
  select count(*) into n from public.organizations where id = org_b;
  if n <> 1 then failures := failures || 'organizations: B não lê a própria org'::text; end if;
  -- platform_admins: B não vê que A é admin e não se promove
  select count(*) into n from public.platform_admins;
  if n <> 0 then failures := failures || 'platform_admins: B leu admins'::text; end if;
  begin
    insert into public.platform_admins (user_id) values (user_b);
    failures := failures || 'platform_admins: B se promoveu a admin'::text;
  exception when insufficient_privilege then null;
  end;
  -- membro comum não se promove a owner
  begin
    update public.memberships set role = 'owner' where org_id = org_b and user_id = user_y;
    get diagnostics n = row_count;
    if n <> 0 then failures := failures || 'memberships: owner criou outro owner'::text; end if;
  exception when insufficient_privilege then null;
  end;
  reset role;

  -- membro (não owner) da org B não altera papéis
  perform set_config('request.jwt.claims', json_build_object('sub', user_y, 'role', 'authenticated')::text, true);
  set local role authenticated;
  update public.memberships set role = 'admin' where org_id = org_b and user_id = user_y;
  get diagnostics n = row_count;
  if n <> 0 then failures := failures || 'memberships: member alterou o próprio papel'::text; end if;
  select count(*) into n from public.audit_log where org_id = org_b;
  if n <> 0 then failures := failures || 'audit_log: member leu auditoria (só owner/admin)'::text; end if;
  reset role;

  -- platform admin enxerga as orgs (painel admin)
  perform set_config('request.jwt.claims', json_build_object('sub', user_a, 'role', 'authenticated')::text, true);
  set local role authenticated;
  select count(*) into n from public.organizations where id in (org_a, org_b);
  if n <> 2 then failures := failures || 'organizations: platform admin não enxerga todas as orgs'::text; end if;
  reset role;

  if array_length(failures, 1) > 0 then
    raise exception 'RLS_FAIL: %', array_to_string(failures, ' | ');
  end if;
  raise exception 'RLS_OK: % tabelas com org_id verificadas', checked;
end
$rls$;
