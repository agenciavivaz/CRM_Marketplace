import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  icon?: LucideIcon;
  title: string;
  text: string;
  cta?: { label: string; href?: string; disabledHint?: string };
}

/** Estados vazios da seção 14.5: o que é a tela + o próximo passo. */
export function EmptyState({ icon: Icon, title, text, cta }: Props) {
  return (
    <div className="bg-card flex flex-col items-center gap-3 rounded-xl border border-dashed px-6 py-12 text-center">
      {Icon && (
        <div className="bg-accent text-accent-foreground flex size-12 items-center justify-center rounded-full">
          <Icon className="size-6" />
        </div>
      )}
      <h2 className="text-base font-semibold">{title}</h2>
      <p className="text-muted-foreground max-w-sm text-sm">{text}</p>
      {cta &&
        (cta.href ? (
          <Button asChild className="mt-2">
            <Link href={cta.href}>{cta.label}</Link>
          </Button>
        ) : (
          <div className="mt-2 grid gap-1">
            <Button disabled>{cta.label}</Button>
            {cta.disabledHint && (
              <p className="text-muted-foreground text-xs">{cta.disabledHint}</p>
            )}
          </div>
        ))}
    </div>
  );
}

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="grid gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {description && <p className="text-muted-foreground text-sm">{description}</p>}
      </div>
      {actions}
    </div>
  );
}
