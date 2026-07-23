'use client';

import { useState } from 'react';

interface GalleryItem {
  id: string;
  title: string | null;
  artist?: { id: string; displayName: string };
  width: number | null;
  height: number | null;
  bookmarkCount: number;
  tags: string[];
  thumbnailUrl: string | null;
  createdAt: string;
}

interface GalleryFeedProps {
  initialItems: GalleryItem[];
  initialCursor: string | null;
  tag?: string;
  artistId?: string;
}

export function GalleryFeed({ initialItems, initialCursor, tag, artistId }: GalleryFeedProps) {
  const [items, setItems] = useState(initialItems);
  const [cursor, setCursor] = useState(initialCursor);
  const [loading, setLoading] = useState(false);

  async function loadMore() {
    if (!cursor || loading) return;
    setLoading(true);
    const params = new URLSearchParams({ cursor });
    if (tag) params.set('tag', tag);
    const endpoint = artistId
      ? `/api/gallery/artists/${artistId}`
      : '/api/gallery';
    const res = await fetch(`${endpoint}?${params.toString()}`);
    const data = await res.json();
    setItems((prev) => [...prev, ...data.items]);
    setCursor(data.nextCursor);
    setLoading(false);
  }

  return (
    <div>
      <div className="columns-2 sm:columns-3 lg:columns-4 gap-3.5">
        {items.map((item) => (
          <div
            key={item.id}
            className="break-inside-avoid mb-3.5 bg-paper-light rounded-lg overflow-hidden"
          >
            <a href={`/images/${item.id}`}>
              {item.thumbnailUrl && item.width && item.height ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={`${process.env.NEXT_PUBLIC_API_URL}${item.thumbnailUrl}`}
                  alt={item.title ?? 'Untitled artwork'}
                  style={{ aspectRatio: `${item.width} / ${item.height}` }}
                  className="w-full object-cover"
                />
              ) : (
                <div className="aspect-square bg-ink/10" />
              )}
            </a>
            <div className="p-2.5">
              <div className="text-sm font-medium">{item.title ?? 'Untitled'}</div>
              <div className="flex justify-between items-center mt-1 mb-1.5">
                {item.artist && (
                  <a href={`/artists/${item.artist.id}`} className="text-xs text-slate hover:underline">
                    @{item.artist.displayName}
                  </a>
                )}
                <span className="text-xs font-mono text-accent">
                  ♥ {item.bookmarkCount}
                </span>
              </div>
              {item.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {item.tags.map((t) => (
                    <a
                      key={t}
                      href={`/gallery?tag=${encodeURIComponent(t)}`}
                      className="text-[11px] font-mono px-1.5 py-0.5 rounded-full bg-paper border border-ink/10 text-slate"
                    >
                      {t}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {cursor && (
        <button
          onClick={loadMore}
          disabled={loading}
          className="mt-6 mx-auto block text-sm text-slate disabled:opacity-60"
        >
          {loading ? 'Loading…' : 'Load more'}
        </button>
      )}
    </div>
  );
}
