'use client';

import { Button } from '@/components/ui/button';
import { copy } from '@/lib/copy';

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-3 px-4 text-center">
      <h1 className="text-xl font-semibold">{copy.errors.generic.title}</h1>
      <p className="text-muted-foreground max-w-sm text-sm">{copy.errors.generic.text}</p>
      <Button onClick={reset} className="mt-2">
        {copy.errors.generic.cta}
      </Button>
    </main>
  );
}
