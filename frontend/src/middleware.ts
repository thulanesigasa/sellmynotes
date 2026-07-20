import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/['"]/g, '').trim();
  const supabaseAnonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').replace(/['"]/g, '').trim();

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // 1. Fetch user session using the cookie-based client
  let {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;

  // 2. If no user from cookie, check Authorization header (for API routes)
  if (!user && path.startsWith('/api') && request.headers.has('Authorization')) {
    const authHeader = request.headers.get('Authorization');
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const supabaseWithToken = createServerClient(
        supabaseUrl,
        supabaseAnonKey,
        {
          cookies: {
            getAll() {
              return [];
            },
            setAll() {},
          },
          global: {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        }
      );
      const { data: { user: tokenUser } } = await supabaseWithToken.auth.getUser();
      user = tokenUser;
    }
  }

  // 3. Route guarding logic
  const isPublicApiRoute = path.startsWith('/api/payfast/itn');

  // Unauthenticated user checks
  if (!user) {
    const protectedRoutes = ['/seller', '/library', '/upload', '/wishlist', '/profile', '/explore'];
    if (protectedRoutes.some(route => path.startsWith(route)) || path.startsWith('/admin')) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }

    if (path.startsWith('/api') && !isPublicApiRoute) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  // 4. Admin route guard — role must be 'admin' in profiles table
  if (user && (path.startsWith('/admin') || path.startsWith('/api/admin'))) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      // Authenticated but not admin — redirect to dashboard
      const url = request.nextUrl.clone();
      url.pathname = '/seller';
      return NextResponse.redirect(url);
    }
  }

  // 5. Redirect authenticated users away from auth pages
  if (user && (path === '/login' || path === '/signup')) {
    const url = request.nextUrl.clone();
    url.pathname = '/library';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - files ending with common media extensions
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
