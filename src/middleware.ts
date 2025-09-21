import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  try {
    const response = NextResponse.next({
      request: {
        headers: req.headers,
      },
    });

    const { pathname } = req.nextUrl;

    // Allow internal Next.js and API routes to pass through untouched
    if (
      pathname.startsWith('/_next') ||
      pathname.startsWith('/api') ||
      pathname.startsWith('/public') ||
      pathname.startsWith('/root') // internal app directory base via rewrites
    ) {
      if (pathname.startsWith('/root')) {
        return NextResponse.redirect(new URL('/home', req.url));
      }
      return response;
    }

    // Allow Server Actions POST requests to pass (identified by special header)
    if (req.headers.get('Next-Action')) {
      return response;
    }

    // Define valid routes
    const validRoutes = ['/home', '/signup', '/login', '/loading', '/summary'];
    
    // Redirect root path to /home
    if (pathname === '/') {
      return NextResponse.redirect(new URL('/home', req.url));
    }
    
    // Redirect invalid paths to /home
    if (!validRoutes.includes(pathname)) {
      return NextResponse.redirect(new URL('/home', req.url));
    }

    return response;
  } catch (error) {
    console.error('Middleware error:', error);
    // Return the request as-is if there's an error
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    // Match all paths except for:
    // - _next (all internal Next.js assets and endpoints)
    // - api (API routes)
    // - common static file extensions
    // - favicon
    '/((?!_next/|api|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|mp4)|favicon.ico).*)',
  ],
}; 