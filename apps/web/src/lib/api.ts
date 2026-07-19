import { cookies } from 'next/headers';

export async function serverFetch(path: string, options: RequestInit = {}) {
  const cookieStore = await cookies();
  const token = cookieStore.get('moonvault_token')?.value;

  const headers = new Headers(options.headers);
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  return fetch(`${process.env.API_URL}${path}`, {
    ...options,
    headers,
    cache: 'no-store',
  });
}
