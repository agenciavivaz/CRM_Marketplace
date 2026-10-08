import type { Metadata } from 'next';
import { copy } from '@/lib/copy';
import { ComingSoon } from '../coming-soon';

export const metadata: Metadata = { title: copy.settings.sections.privacy };

export default function Page() {
  return <ComingSoon title={copy.settings.sections.privacy} />;
}
