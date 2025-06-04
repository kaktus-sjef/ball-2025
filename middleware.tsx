import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const encodedPath = request.nextUrl.pathname;
  const pathname = decodeURIComponent(encodedPath); // sikrer mot %2f

  const mainPass = request.cookies.get('main_password')?.value;
  const adminPass = request.cookies.get('admin_password')?.value;

  const isMainPage = pathname.startsWith('/main_page');
  const isAdminPage = pathname.startsWith('/admin');

  if (isMainPage && mainPass !== process.env.MAIN_PAGE_PASSWORD) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (isAdminPage && adminPass !== process.env.ADMIN_PAGE_PASSWORD) {
    return NextResponse.redirect(new URL('/admin_login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/main_page',
    '/main_page/',
    '/main_page/:path*',
    '/admin',
    '/admin/',
    '/admin/:path*',
  ],
};
