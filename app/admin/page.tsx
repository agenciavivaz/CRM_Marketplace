import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PageHeader } from '@/components/empty-state';
import { Card, CardContent } from '@/components/ui/card';
import { homePath, isPlatformAdmin } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { copy } from '@/lib/copy';
import { formatDate } from '@/lib/format';

export const metadata: Metadata = { title: copy.admin.title };

export default async function AdminPage() {
  if (!(await isPlatformAdmin())) notFound();
  const supabase = await createClient(); // RLS libera todas as orgs para platform_admins
  const { data: orgs } = await supabase
    .from('organizations')
    .select('id, name, slug, created_at')
    .order('created_at', { ascending: false });

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <Link href={await homePath()} className="text-muted-foreground text-sm hover:underline">
        ← {copy.common.back}
      </Link>
      <div className="mt-4">
        <PageHeader
          title={copy.admin.title}
          description={`${copy.admin.stores}: ${orgs?.length ?? 0}`}
        />
      </div>
      <Card>
        <CardContent className="p-0">
          {orgs && orgs.length > 0 ? (
            <ul className="divide-y">
              {orgs.map((o) => (
                <li
                  key={o.id}
                  className="flex items-center justify-between gap-3 px-5 py-3 text-sm"
                >
                  <span className="truncate font-medium">{o.name}</span>
                  <span className="text-muted-foreground shrink-0">{formatDate(o.created_at)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground p-5 text-sm">{copy.admin.empty}</p>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
