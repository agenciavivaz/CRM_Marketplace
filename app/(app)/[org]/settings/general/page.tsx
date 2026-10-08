import type { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { canManage, requireOrg } from '@/lib/auth';
import { copy } from '@/lib/copy';
import { appUrl } from '@/lib/env';
import { GeneralForm } from './form';

export const metadata: Metadata = { title: copy.settings.sections.general };

export default async function GeneralPage({ params }: { params: Promise<{ org: string }> }) {
  const { org: slug } = await params;
  const { org, role } = await requireOrg(slug);
  return (
    <Card>
      <CardHeader>
        <CardTitle>{copy.settings.sections.general}</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-6">
        <GeneralForm slug={org.slug} name={org.name} canEdit={canManage(role)} />
        <div className="grid gap-1 text-sm">
          <span className="font-medium">{copy.settings.general.address}</span>
          <code className="bg-muted truncate rounded px-2 py-1 text-xs">{`${appUrl()}/${org.slug}`}</code>
        </div>
      </CardContent>
    </Card>
  );
}
