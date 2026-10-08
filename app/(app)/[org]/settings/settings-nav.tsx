'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { copy } from '@/lib/copy';

const SECTIONS = [
  'general',
  'integrations',
  'channels',
  'enrichment',
  'messaging',
  'credits',
  'team',
  'privacy',
] as const;

export function SettingsNav({ slug }: { slug: string }) {
  const pathname = usePathname();
  return (
    <nav className="-mx-4 flex gap-1 overflow-x-auto px-4 pb-2 md:mx-0 md:flex-col md:overflow-visible md:px-0">
      {SECTIONS.map((s) => {
        const href = `/${slug}/settings/${s}`;
        const active = pathname === href;
        return (
          <Link
            key={s}
            href={href}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'text-muted-foreground hover:bg-accent shrink-0 rounded-md px-3 py-2 text-sm whitespace-nowrap',
              active && 'bg-accent text-accent-foreground font-medium',
            )}
          >
            {copy.settings.sections[s]}
          </Link>
        );
      })}
    </nav>
  );
}
