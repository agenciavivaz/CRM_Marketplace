import type { NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  // Webhooks e workers ficam fora: precisam do corpo bruto e não têm sessão.
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/webhooks|api/workers|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
