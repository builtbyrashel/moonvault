import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const body = await req.json();

  const apiRes = await fetch(`${process.env.API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!apiRes.ok) {
    const error = await apiRes.json().catch(() => ({ message: 'Login failed' }));
    return NextResponse.json(error, { status: apiRes.status });
  }

  const { accessToken } = (await apiRes.json()) as { accessToken: string };

  const response = NextResponse.json({ success: true });
  response.cookies.set('moonvault_token', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // matches the JWT's 7-day expiresIn
  });
  return response;
}