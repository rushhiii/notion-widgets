import { NextResponse } from 'next/server'

export function middleware(request) {
  const url = request.nextUrl;
  const isPrvt = url.pathname.startsWith('/prvt');
  const isLogin = url.pathname === '/prvt/login';
  const isNotFound = url.pathname === '/prvt/not-found';
  const cookie = request.cookies.get('prvtAuth');

  // Allow unauthenticated access to /prvt/login and /prvt/not-found
  if (isLogin || isNotFound) {
    return NextResponse.next();
  }

  // If user is already authenticated, block access to login page
  if (isPrvt && cookie?.value === '1') {
    return NextResponse.next();
  }

  // If not authenticated and trying to access any other /prvt page, redirect to login
  if (isPrvt && cookie?.value !== '1') {
    return NextResponse.redirect(new URL('/prvt/login', request.url));
  }

  return NextResponse.next();
}
