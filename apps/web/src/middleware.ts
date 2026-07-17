import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Only handle auth callback redirects
  if (request.nextUrl.pathname === '/auth/callback') {
    // Redirect OAuth errors server-side to avoid page flash
    const error = request.nextUrl.searchParams.get('error');
    if (error) {
      return NextResponse.redirect(
        new URL(`/sign-in?error=${encodeURIComponent(error)}`, request.url)
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/auth/callback'],
};
