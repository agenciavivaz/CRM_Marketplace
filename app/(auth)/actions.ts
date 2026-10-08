'use server';

import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { copy, fmt } from '@/lib/copy';
import { appUrl } from '@/lib/env';
import { logger } from '@/lib/logger';

export interface AuthState {
  error?: string;
  message?: string;
  email?: string;
}

const emailSchema = z.email();
const credentials = z.object({ email: z.email(), password: z.string().min(8) });

function safeNext(value: FormDataEntryValue | null): string {
  const next = typeof value === 'string' ? value : '';
  return next.startsWith('/') && !next.startsWith('//') ? next : '/';
}

async function origin() {
  const h = await headers();
  const host = h.get('x-forwarded-host') ?? h.get('host');
  const proto = h.get('x-forwarded-proto') ?? 'https';
  return host ? `${proto}://${host}` : appUrl();
}

export async function signIn(_: AuthState, form: FormData): Promise<AuthState> {
  const parsed = credentials.safeParse({
    email: form.get('email'),
    password: form.get('password'),
  });
  const email = String(form.get('email') ?? '');
  if (!parsed.success) return { error: copy.auth.invalidCredentials, email };
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) return { error: copy.auth.invalidCredentials, email };
  redirect(safeNext(form.get('next')));
}

export async function sendMagicLink(_: AuthState, form: FormData): Promise<AuthState> {
  const email = emailSchema.safeParse(form.get('email'));
  if (!email.success)
    return { error: copy.auth.invalidCredentials, email: String(form.get('email') ?? '') };
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email: email.data,
    options: {
      emailRedirectTo: `${await origin()}/auth/callback?next=${encodeURIComponent(safeNext(form.get('next')))}`,
    },
  });
  if (error) {
    logger.warn('magic link falhou', { outcome: error.code ?? error.name });
    return { error: copy.errors.generic.title, email: email.data };
  }
  return { email: email.data, message: fmt(copy.auth.magicLinkSent, { email: email.data }) };
}

export async function signUp(_: AuthState, form: FormData): Promise<AuthState> {
  const parsed = credentials.safeParse({
    email: form.get('email'),
    password: form.get('password'),
  });
  if (!parsed.success)
    return { error: copy.auth.passwordHelp, email: String(form.get('email') ?? '') };
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    ...parsed.data,
    options: { emailRedirectTo: `${await origin()}/auth/callback?next=/onboarding/org` },
  });
  if (error) {
    logger.warn('signup falhou', { outcome: error.code ?? error.name });
    return { error: copy.errors.generic.title };
  }
  if (data.session) redirect('/onboarding/org'); // confirmação de e-mail desligada
  return { message: fmt(copy.auth.signupSent, { email: parsed.data.email }) };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}
