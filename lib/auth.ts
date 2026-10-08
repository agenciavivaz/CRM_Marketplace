import 'server-only';
import { cache } from 'react';
import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import type { Tables } from '@/lib/supabase/database.types';

export type Role = 'owner' | 'admin' | 'member';
export type Organization = Tables<'organizations'>;

export interface OrgContext {
  org: Organization;
  role: Role;
  userId: string;
  email: string | null;
}

/** Usuário logado (validado no servidor do Supabase) ou redireciona para o login. */
export const requireUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  return user;
});

/** Lojas do usuário com o papel em cada uma. RLS garante que só voltam as dele. */
export const listMyOrgs = cache(async () => {
  const user = await requireUser();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('memberships')
    .select('role, organizations!inner(id, name, slug)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data ?? []).map((m) => ({
    role: m.role as Role,
    id: m.organizations.id,
    name: m.organizations.name,
    slug: m.organizations.slug,
  }));
});

/** Carrega a loja pelo slug da URL e confere que o usuário é membro. */
export const requireOrg = cache(async (slug: string): Promise<OrgContext> => {
  const user = await requireUser();
  const supabase = await createClient();
  const { data: org } = await supabase
    .from('organizations')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();
  if (!org) notFound();
  const { data: membership } = await supabase
    .from('memberships')
    .select('role')
    .eq('org_id', org.id)
    .eq('user_id', user.id)
    .maybeSingle();
  if (!membership) notFound(); // platform admin sem vínculo usa /admin, não a área da loja
  return { org, role: membership.role as Role, userId: user.id, email: user.email ?? null };
});

export function canManage(role: Role) {
  return role === 'owner' || role === 'admin';
}

export const isPlatformAdmin = cache(async () => {
  const user = await requireUser();
  const supabase = await createClient();
  const { data } = await supabase
    .from('platform_admins')
    .select('user_id')
    .eq('user_id', user.id)
    .maybeSingle();
  return Boolean(data);
});

/** Para onde mandar o usuário depois do login. */
export async function homePath(): Promise<string> {
  const orgs = await listMyOrgs();
  return orgs[0] ? `/${orgs[0].slug}/dashboard` : '/onboarding/org';
}
