import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const rawPath = request.nextUrl.pathname;
  const normalizedPath = normalizePath(rawPath); // renser og sikrer mot triksing

  const mainPass = request.cookies.get('main_password')?.value;
  const adminPass = request.cookies.get('admin_password')?.value;

  const isMainPage = normalizedPath.startsWith('/main_page');
  const isAdminPage = normalizedPath.startsWith('/admin');

  if (isMainPage && mainPass !== process.env.MAIN_PAGE_PASSWORD) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (isAdminPage && adminPass !== process.env.ADMIN_PAGE_PASSWORD) {
    return NextResponse.redirect(new URL('/admin_login', request.url));
  }

  return NextResponse.next();
}

function normalizePath(path: string): string {
  try {
    // Fjerner dobbelskråstreker og dekoder URL-komponenter
    const decoded = decodeURIComponent(path);
    return decoded.replace(/\/{2,}/g, '/');
  } catch (err) {
    // Hvis noen prøver noe rart som %E0 osv., fallback
    return '/';
  }
}

export const config = {
  matcher: [
    '/main_page/:path*',
    '/admin/:path*',
  ],
};
