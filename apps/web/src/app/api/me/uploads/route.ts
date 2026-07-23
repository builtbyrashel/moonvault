import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(req: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get('moonvault_token')?.value;
  const { searchParams } = new URL(req.url);
  const qs = searchParams.toString();

  const res = await fetch(
    `${process.env.API_URL}/me/uploads${qs ? `?${qs}` : ''}`,
    { headers: token ? { Authorization: `Bearer ${token}` } : {}, cache: 'no-store' },
  );
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}