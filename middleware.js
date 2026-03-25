import { NextResponse } from 'next/server'

export function middleware(request) {
  // Only protect /prvt and its subpages
  if (request.nextUrl.pathname.startsWith('/prvt')) {
    const authHeader = request.headers.get('authorization')
    const username = 'rtuisrhtih@12050912!%'
    // const password = 'LUGYjgvgkUVOtu^%*68UBKVH9Y)*69t7GH8-95676^&^U&&(%$#jrn'
    const password = 'dobidobi'
    const expected = 'Basic ' + Buffer.from(`${username}:${password}`).toString('base64')

    if (authHeader !== expected) {
      // Redirect to custom login page for /prvt
      return NextResponse.redirect(new URL('/prvt/login', request.url));
    }
  }
  return NextResponse.next()
}
