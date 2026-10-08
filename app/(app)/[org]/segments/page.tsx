import type { Metadata } from 'next';
import { ListFilterIcon } from 'lucide-react';
import { EmptyState, PageHeader } from '@/components/empty-state';
import { copy } from '@/lib/copy';

export const metadata: Metadata = { title: copy.glossary.segments };

export default function SegmentsPage() {
  return (
    <>
      <PageHeader title={copy.glossary.segments} />
      <EmptyState
        icon={ListFilterIcon}
        title={copy.empty.segments.title}
        text={copy.empty.segments.text}
        cta={{ label: copy.empty.segments.cta, disabledHint: copy.common.soon }}
      />
    </>
  );
}
