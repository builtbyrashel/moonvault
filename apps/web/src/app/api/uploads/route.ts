import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get('moonvault_token')?.value;

  const formData = await req.formData();

  const res = await fetch(`${process.env.API_URL}/uploads`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
