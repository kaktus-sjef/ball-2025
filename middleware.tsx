import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const mainPass = request.cookies.get('main_password')?.value;
  const adminPass = request.cookies.get('admin_password')?.value;

  if (pathname.startsWith('/main_page') && mainPass !== process.env.MAIN_PAGE_PASSWORD) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (pathname.startsWith('/admin') && adminPass !== process.env.ADMIN_PAGE_PASSWORD) {
    return NextResponse.redirect(new URL('/admin_login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/main_page/:path*', '/admin/:path*'],
};
