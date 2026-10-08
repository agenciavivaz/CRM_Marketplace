import 'server-only';
import { createClient } from '@supabase/supabase-js';
import { serviceRoleEnv } from '@/lib/env';
import type { Database } from './database.types';

/**
 * Cliente com service role: ignora RLS. Só para webhooks, workers e admin da plataforma —
 * sempre filtrando por org_id explicitamente. Nunca importar em código de client.
 */
export function createAdminClient() {
  const env = serviceRoleEnv();
  return createClient<Database>(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
