'use client';

import { useActionState, useEffect } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { copy } from '@/lib/copy';
import { updateGeneral, type GeneralState } from './actions';

export function GeneralForm({
  slug,
  name,
  canEdit,
}: {
  slug: string;
  name: string;
  canEdit: boolean;
}) {
  const [state, action, pending] = useActionState<GeneralState, FormData>(updateGeneral, {});
  useEffect(() => {
    if (state.ok) toast.success(copy.settings.general.saved);
    if (state.error) toast.error(state.error);
  }, [state]);

  return (
    <form action={action} className="grid gap-4">
      <input type="hidden" name="slug" value={slug} />
      <div className="grid gap-2">
        <Label htmlFor="name">{copy.settings.general.storeName}</Label>
        <Input
          id="name"
          name="name"
          defaultValue={name}
          maxLength={80}
          required
          disabled={!canEdit}
        />
        <p className="text-muted-foreground text-xs">{copy.settings.general.storeNameHelp}</p>
      </div>
      {canEdit && (
        <Button type="submit" disabled={pending} className="justify-self-start">
          {copy.settings.general.save}
        </Button>
      )}
    </form>
  );
}
