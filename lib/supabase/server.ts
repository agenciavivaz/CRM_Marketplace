import 'server-only';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { supabaseEnv } from '@/lib/env';
import type { Database } from './database.types';

/** Cliente com a sessão do usuário (respeita RLS). Use em Server Components, Actions e Route Handlers. */
export async function createClient() {
  const cookieStore = await cookies(); // primeiro: torna a rota dinâmica (nada de prerender com env)
  const env = supabaseEnv();
  return createServerClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (toSet) => {
          try {
            toSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch {
            // Server Component: o middleware renova a sessão.
          }
        },
      },
    },
  );
}
