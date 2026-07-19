import { redirect } from 'next/navigation';
import { serverFetch } from '@/lib/api';

interface StorageUsage {
  usedBytes: number;
  quotaBytes: number;
  percentUsed: number;
}

function formatBytes(bytes: number): string {
  const gb = bytes / 1024 ** 3;
  return `${gb.toFixed(1)} GB`;
}

export default async function DashboardPage() {
  const res = await serverFetch('/me/storage');

  if (res.status === 401) {
    redirect('/login');
  }
  if (!res.ok) {
    throw new Error('Failed to load storage usage');
  }

  const usage: StorageUsage = await res.json();

  return (
    <div className="min-h-screen p-8">
      <h1 className="font-display font-semibold text-xl mb-6">Print Room</h1>

      <div className="max-w-xs">
        <div className="text-sm text-slate mb-1">
          {formatBytes(usage.usedBytes)} of {formatBytes(usage.quotaBytes)} used
        </div>
        <div className="h-1.5 bg-ink/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-brass"
            style={{ width: `${Math.min(usage.percentUsed, 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}
