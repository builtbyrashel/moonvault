import { serverFetch } from '@/lib/api';
import { GalleryFeed } from '@/components/gallery-feed';

export default async function GalleryPage({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string }>;
}) {
  const { tag } = await searchParams;
  const query = tag ? `?tag=${encodeURIComponent(tag)}` : '';
  const res = await serverFetch(`/gallery${query}`);
  const data = await res.json();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display font-semibold text-xl">
          {tag ? `#${tag}` : 'Explore'}
        </h1>
        {tag && (
          <a href="/gallery" className="text-sm text-accent">
            Clear filter
          </a>
        )}
      </div>
      <GalleryFeed initialItems={data.items} initialCursor={data.nextCursor} tag={tag} />
    </div>
  );
}