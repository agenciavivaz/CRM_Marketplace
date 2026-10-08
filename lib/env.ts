import { z } from 'zod';

/**
 * Variáveis de ambiente do servidor, validadas sob demanda.
 * Cada grupo é lido só quando usado, para que uma variável de uma fase futura
 * (ex.: Bling) não quebre o build nem as páginas que não dependem dela.
 */

const nonEmpty = z.string().min(1);

function read<T extends z.ZodRawShape>(group: string, shape: T): z.infer<z.ZodObject<T>> {
  const parsed = z.object(shape).safeParse(process.env);
  if (!parsed.success) {
    const missing = parsed.error.issues.map((i) => i.path.join('.')).join(', ');
    throw new Error(`Configuração ausente (${group}): ${missing}`);
  }
  return parsed.data;
}

export function supabaseEnv() {
  return read('supabase', {
    NEXT_PUBLIC_SUPABASE_URL: z.url(),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: nonEmpty,
  });
}

export function serviceRoleEnv() {
  return read('service role', {
    NEXT_PUBLIC_SUPABASE_URL: z.url(),
    SUPABASE_SERVICE_ROLE_KEY: nonEmpty,
  });
}

export function securityEnv() {
  return read('segurança', {
    ENCRYPTION_KEY: nonEmpty,
    CPF_HASH_PEPPER: nonEmpty,
  });
}

export function cronEnv() {
  return read('workers', { CRON_SECRET: z.string().min(16) });
}

export function blingEnv() {
  return read('bling', {
    BLING_CLIENT_ID: nonEmpty,
    BLING_CLIENT_SECRET: nonEmpty,
    BLING_REDIRECT_URI: z.url(),
  });
}

export function appUrl(): string {
  const url = process.env.NEXT_PUBLIC_APP_URL ?? process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (!url) return 'http://localhost:3000';
  return url.startsWith('http') ? url.replace(/\/$/, '') : `https://${url}`;
}

export const isDemoMode = () => process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
