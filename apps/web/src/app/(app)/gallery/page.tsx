import { serverFetch } from '@/lib/api';
import { GalleryFeed } from '@/components/gallery-feed';
import { GalleryFilterBar } from '@/components/gallery-filter-bar';

export default async function GalleryPage({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string; orientation?: string }>;
}) {
  const { tag, orientation } = await searchParams;
  const params = new URLSearchParams();
  if (tag) params.set('tag', tag);
  if (orientation) params.set('orientation', orientation);
  const qs = params.toString();

  const res = await serverFetch(`/gallery${qs ? `?${qs}` : ''}`);
  const data = await res.json();

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="font-display font-semibold text-xl">Explore</h1>
        <GalleryFilterBar />
      </div>
      <GalleryFeed
        key={`${tag ?? ''}-${orientation ?? ''}`}
        initialItems={data.items}
        initialCursor={data.nextCursor}
        tag={tag}
        orientation={orientation}
      />
    </div>
  );
}