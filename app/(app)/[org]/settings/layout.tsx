import { PageHeader } from '@/components/empty-state';
import { copy } from '@/lib/copy';
import { SettingsNav } from './settings-nav';

export default async function SettingsLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ org: string }>;
}) {
  const { org } = await params;
  return (
    <>
      <PageHeader title={copy.settings.title} />
      <div className="grid gap-6 md:grid-cols-[12rem_1fr]">
        <SettingsNav slug={org} />
        <div className="min-w-0">{children}</div>
      </div>
    </>
  );
}
