import { NextResponse } from 'next/server';

export function middleware(request) {
  const mainPassword = process.env.MAIN_PAGE_PASSWORD;
  const adminPassword = process.env.ADMIN_PAGE_PASSWORD;

  const url = new URL(request.url);
  const pathname = url.pathname;

  const cookies = request.cookies;

  // Beskytt /main
  if (pathname.startsWith('/main')) {
    const cookie = request.cookies.get('main_password');
    if (cookie !== mainPassword) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Beskytt /admin
  if (pathname.startsWith('/admin') && pathname !== '/admin_login') {
    const cookie = request.cookies.get('admin_password');

    if (cookie !== adminPassword) {
      return NextResponse.redirect(new URL('/admin_login', request.url));
    }
  }
  

  return NextResponse.next();
}

export const config = {
    matcher: ['/main/:path*', '/admin/:path*'],
  };
  