import Link from 'next/link';
import { copy } from '@/lib/copy';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-4 py-10">
      <Link href="/" className="text-primary mb-8 text-lg font-semibold tracking-tight">
        {copy.app.name}
      </Link>
      <div className="bg-card w-full max-w-sm rounded-xl border p-6 shadow-xs">{children}</div>
    </main>
  );
}
