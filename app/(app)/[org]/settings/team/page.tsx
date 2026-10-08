import type { Metadata } from 'next';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { requireOrg, type Role } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { copy } from '@/lib/copy';
import { formatDate } from '@/lib/format';

export const metadata: Metadata = { title: copy.settings.sections.team };

export default async function TeamPage({ params }: { params: Promise<{ org: string }> }) {
  const { org: slug } = await params;
  const { org, userId, email } = await requireOrg(slug);
  const supabase = await createClient();
  const { data: members } = await supabase
    .from('memberships')
    .select('user_id, role, created_at')
    .eq('org_id', org.id)
    .order('created_at');

  return (
    <Card>
      <CardHeader>
        <CardTitle>{copy.settings.sections.team}</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="divide-y">
          {(members ?? []).map((m) => (
            <li key={m.user_id} className="flex items-center justify-between gap-3 py-3">
              <div className="grid min-w-0">
                <span className="truncate text-sm font-medium">
                  {m.user_id === userId
                    ? `${copy.settings.team.you}${email ? ` · ${email}` : ''}`
                    : copy.settings.team.roles.member}
                </span>
                <span className="text-muted-foreground text-xs">
                  {formatDate(m.created_at, org.timezone)}
                </span>
              </div>
              <Badge variant="outline">{copy.settings.team.roles[m.role as Role]}</Badge>
            </li>
          ))}
        </ul>
        <p className="text-muted-foreground mt-4 text-xs">{copy.common.soon}</p>
      </CardContent>
    </Card>
  );
}
