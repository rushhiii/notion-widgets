import { NextResponse } from 'next/server'

export function middleware(request) {
  const url = request.nextUrl;
  const isPrvt = url.pathname.startsWith('/prvt');
  const isLogin = url.pathname === '/prvt/login';
  const isNotFound = url.pathname === '/prvt/not-found';
  const cookie = request.cookies.get('prvtAuth');

  // If user is already authenticated, block access to login page
  if (isLogin && cookie?.value === '1') {
    return NextResponse.redirect(new URL('/prvt', request.url));
  }

  // If not authenticated and not on login or not-found, redirect to login
  if (isPrvt && !isLogin && !isNotFound && cookie?.value !== '1') {
    return NextResponse.redirect(new URL('/prvt/login', request.url));
  }

  return NextResponse.next();
}
