// app/api/login/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const body = await request.json();
  const password = body.password;

  if (password === process.env.MAIN_PAGE_PASSWORD) {
    const response = NextResponse.json({ success: true });
    response.cookies.set('main_password', password, {
      path: '/',
      maxAge: 60 * 60 * 24, // 1 dag
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    });
    return response;
  }

  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
