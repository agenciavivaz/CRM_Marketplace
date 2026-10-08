import type { Metadata } from 'next';
import { UsersIcon } from 'lucide-react';
import { EmptyState, PageHeader } from '@/components/empty-state';
import { copy } from '@/lib/copy';

export const metadata: Metadata = { title: copy.nav.customers };

export default async function CustomersPage({ params }: { params: Promise<{ org: string }> }) {
  const { org } = await params;
  return (
    <>
      <PageHeader title={copy.glossary.customers} />
      <EmptyState
        icon={UsersIcon}
        title={copy.empty.customers.title}
        text={copy.empty.customers.text}
        cta={{ label: copy.empty.customers.cta, href: `/${org}/settings/integrations` }}
      />
    </>
  );
}
