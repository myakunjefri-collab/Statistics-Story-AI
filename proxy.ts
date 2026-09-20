import { type NextRequest, NextResponse } from 'next/server'
import { SESSION_COOKIE_NAME } from './src/lib/auth/session'

/**
 * Next.js 16 Early Route Interceptor (proxy.ts)
 * Replaces deprecated middleware.ts convention.
 * Performs optimistic redirect checks before component rendering.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Ignore static assets, public files, and Next.js internal bundles
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next()
  }

  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)
  const hasSession = Boolean(sessionCookie?.value)

  const isAuthRoute = pathname === '/login' || pathname === '/register'
  const isProtectedRoute =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/input') ||
    pathname.startsWith('/hasil') ||
    pathname.startsWith('/riwayat')

  // If user is already authenticated and visits login/register -> redirect to dashboard
  if (isAuthRoute && hasSession) {
    const dashboardUrl = new URL('/dashboard', request.url)
    return NextResponse.redirect(dashboardUrl)
  }

  // If user is unauthenticated and tries to access protected routes -> redirect to login
  if (isProtectedRoute && !hasSession) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('from', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
