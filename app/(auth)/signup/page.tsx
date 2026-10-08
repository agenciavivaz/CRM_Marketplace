import type { Metadata } from 'next';
import { copy } from '@/lib/copy';
import { AuthForm } from '../auth-form';

export const metadata: Metadata = { title: copy.auth.signup };

export default function SignupPage() {
  return (
    <div className="grid gap-6">
      <h1 className="text-xl font-semibold">{copy.auth.signupTitle}</h1>
      <AuthForm mode="signup" />
    </div>
  );
}
