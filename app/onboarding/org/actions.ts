'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { requireUser } from '@/lib/auth';
import { copy } from '@/lib/copy';
import { logger } from '@/lib/logger';

export interface CreateOrgState {
  error?: string;
}

const schema = z.object({ name: z.string().trim().min(1).max(80) });

export async function createOrganization(
  _: CreateOrgState,
  form: FormData,
): Promise<CreateOrgState> {
  await requireUser();
  const parsed = schema.safeParse({ name: form.get('name') });
  if (!parsed.success) return { error: copy.org.createText };

  const supabase = await createClient();
  const { data, error } = await supabase.rpc('create_organization', { p_name: parsed.data.name });
  if (error || !data) {
    logger.error('create_organization falhou', { outcome: error?.code });
    return { error: `${copy.errors.generic.title} ${copy.errors.generic.text}` };
  }
  redirect(`/${data.slug}/dashboard`);
}
