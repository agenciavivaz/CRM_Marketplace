import type { Metadata } from 'next';
import { SendIcon } from 'lucide-react';
import { EmptyState, PageHeader } from '@/components/empty-state';
import { copy } from '@/lib/copy';

export const metadata: Metadata = { title: copy.glossary.campaigns };

export default function CampaignsPage() {
  return (
    <>
      <PageHeader title={copy.glossary.campaigns} />
      <EmptyState
        icon={SendIcon}
        title={copy.empty.campaigns.title}
        text={copy.empty.campaigns.text}
        cta={{ label: copy.empty.campaigns.cta, disabledHint: copy.common.soon }}
      />
    </>
  );
}
