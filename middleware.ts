// middleware.ts
import { NextResponse } from 'next/server';
import { auth } from './auth';
 
export default auth((req) => {
  console.log('Middleware executing for path:', req.nextUrl.pathname);
  const isLoggedIn = !!req.auth;
  console.log('Auth status:', { isLoggedIn });
  
  // Public paths that don't require authentication
  const publicPaths = ['/login', '/register', '/forgot-password'];
  const isPublicPath = publicPaths.some(path => 
    req.nextUrl.pathname.startsWith(path)
  );
  console.log('Path status:', { isPublicPath, path: req.nextUrl.pathname });
  
  // If the user is logged in and trying to access a public path, redirect to dashboard
  if (isLoggedIn && isPublicPath) {
    console.log('Logged in user accessing public path - redirecting to dashboard');
    return NextResponse.redirect(new URL('/dashboard', req.nextUrl.origin));
  }
  
  // If not logged in and trying to access a protected path, redirect to login
  if (!isLoggedIn && !isPublicPath && !req.nextUrl.pathname.startsWith('/api')) {
    // We don't want to redirect API calls, which would break client components
    if (req.nextUrl.pathname !== '/' && !req.nextUrl.pathname.includes('.')) {
      console.log('Unauthenticated user accessing protected path - redirecting to login');
      return NextResponse.redirect(new URL('/login', req.nextUrl.origin));
    }
  }

  console.log('Middleware allowing request to proceed');
  return NextResponse.next();
});

// Use a more specific matcher to avoid applying middleware to static files
export const config = {
  matcher: [
    '/((?!api/auth|_next/static|_next/image|.*\\.png$|.*\\.svg$|.*\\.jpg$|.*\\.ico$).*)'
  ],
};