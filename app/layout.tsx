import type { Metadata, Viewport } from 'next';
import { Toaster } from '@/components/ui/sonner';
import { copy } from '@/lib/copy';
import './globals.css';

export const metadata: Metadata = {
  title: { default: copy.app.name, template: `%s · ${copy.app.name}` },
  description: copy.app.tagline,
  robots: { index: false, follow: false },
};

export const viewport: Viewport = { width: 'device-width', initialScale: 1, themeColor: '#0f9d76' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="min-h-dvh font-sans">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
