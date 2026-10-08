import { AppShell } from '@/components/app-shell';
import { isPlatformAdmin, listMyOrgs, requireOrg } from '@/lib/auth';

export default async function OrgLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ org: string }>;
}) {
  const { org: slug } = await params;
  const [ctx, orgs, isAdmin] = await Promise.all([
    requireOrg(slug),
    listMyOrgs(),
    isPlatformAdmin(),
  ]);
  return (
    <AppShell
      org={{ slug: ctx.org.slug, name: ctx.org.name }}
      orgs={orgs.map((o) => ({ slug: o.slug, name: o.name }))}
      email={ctx.email}
      isAdmin={isAdmin}
    >
      {children}
    </AppShell>
  );
}
