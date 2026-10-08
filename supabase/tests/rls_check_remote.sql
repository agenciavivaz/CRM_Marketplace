-- Variante enxuta do rls_check.sql para o projeto Supabase real (ver README.md).
-- Termina sempre com exceção: RLS_OK… (passou) ou RLS_FAIL… (falhou). Nada é gravado.
do $rls$
declare
  fixtures jsonb := $json${
    "memberships": "insert into public.memberships (org_id, user_id, role) values (%1$L, %4$L, 'member')",
    "audit_log": "insert into public.audit_log (org_id, actor_id, action) values (%1$L, %2$L, 'rls.test')"
  }$json$::jsonb;
  service_only text[] := array[]::text[];
  user_a uuid := gen_random_uuid();
  user_b uuid := gen_random_uuid();
  user_x uuid := gen_random_uuid();
  user_y uuid := gen_random_uuid();
  org_a uuid; org_b uuid; t record; n bigint; checked int := 0;
  failures text[] := array[]::text[];
begin
  insert into auth.users (id, email) values
    (user_a, 'rls-a-' || user_a || '@example.test'), (user_b, 'rls-b-' || user_b || '@example.test'),
    (user_x, 'rls-x-' || user_x || '@example.test'), (user_y, 'rls-y-' || user_y || '@example.test');
  perform set_config('request.jwt.claims', json_build_object('sub', user_a, 'role', 'authenticated')::text, true);
  set local role authenticated;
  select id into org_a from public.create_organization('RLS Loja A');
  reset role;
  perform set_config('request.jwt.claims', json_build_object('sub', user_b, 'role', 'authenticated')::text, true);
  set local role authenticated;
  select id into org_b from public.create_organization('RLS Loja B');
  reset role;

  for t in select c.relname as name from pg_class c join pg_namespace s on s.oid = c.relnamespace
    where s.nspname = 'public' and c.relkind in ('r','p')
      and exists (select 1 from pg_attribute a where a.attrelid = c.oid and a.attname = 'org_id' and not a.attisdropped)
  loop
    if not fixtures ? t.name then failures := failures || format('%s: sem fixture', t.name); continue; end if;
    execute format(fixtures ->> t.name, org_a, user_a, gen_random_uuid(), user_x);
    execute format(fixtures ->> t.name, org_b, user_b, gen_random_uuid(), user_y);
  end loop;

  for t in select c.relname as name from pg_class c join pg_namespace s on s.oid = c.relnamespace
    where s.nspname = 'public' and c.relkind in ('r','p') and not c.relrowsecurity
  loop failures := failures || format('%s: RLS desabilitada', t.name); end loop;

  for t in select c.relname as name from pg_class c join pg_namespace s on s.oid = c.relnamespace
    where s.nspname = 'public' and c.relkind in ('r','p') and fixtures ? c.relname
  loop
    checked := checked + 1;
    perform set_config('request.jwt.claims', json_build_object('sub', user_b, 'role', 'authenticated')::text, true);
    set local role authenticated;
    begin
      execute format('select count(*) from public.%I where org_id = %L', t.name, org_a) into n;
      if n <> 0 then failures := failures || format('%s: B leu A', t.name); end if;
    exception when insufficient_privilege then null; end;
    begin
      execute format(fixtures ->> t.name, org_a, user_b, gen_random_uuid(), user_b);
      failures := failures || format('%s: B inseriu em A', t.name);
    exception when insufficient_privilege then null; end;
    reset role;
    perform set_config('request.jwt.claims', json_build_object('sub', user_a, 'role', 'authenticated')::text, true);
    set local role authenticated;
    begin
      execute format('select count(*) from public.%I where org_id = %L', t.name, org_a) into n;
    exception when insufficient_privilege then n := 0; end;
    reset role;
    if t.name = any (service_only) then
      if n <> 0 then failures := failures || format('%s: tabela interna visível', t.name); end if;
    elsif n = 0 then
      failures := failures || format('%s: A não lê os próprios dados', t.name);
    end if;
    perform set_config('request.jwt.claims', json_build_object('role', 'anon')::text, true);
    set local role anon;
    begin
      execute format('select count(*) from public.%I', t.name) into n;
      if n <> 0 then failures := failures || format('%s: anon leu', t.name); end if;
    exception when insufficient_privilege then null; end;
    reset role;
  end loop;

  perform set_config('request.jwt.claims', json_build_object('sub', user_b, 'role', 'authenticated')::text, true);
  set local role authenticated;
  select count(*) into n from public.organizations where id = org_a;
  if n <> 0 then failures := failures || 'organizations: B leu A'::text; end if;
  begin
    insert into public.organizations (name, slug) values ('x', 'rls-direct-insert');
    failures := failures || 'organizations: insert direto permitido'::text;
  exception when insufficient_privilege then null; end;
  begin
    insert into public.platform_admins (user_id) values (user_b);
    failures := failures || 'platform_admins: B se promoveu'::text;
  exception when insufficient_privilege then null; end;
  reset role;

  if array_length(failures, 1) > 0 then raise exception 'RLS_FAIL: %', array_to_string(failures, ' | '); end if;
  raise exception 'RLS_OK: % tabelas com org_id verificadas (remoto)', checked;
end
$rls$;
