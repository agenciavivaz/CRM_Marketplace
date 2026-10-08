import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

const PUBLIC_PREFIXES = [
  '/login',
  '/signup',
  '/auth',
  '/p/',
  '/c/',
  '/r/',
  '/api/',
  '/termos',
  '/privacidade',
];

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return response; // sem config: a página mostra o erro amigável

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (toSet) => {
        toSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        toSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isPublic = path === '/' || PUBLIC_PREFIXES.some((p) => path.startsWith(p));
  if (!user && !isPublic) {
    const login = request.nextUrl.clone();
    login.pathname = '/login';
    login.search = `?next=${encodeURIComponent(path)}`;
    return NextResponse.redirect(login);
  }
  return response;
}
