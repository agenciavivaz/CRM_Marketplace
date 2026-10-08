'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ChevronsUpDownIcon,
  HomeIcon,
  ListFilterIcon,
  LogOutIcon,
  MenuIcon,
  PlusIcon,
  SendIcon,
  SettingsIcon,
  ShieldIcon,
  UsersIcon,
  WorkflowIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { copy } from '@/lib/copy';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { signOut } from '@/app/(auth)/actions';

interface OrgSummary {
  slug: string;
  name: string;
}

interface Props {
  org: OrgSummary;
  orgs: OrgSummary[];
  email: string | null;
  isAdmin: boolean;
  children: React.ReactNode;
}

function navItems(slug: string) {
  return [
    { href: `/${slug}/dashboard`, label: copy.nav.dashboard, icon: HomeIcon, mobile: true },
    { href: `/${slug}/customers`, label: copy.nav.customers, icon: UsersIcon, mobile: true },
    { href: `/${slug}/journeys`, label: copy.nav.journeys, icon: WorkflowIcon, mobile: true },
    { href: `/${slug}/segments`, label: copy.nav.segments, icon: ListFilterIcon, mobile: false },
    { href: `/${slug}/campaigns`, label: copy.nav.campaigns, icon: SendIcon, mobile: false },
    { href: `/${slug}/settings`, label: copy.nav.settings, icon: SettingsIcon, mobile: false },
  ];
}

function NavLinks({
  slug,
  isAdmin,
  onNavigate,
}: {
  slug: string;
  isAdmin: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const items = navItems(slug);
  return (
    <nav className="grid gap-1">
      {items.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'text-muted-foreground hover:bg-accent hover:text-accent-foreground flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
              active && 'bg-accent text-accent-foreground',
            )}
          >
            <item.icon className="size-4" />
            {item.label}
          </Link>
        );
      })}
      {isAdmin && (
        <Link
          href="/admin"
          onClick={onNavigate}
          className="text-muted-foreground hover:bg-accent flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium"
        >
          <ShieldIcon className="size-4" />
          {copy.nav.admin}
        </Link>
      )}
    </nav>
  );
}

function OrgSwitcher({ org, orgs, email }: Pick<Props, 'org' | 'orgs' | 'email'>) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-auto w-full justify-between px-3 py-2 text-left">
          <span className="grid min-w-0">
            <span className="truncate font-semibold">{org.name}</span>
            {email && (
              <span className="text-muted-foreground truncate text-xs font-normal">{email}</span>
            )}
          </span>
          <ChevronsUpDownIcon className="text-muted-foreground size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        {orgs.length > 1 && (
          <>
            <DropdownMenuLabel>{copy.nav.switchStore}</DropdownMenuLabel>
            {orgs.map((o) => (
              <DropdownMenuItem key={o.slug} asChild>
                <Link href={`/${o.slug}/dashboard`}>{o.name}</Link>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
          </>
        )}
        <DropdownMenuItem asChild>
          <Link href="/onboarding/org">
            <PlusIcon />
            {copy.nav.newStore}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => void signOut()}>
          <LogOutIcon />
          {copy.nav.signOut}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function AppShell({ org, orgs, email, isAdmin, children }: Props) {
  const pathname = usePathname();
  const mobileItems = navItems(org.slug).filter((i) => i.mobile);

  return (
    <div className="min-h-dvh md:grid md:grid-cols-[16rem_1fr]">
      {/* Desktop */}
      <aside className="bg-card sticky top-0 hidden h-dvh flex-col gap-6 border-r p-3 md:flex">
        <p className="text-primary px-3 pt-2 text-sm font-semibold tracking-tight">
          {copy.app.name}
        </p>
        <OrgSwitcher org={org} orgs={orgs} email={email} />
        <NavLinks slug={org.slug} isAdmin={isAdmin} />
      </aside>

      {/* Mobile: topo */}
      <header className="bg-card/95 sticky top-0 z-30 flex items-center justify-between border-b px-4 py-2 backdrop-blur md:hidden">
        <span className="truncate font-semibold">{org.name}</span>
      </header>

      <main className="min-w-0 px-4 pt-6 pb-24 md:px-8 md:pb-10">{children}</main>

      {/* Mobile: barra inferior */}
      <nav className="bg-card fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t pb-[env(safe-area-inset-bottom)] md:hidden">
        {mobileItems.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'text-muted-foreground flex flex-col items-center gap-1 py-2.5 text-xs',
                active && 'text-primary',
              )}
            >
              <item.icon className="size-5" />
              {item.label}
            </Link>
          );
        })}
        <Sheet>
          <SheetTrigger className="text-muted-foreground flex flex-col items-center gap-1 py-2.5 text-xs">
            <MenuIcon className="size-5" />
            {copy.nav.more}
          </SheetTrigger>
          <SheetContent
            side="bottom"
            className="gap-4 p-4 pt-12 pb-[calc(1rem+env(safe-area-inset-bottom))]"
          >
            <SheetTitle className="sr-only">{copy.nav.more}</SheetTitle>
            <OrgSwitcher org={org} orgs={orgs} email={email} />
            <NavLinks slug={org.slug} isAdmin={isAdmin} />
          </SheetContent>
        </Sheet>
      </nav>
    </div>
  );
}
