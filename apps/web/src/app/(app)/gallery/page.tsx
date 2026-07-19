import { serverFetch } from '@/lib/api';
import { GalleryFeed } from '@/components/gallery-feed';

export default async function GalleryPage() {
  const res = await serverFetch('/gallery');
  const data = await res.json();

  return (
    <div>
      <h1 className="font-display font-semibold text-xl mb-6">Explore</h1>
      <GalleryFeed initialItems={data.items} initialCursor={data.nextCursor} />
    </div>
  );
}
