'use client';
import * as React from 'react';
import { DropdownMenu as DM } from 'radix-ui';
import { cn } from '@/lib/utils';

const DropdownMenu = DM.Root;
const DropdownMenuTrigger = DM.Trigger;

function DropdownMenuContent({
  className,
  sideOffset = 4,
  ...props
}: React.ComponentProps<typeof DM.Content>) {
  return (
    <DM.Portal>
      <DM.Content
        sideOffset={sideOffset}
        className={cn(
          'bg-popover text-popover-foreground z-50 min-w-48 overflow-hidden rounded-md border p-1 shadow-md',
          className,
        )}
        {...props}
      />
    </DM.Portal>
  );
}
function DropdownMenuItem({ className, ...props }: React.ComponentProps<typeof DM.Item>) {
  return (
    <DM.Item
      className={cn(
        'focus:bg-accent relative flex cursor-default items-center gap-2 rounded-sm px-2 py-2 text-sm outline-none select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:size-4',
        className,
      )}
      {...props}
    />
  );
}
function DropdownMenuLabel({ className, ...props }: React.ComponentProps<typeof DM.Label>) {
  return (
    <DM.Label
      className={cn('text-muted-foreground px-2 py-1.5 text-xs font-medium', className)}
      {...props}
    />
  );
}
function DropdownMenuSeparator({ className, ...props }: React.ComponentProps<typeof DM.Separator>) {
  return <DM.Separator className={cn('bg-border -mx-1 my-1 h-px', className)} {...props} />;
}

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
};
