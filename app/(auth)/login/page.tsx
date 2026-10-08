import type { Metadata } from 'next';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { copy } from '@/lib/copy';
import { AuthForm } from '../auth-form';

export const metadata: Metadata = { title: copy.auth.login };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next, error } = await searchParams;
  return (
    <div className="grid gap-6">
      <h1 className="text-xl font-semibold">{copy.auth.loginTitle}</h1>
      {error === 'link' && (
        <Alert variant="destructive">
          <AlertDescription className="text-destructive">{copy.auth.linkExpired}</AlertDescription>
        </Alert>
      )}
      <AuthForm mode="login" next={next} />
    </div>
  );
}
