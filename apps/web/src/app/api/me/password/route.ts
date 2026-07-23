import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function PATCH(req: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get('moonvault_token')?.value;
  const body = await req.json();

  const res = await fetch(`${process.env.API_URL}/me/password`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}