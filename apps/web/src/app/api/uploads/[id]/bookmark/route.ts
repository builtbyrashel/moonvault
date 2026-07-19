import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

async function forward(id: string, method: 'POST' | 'DELETE') {
  const cookieStore = await cookies();
  const token = cookieStore.get('moonvault_token')?.value;

  const res = await fetch(`${process.env.API_URL}/uploads/${id}/bookmark`, {
    method,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return forward(id, 'POST');
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return forward(id, 'DELETE');
}
