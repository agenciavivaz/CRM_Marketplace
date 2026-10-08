import type { Metadata } from 'next';
import { requireUser } from '@/lib/auth';
import { copy } from '@/lib/copy';
import { CreateOrgForm } from './form';

export const metadata: Metadata = { title: copy.org.create };

export default async function CreateOrgPage() {
  await requireUser();
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-4 py-10">
      <p className="text-primary mb-8 text-lg font-semibold tracking-tight">{copy.app.name}</p>
      <div className="bg-card grid w-full max-w-sm gap-6 rounded-xl border p-6 shadow-xs">
        <div className="grid gap-2">
          <h1 className="text-xl font-semibold">{copy.org.createTitle}</h1>
          <p className="text-muted-foreground text-sm">{copy.org.createText}</p>
        </div>
        <CreateOrgForm />
      </div>
    </main>
  );
}
