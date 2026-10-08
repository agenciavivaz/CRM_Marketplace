'use client';

import { useActionState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { copy } from '@/lib/copy';
import { createOrganization, type CreateOrgState } from './actions';

export function CreateOrgForm() {
  const [state, action, pending] = useActionState<CreateOrgState, FormData>(createOrganization, {});
  return (
    <form action={action} className="grid gap-4">
      {state.error && (
        <Alert variant="destructive">
          <AlertDescription className="text-destructive">{state.error}</AlertDescription>
        </Alert>
      )}
      <div className="grid gap-2">
        <Label htmlFor="name">{copy.org.nameLabel}</Label>
        <Input
          id="name"
          name="name"
          required
          maxLength={80}
          placeholder={copy.org.namePlaceholder}
          autoFocus
        />
      </div>
      <Button type="submit" size="lg" disabled={pending}>
        {copy.org.create}
      </Button>
    </form>
  );
}
