import { notFound } from 'next/navigation';
import { serverFetch } from '@/lib/api';
import { GalleryFeed } from '@/components/gallery-feed';

export default async function ArtistProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const res = await serverFetch(`/gallery/artists/${id}`);

  if (res.status === 404) notFound();
  if (!res.ok) throw new Error('Failed to load artist');

  const data = await res.json();

  return (
    <div>
      <h1 className="font-display font-semibold text-xl mb-6">
        {data.artist.displayName}
      </h1>
      <GalleryFeed
        initialItems={data.items}
        initialCursor={data.nextCursor}
        artistId={id}
      />
    </div>
  );
}
