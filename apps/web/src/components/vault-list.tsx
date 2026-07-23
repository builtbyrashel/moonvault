'use client';

import { useState } from 'react';

interface VaultItem {
  id: string;
  title: string | null;
  isPublic: boolean;
  processingStatus: string;
  sizeBytes: number;
  tags: string[];
  thumbnailUrl: string | null;
  createdAt: string;
  duplicateOfId: string | null;
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  processing: 'Processing thumbnails',
  ready: 'Ready',
  failed: 'Failed',
};

function formatSize(bytes: number): string {
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function VaultList({ items }: { items: VaultItem[] }) {
  if (items.length === 0) {
    return <p className="text-sm text-slate">No uploads yet.</p>;
  }

  return (
    <div>
      {items.map((item) => (
        <a
          key={item.id}
          href={`/images/${item.id}`}
          className="flex items-center gap-3.5 py-2.5 border-b border-ink/10"
        >
          {item.thumbnailUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={`${process.env.NEXT_PUBLIC_API_URL}${item.thumbnailUrl}`}
              alt=""
              className="w-10 h-10 rounded object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded bg-ink/10" />
          )}
          <div className="flex-1">
            <div className="text-sm font-medium">{item.title ?? 'Untitled'}</div>
            <div className="text-xs font-mono text-slate">
              {formatSize(item.sizeBytes)} · {item.isPublic ? 'Public' : 'Private'}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {item.duplicateOfId && (
              <span className="text-xs text-brass" title="Possible duplicate of another upload">
                ⚠ possible duplicate
              </span>
            )}
            <span
              className={`text-xs px-2.5 py-1 rounded-full ${
                item.processingStatus === 'ready'
                  ? 'bg-brass/15 text-brass'
                  : item.processingStatus === 'failed'
                    ? 'bg-accent/15 text-accent'
                    : 'bg-slate/15 text-slate'
              }`}
            >
              {STATUS_LABELS[item.processingStatus] ?? item.processingStatus}
            </span>
          </div>
        </a>
      ))}
    </div>
  );
}

