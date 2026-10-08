-- 0002 — Tira as funções auxiliares de autorização da API pública (advisor 0029).
-- Elas continuam usadas pelas policies (que referenciam por OID), mas não ficam
-- mais expostas em /rest/v1/rpc. Só create_organization segue como RPC pública.
create schema if not exists private;
revoke all on schema private from public, anon;
grant usage on schema private to authenticated, service_role;

alter function public.is_org_member(uuid) set schema private;
alter function public.has_org_role(uuid, text[]) set schema private;
alter function public.is_platform_admin() set schema private;
alter function public.slugify(text) set schema private;
alter function public.set_updated_at() set schema private;

revoke execute on all functions in schema private from public, anon;
grant execute on all functions in schema private to authenticated, service_role;
alter default privileges in schema private revoke execute on functions from public, anon;

-- create_organization chamava public.slugify
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

  v_base := left(private.slugify(p_name), 50);
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
revoke execute on function public.create_organization(text) from public, anon;
grant execute on function public.create_organization(text) to authenticated;
