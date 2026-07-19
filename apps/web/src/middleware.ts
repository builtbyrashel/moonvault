import { NextRequest, NextResponse } from 'next/server';

const PROTECTED_PATHS = ['/dashboard'];

export function middleware(req: NextRequest) {
  const token = req.cookies.get('moonvault_token');
  const isProtected = PROTECTED_PATHS.some((path) =>
    req.nextUrl.pathname.startsWith(path),
  );

  if (isProtected && !token) {
    const loginUrl = new URL('/login', req.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
