'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { canManage, requireOrg } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { copy } from '@/lib/copy';

export interface GeneralState {
  error?: string;
  ok?: boolean;
}

const schema = z.object({ slug: z.string().min(1), name: z.string().trim().min(1).max(80) });

export async function updateGeneral(_: GeneralState, form: FormData): Promise<GeneralState> {
  const parsed = schema.safeParse({ slug: form.get('slug'), name: form.get('name') });
  if (!parsed.success) return { error: copy.org.createText };
  const { org, role, userId } = await requireOrg(parsed.data.slug);
  if (!canManage(role)) return { error: copy.errors.forbidden };

  const supabase = await createClient();
  const { error } = await supabase
    .from('organizations')
    .update({ name: parsed.data.name })
    .eq('id', org.id);
  if (error) return { error: copy.errors.generic.title };
  await supabase.from('audit_log').insert({
    org_id: org.id,
    actor_id: userId,
    action: 'organization.renamed',
    entity: 'organization',
    entity_id: org.id,
  });
  revalidatePath(`/${org.slug}`, 'layout');
  return { ok: true };
}
