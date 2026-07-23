import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

async function withAuth(): Promise<Record<string, string>> {
  const cookieStore = await cookies();
  const token = cookieStore.get('moonvault_token')?.value;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function GET() {
  const headers = await withAuth();
  const res = await fetch(`${process.env.API_URL}/me/profile`, {
    headers,
    cache: 'no-store',
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

export async function PATCH(req: NextRequest) {
  const headers = await withAuth();
  const body = await req.json();
  const res = await fetch(`${process.env.API_URL}/me/profile`, {
    method: 'PATCH',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
