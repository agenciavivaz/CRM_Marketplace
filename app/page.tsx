import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { copy } from '@/lib/copy';
import { homePath } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect(await homePath());

  return (
    <main className="mx-auto flex min-h-dvh max-w-2xl flex-col justify-center gap-8 px-4 py-16">
      <p className="text-primary text-sm font-semibold tracking-tight">{copy.app.name}</p>
      <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
        {copy.app.taglineSafe}
      </h1>
      <p className="text-muted-foreground text-lg">{copy.onboarding.welcome.text}</p>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button asChild size="lg">
          <Link href="/signup">{copy.auth.signup}</Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link href="/login">{copy.auth.login}</Link>
        </Button>
      </div>
    </main>
  );
}
