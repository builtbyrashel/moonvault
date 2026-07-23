import { redirect } from 'next/navigation';
import { serverFetch } from '@/lib/api';
import { UploadForm } from '@/components/upload-form';
import { VaultList } from '@/components/vault-list';

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
  const [storageRes, uploadsRes] = await Promise.all([
    serverFetch('/me/storage'),
    serverFetch('/me/uploads'),
  ]);

  if (storageRes.status === 401 || uploadsRes.status === 401) {
    redirect('/login');
  }
  if (!storageRes.ok || !uploadsRes.ok) {
    throw new Error('Failed to load dashboard');
  }

  const usage: StorageUsage = await storageRes.json();
  const uploads = await uploadsRes.json();

  return (
    <div>
      <div className="max-w-xs mb-6">
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

      <UploadForm />
      <VaultList items={uploads.items} />
    </div>
  );
}
