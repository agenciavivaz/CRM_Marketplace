'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { copy } from '@/lib/copy';
import { sendMagicLink, signIn, signUp, type AuthState } from './actions';

export function AuthForm({ mode, next }: { mode: 'login' | 'signup'; next?: string }) {
  const [state, action, pending] = useActionState<AuthState, FormData>(
    mode === 'login' ? signIn : signUp,
    {},
  );
  const [magic, magicAction, magicPending] = useActionState<AuthState, FormData>(sendMagicLink, {});
  const feedback = magic.message ?? state.message;
  const error = state.error ?? magic.error;

  return (
    <div className="grid gap-4">
      {feedback && (
        <Alert>
          <AlertDescription className="text-foreground">{feedback}</AlertDescription>
        </Alert>
      )}
      {error && (
        <Alert variant="destructive">
          <AlertDescription className="text-destructive">{error}</AlertDescription>
        </Alert>
      )}
      <form className="grid gap-4">
        <input type="hidden" name="next" value={next ?? ''} />
        <div className="grid gap-2">
          <Label htmlFor="email">{copy.auth.email}</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            required
            key={state.email ?? magic.email ?? ''}
            defaultValue={state.email ?? magic.email}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="password">{copy.auth.password}</Label>
          <Input
            id="password"
            name="password"
            type="password"
            minLength={8}
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          />
          {mode === 'signup' && (
            <p className="text-muted-foreground text-xs">{copy.auth.passwordHelp}</p>
          )}
        </div>
        <Button formAction={action} disabled={pending} size="lg">
          {mode === 'login' ? copy.auth.login : copy.auth.signup}
        </Button>
        {mode === 'login' && (
          <>
            <div className="text-muted-foreground flex items-center gap-3 text-xs">
              <span className="bg-border h-px flex-1" />
              {copy.auth.or}
              <span className="bg-border h-px flex-1" />
            </div>
            <Button
              formAction={magicAction}
              formNoValidate
              variant="outline"
              disabled={magicPending}
              size="lg"
            >
              {copy.auth.magicLink}
            </Button>
          </>
        )}
      </form>
      <p className="text-muted-foreground text-center text-sm">
        {mode === 'login' ? copy.auth.noAccount : copy.auth.hasAccount}{' '}
        <Link
          className="text-primary font-medium underline-offset-4 hover:underline"
          href={mode === 'login' ? '/signup' : '/login'}
        >
          {mode === 'login' ? copy.auth.signup : copy.auth.login}
        </Link>
      </p>
    </div>
  );
}
