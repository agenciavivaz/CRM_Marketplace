-- 0001 — Tenancy: organizações, membros, admins da plataforma e auditoria.
-- ADR-003: schema único + org_id + RLS. Toda tabela de negócio usa is_org_member(org_id).

-- ---------------------------------------------------------------------------
-- Utilidades
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Tabelas
-- ---------------------------------------------------------------------------
create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(btrim(name)) between 1 and 80),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) <= 60),
  timezone text not null default 'America/Sao_Paulo',
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.memberships (
  org_id uuid not null references public.organizations (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null check (role in ('owner', 'admin', 'member')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (org_id, user_id)
);
create index memberships_user_idx on public.memberships (user_id);

create table public.platform_admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

-- Append-only: não há policy de update/delete.
create table public.audit_log (
  id bigint generated always as identity primary key,
  org_id uuid not null references public.organizations (id) on delete cascade,
  actor_id uuid references auth.users (id) on delete set null,
  action text not null,
  entity text,
  entity_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index audit_log_org_idx on public.audit_log (org_id, created_at desc);

create trigger organizations_updated_at before update on public.organizations
  for each row execute function public.set_updated_at();
create trigger memberships_updated_at before update on public.memberships
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Funções de autorização (security definer para não recursar nas policies)
-- ---------------------------------------------------------------------------
create or replace function public.is_org_member(org uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.memberships m
    where m.org_id = org and m.user_id = (select auth.uid())
  );
$$;

create or replace function public.has_org_role(org uuid, roles text[])
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.memberships m
    where m.org_id = org and m.user_id = (select auth.uid()) and m.role = any (roles)
  );
$$;

create or replace function public.is_platform_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.platform_admins p where p.user_id = (select auth.uid()));
$$;

-- "Casa da Maria & Cia" → "casa-da-maria-cia"
create or replace function public.slugify(value text)
returns text
language sql
immutable
set search_path = ''
as $$
  select coalesce(nullif(trim(both '-' from regexp_replace(
    lower(translate(value,
      'ÁÀÂÃÄÅáàâãäåÉÈÊËéèêëÍÌÎÏíìîïÓÒÔÕÖóòôõöÚÙÛÜúùûüÇçÑñ',
      'AAAAAAaaaaaaEEEEeeeeIIIIiiiiOOOOOoooooUUUUuuuuCcNn')),
    '[^a-z0-9]+', '-', 'g')), ''), 'loja');
$$;

-- Cria a org e torna quem chamou owner. Única forma de criar organização.
create or replace function public.create_organization(p_name text)
returns public.organizations
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := auth.uid();
  v_base text;
  v_slug text;
  v_org public.organizations;
  v_try int := 0;
begin
  if v_user is null then
    raise exception 'not_authenticated' using errcode = '42501';
  end if;
  if p_name is null or char_length(btrim(p_name)) not between 1 and 80 then
    raise exception 'invalid_name' using errcode = '22023';
  end if;

  v_base := left(public.slugify(p_name), 50);
  v_slug := v_base;
  while exists (select 1 from public.organizations o where o.slug = v_slug) loop
    v_try := v_try + 1;
    v_slug := v_base || '-' || substr(md5(random()::text), 1, 4);
    if v_try > 20 then
      raise exception 'slug_unavailable';
    end if;
  end loop;

  insert into public.organizations (name, slug) values (btrim(p_name), v_slug) returning * into v_org;
  insert into public.memberships (org_id, user_id, role) values (v_org.id, v_user, 'owner');
  insert into public.audit_log (org_id, actor_id, action, entity, entity_id)
    values (v_org.id, v_user, 'organization.created', 'organization', v_org.id::text);
  return v_org;
end;
$$;

-- ---------------------------------------------------------------------------
-- Privilégios: anon não toca em tabelas de negócio; funções só para quem precisa
-- ---------------------------------------------------------------------------
revoke all on public.organizations, public.memberships, public.platform_admins, public.audit_log from anon;
revoke execute on function public.create_organization(text) from public, anon;
grant execute on function public.create_organization(text) to authenticated;
revoke execute on function public.is_org_member(uuid), public.has_org_role(uuid, text[]), public.is_platform_admin() from public, anon;
grant execute on function public.is_org_member(uuid), public.has_org_role(uuid, text[]), public.is_platform_admin() to authenticated, service_role;

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.organizations enable row level security;
alter table public.memberships enable row level security;
alter table public.platform_admins enable row level security;
alter table public.audit_log enable row level security;

create policy organizations_select on public.organizations for select to authenticated
  using (public.is_org_member(id) or public.is_platform_admin());
create policy organizations_update on public.organizations for update to authenticated
  using (public.has_org_role(id, array['owner', 'admin']))
  with check (public.has_org_role(id, array['owner', 'admin']));

create policy memberships_select on public.memberships for select to authenticated
  using (public.is_org_member(org_id) or public.is_platform_admin());
create policy memberships_insert on public.memberships for insert to authenticated
  with check (public.has_org_role(org_id, array['owner']) and role <> 'owner');
create policy memberships_update on public.memberships for update to authenticated
  using (public.has_org_role(org_id, array['owner']) and role <> 'owner')
  with check (public.has_org_role(org_id, array['owner']) and role <> 'owner');
create policy memberships_delete on public.memberships for delete to authenticated
  using (public.has_org_role(org_id, array['owner']) and role <> 'owner');

create policy platform_admins_select on public.platform_admins for select to authenticated
  using (user_id = (select auth.uid()));

create policy audit_log_select on public.audit_log for select to authenticated
  using (public.has_org_role(org_id, array['owner', 'admin']) or public.is_platform_admin());
create policy audit_log_insert on public.audit_log for insert to authenticated
  with check (public.is_org_member(org_id) and actor_id = (select auth.uid()));
