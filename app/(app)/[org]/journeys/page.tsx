import type { Metadata } from 'next';
import { WorkflowIcon } from 'lucide-react';
import { EmptyState, PageHeader } from '@/components/empty-state';
import { copy } from '@/lib/copy';

export const metadata: Metadata = { title: copy.glossary.journeys };

export default function JourneysPage() {
  return (
    <>
      <PageHeader title={copy.glossary.journeys} />
      <EmptyState
        icon={WorkflowIcon}
        title={copy.empty.journeys.title}
        text={copy.empty.journeys.text}
        cta={{ label: copy.empty.journeys.cta, disabledHint: copy.common.soon }}
      />
    </>
  );
}
