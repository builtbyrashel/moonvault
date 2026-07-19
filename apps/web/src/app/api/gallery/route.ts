import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const qs = searchParams.toString();

  const res = await fetch(
    `${process.env.API_URL}/gallery${qs ? `?${qs}` : ''}`,
    { cache: 'no-store' },
  );
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
