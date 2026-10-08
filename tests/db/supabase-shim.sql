-- Reproduz o mínimo do ambiente Supabase num Postgres vazio para testar as migrations e a RLS.
-- Não é aplicado no projeto real.
create role anon nologin noinherit;
create role authenticated nologin noinherit;
create role service_role nologin noinherit bypassrls;
create role supabase_admin nologin;
grant anon, authenticated, service_role to current_user;

create schema auth;
create schema extensions;
create extension if not exists pgcrypto with schema extensions;

create table auth.users (
  id uuid primary key default gen_random_uuid(),
  email text unique,
  raw_user_meta_data jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create function auth.uid() returns uuid language sql stable as $$
  select nullif(
    coalesce(current_setting('request.jwt.claim.sub', true),
             (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')),
    '')::uuid;
$$;

create function auth.role() returns text language sql stable as $$
  select nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role';
$$;

create function auth.jwt() returns jsonb language sql stable as $$
  select coalesce(nullif(current_setting('request.jwt.claims', true), ''), '{}')::jsonb;
$$;

grant usage on schema auth, extensions to anon, authenticated, service_role;
grant execute on all functions in schema auth to anon, authenticated, service_role;
grant usage on schema public to anon, authenticated, service_role;

-- Privilégios padrão do Supabase: tudo em public é concedido aos três papéis; a RLS decide.
alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
alter default privileges in schema public grant all on sequences to anon, authenticated, service_role;
alter default privileges in schema public grant execute on functions to anon, authenticated, service_role;
