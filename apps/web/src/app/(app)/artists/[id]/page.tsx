import { notFound, redirect } from 'next/navigation';
import { serverFetch } from '@/lib/api';
import { GalleryFeed } from '@/components/gallery-feed';
import { ArtistBanner } from '@/components/artist-banner';

interface ArtistData {
  id: string;
  displayName: string;
  memberSince: string;
  stats: { publicUploadCount: number; bookmarksReceived: number };
}

export default async function ArtistProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const meRes = await serverFetch('/auth/me');
  if (meRes.ok) {
    const me = await meRes.json();
    if (me.userId === id) {
      redirect('/profile');
    }
  }

  const res = await serverFetch(`/gallery/artists/${id}`);
  if (res.status === 404) notFound();
  if (!res.ok) throw new Error('Failed to load artist');

  const data = await res.json();
  const artist: ArtistData = data.artist;

  return (
    <div>
      <ArtistBanner
        id={artist.id}
        displayName={artist.displayName}
        memberSince={artist.memberSince}
        stats={artist.stats}
        isOwner={false}
      />
      <GalleryFeed
        initialItems={data.items}
        initialCursor={data.nextCursor}
        artistId={id}
      />
    </div>
  );
}
