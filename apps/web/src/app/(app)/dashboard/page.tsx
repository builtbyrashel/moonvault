import { redirect } from 'next/navigation';
import { serverFetch } from '@/lib/api';
import { DashboardClient } from '@/components/dashboard-client';

export default async function DashboardPage() {
  const [profileRes, storageRes, uploadsRes] = await Promise.all([
    serverFetch('/me/profile'),
    serverFetch('/me/storage'),
    serverFetch('/me/uploads?limit=50'),
  ]);

  if (
    profileRes.status === 401 ||
    storageRes.status === 401 ||
    uploadsRes.status === 401
  ) {
    redirect('/login');
  }
  if (!profileRes.ok || !storageRes.ok || !uploadsRes.ok) {
    throw new Error('Failed to load dashboard');
  }

  const profile = await profileRes.json();
  const storage = await storageRes.json();
  const uploads = await uploadsRes.json();

  return (
    <DashboardClient
      profile={profile}
      storage={storage}
      initialItems={uploads.items}
      initialCursor={uploads.nextCursor}
    />
  );
}
