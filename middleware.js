import { NextResponse } from 'next/server'

export function middleware(request) {
  // Only protect /prvt and its subpages
  if (request.nextUrl.pathname.startsWith('/prvt')) {
    const authHeader = request.headers.get('authorization')
    const username = 'rtuisrhtih@12050912!%'
    const password = 'LUGYjgvgkUVOtu^%*68UBKVH9Y)*69t7GH8-95676^&^U&&(%$#jrn'
    const expected = 'Basic ' + Buffer.from(`${username}:${password}`).toString('base64')

    if (authHeader !== expected) {
      return new NextResponse('Authentication required', {
        status: 401,
        headers: { 'WWW-Authenticate': 'Basic' },
      })
    }
  }
  return NextResponse.next()
}
