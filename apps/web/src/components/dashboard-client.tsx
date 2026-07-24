'use client';

import { useState } from 'react';
import { Avatar } from './avatar';
import { UploadForm } from './upload-form';

interface VaultItem {
  id: string;
  title: string | null;
  isPublic: boolean;
  processingStatus: string;
  duplicateOfId: string | null;
  thumbnailUrl: string | null;
  width: number | null;
  height: number | null;
  tags: string[];
  createdAt: string;
}

interface DashboardClientProps {
  profile: { id: string; displayName: string };
  storage: { usedBytes: number; quotaBytes: number; percentUsed: number };
  initialItems: VaultItem[];
  initialCursor: string | null;
}

type Filter = 'all' | 'processing' | 'ready' | 'public' | 'private';

function formatGb(bytes: number): string {
  return (bytes / 1024 ** 3).toFixed(1);
}

// Calculate aspect ratio percentage for masonry item
function getAspectRatioPercent(width: number | null, height: number | null): string {
  if (!width || !height) return '100%'; // Default to square
  return `${(height / width) * 100}%`;
}

export function DashboardClient({
  profile,
  storage,
  initialItems,
  initialCursor,
}: DashboardClientProps) {
  const [items, setItems] = useState(initialItems);
  const [cursor, setCursor] = useState(initialCursor);
  const [filter, setFilter] = useState<Filter>('all');
  const [uploadOpen, setUploadOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function fetchFiltered(newFilter: Filter) {
    setLoading(true);
    const qs = newFilter === 'all' ? '' : `?status=${newFilter}`;
    const res = await fetch(`/api/me/uploads${qs}`);
    const data = await res.json();
    setItems(data.items);
    setCursor(data.nextCursor);
    setFilter(newFilter);
    setLoading(false);
  }

  async function loadMore() {
    if (!cursor || loading) return;
    setLoading(true);
    const params = new URLSearchParams({ cursor });
    if (filter !== 'all') params.set('status', filter);
    const res = await fetch(`/api/me/uploads?${params.toString()}`);
    const data = await res.json();
    setItems((prev) => [...prev, ...data.items]);
    setCursor(data.nextCursor);
    setLoading(false);
  }

  const processing = items.filter((i) =>
    ['pending', 'processing'].includes(i.processingStatus),
  );
  const ready = items.filter((i) => i.processingStatus === 'ready');
  const failed = items.filter((i) => i.processingStatus === 'failed');

  const filters: { key: Filter; label: string }[] = [
    { key: 'all', label: 'All uploads' },
    { key: 'processing', label: 'Processing' },
    { key: 'public', label: 'Public' },
    { key: 'private', label: 'Private' },
  ];

  return (
    <div className="flex flex-col md:flex-row gap-6">
      <div className="w-full md:w-48 lg:w-52 shrink-0">
        <div className="flex items-center gap-2.5 mb-5">
          <Avatar id={profile.id} displayName={profile.displayName} size={34} />
          <span className="text-sm font-medium">{profile.displayName}</span>
        </div>

        <button
          onClick={() => setUploadOpen((v) => !v)}
          className="w-full bg-accent text-paper-light rounded-lg py-2.5 text-sm font-medium mb-5"
        >
          {uploadOpen ? 'Close' : 'Upload'}
        </button>

        <nav className="mb-5">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => fetchFiltered(f.key)}
              className={`block w-full text-left text-sm py-1.5 ${
                filter === f.key ? 'font-medium text-ink' : 'text-slate'
              }`}
            >
              {f.label}
            </button>
          ))}
        </nav>

        <div>
          <div className="text-xs text-slate mb-1.5">
            {formatGb(storage.usedBytes)} / {formatGb(storage.quotaBytes)} GB
          </div>
          <div className="h-1 bg-ink/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-brass"
              style={{ width: `${Math.min(storage.percentUsed, 100)}%` }}
            />
          </div>
        </div>
      </div>

      <div className="flex-1 min-w-0">
        {uploadOpen && (
          <div className="mb-6">
            <UploadForm
              onUploaded={() => {
                setUploadOpen(false);
                fetchFiltered(filter);
              }}
            />
          </div>
        )}

        {items.length === 0 && !loading && (
          <p className="text-sm text-slate">Nothing here yet.</p>
        )}

        {processing.length > 0 && (
          <div className="mb-6">
            <div className="text-xs font-medium text-slate mb-2">
              PROCESSING ({processing.length})
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
              {processing.map((item) => (
                <div key={item.id} className="relative">
                  <div className="w-full bg-ink/10 rounded-lg animate-pulse" style={{ paddingBottom: '100%' }} />
                  <div className="absolute bottom-2 left-2 bg-ink/70 text-paper-light text-[10px] px-2 py-0.5 rounded-full">
                    processing
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {failed.length > 0 && (
          <div className="mb-6">
            <div className="text-xs font-medium text-accent mb-2">
              FAILED ({failed.length})
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
              {failed.map((item) => (
                <a key={item.id} href={`/images/${item.id}`} className="relative block">
                  <div className="w-full bg-accent/15 rounded-lg" style={{ paddingBottom: '100%' }} />
                </a>
              ))}
            </div>
          </div>
        )}

        {ready.length > 0 && (
          <div>
            <div className="text-xs font-medium text-slate mb-2">
              READY ({ready.length})
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
              {ready.map((item) => (
                <a 
                  key={item.id} 
                  href={`/images/${item.id}`} 
                  className="group relative block bg-paper-light rounded-lg overflow-hidden border border-ink/5 hover:border-ink/20 transition-all hover:shadow-md"
                >
                  {/* Image Container */}
                  <div 
                    className="w-full relative overflow-hidden bg-ink/5"
                    style={{ paddingBottom: getAspectRatioPercent(item.width, item.height) }}
                  >
                    {item.thumbnailUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={`${process.env.NEXT_PUBLIC_API_URL}${item.thumbnailUrl}`}
                        alt={item.title ?? 'Untitled artwork'}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-ink/10" />
                    )}
                    
                    {/* Badges */}
                    <span className="absolute top-1.5 right-1.5 bg-ink/70 backdrop-blur-sm text-paper-light text-[9px] px-2 py-0.5 rounded-full font-medium">
                      {item.isPublic ? 'public' : 'private'}
                    </span>
                    {item.duplicateOfId && (
                      <span className="absolute top-1.5 left-1.5 bg-brass text-paper-light text-[9px] px-2 py-0.5 rounded-full font-medium">
                        dup
                      </span>
                    )}
                  </div>

                  {/* Metadata */}
                  <div className="p-2.5 sm:p-3 space-y-1">
                    {item.title && (
                      <h3 className="font-medium text-xs sm:text-sm text-ink truncate">
                        {item.title}
                      </h3>
                    )}
                    {item.tags && item.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {item.tags.slice(0, 2).map((tag) => (
                          <span 
                            key={tag} 
                            className="text-[9px] sm:text-[10px] bg-ink/5 text-ink/70 px-1.5 py-0.5 rounded-full"
                          >
                            #{tag}
                          </span>
                        ))}
                        {item.tags.length > 2 && (
                          <span className="text-[9px] sm:text-[10px] text-ink/40">
                            +{item.tags.length - 2}
                          </span>
                        )}
                      </div>
                    )}
                    <div className="flex items-center justify-between text-[9px] sm:text-[10px] text-ink/40">
                      <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                      {item.width && item.height && (
                        <span>{item.width}×{item.height}</span>
                      )}
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {cursor && (
          <button
            onClick={loadMore}
            disabled={loading}
            className="mt-6 text-sm text-slate disabled:opacity-60 hover:text-ink transition-colors"
          >
            {loading ? 'Loading…' : 'Load more'}
          </button>
        )}
      </div>
    </div>
  );
}