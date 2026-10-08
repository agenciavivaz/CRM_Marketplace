import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { copy } from '@/lib/copy';

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-3 px-4 text-center">
      <h1 className="text-xl font-semibold">{copy.errors.notFound.title}</h1>
      <p className="text-muted-foreground max-w-sm text-sm">{copy.errors.notFound.text}</p>
      <Button asChild className="mt-2">
        <Link href="/">{copy.errors.notFound.cta}</Link>
      </Button>
    </main>
  );
}
