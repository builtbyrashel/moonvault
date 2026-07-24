import { redirect } from 'next/navigation';
import { serverFetch } from '@/lib/api';
import { GalleryFeed } from '@/components/gallery-feed';
import { ArtistBanner } from '@/components/artist-banner';

export default async function ProfilePage() {
  const meRes = await serverFetch('/auth/me');
  if (meRes.status === 401) redirect('/login');
  if (!meRes.ok) throw new Error('Failed to load profile');
  const me = await meRes.json();

  const res = await serverFetch(`/gallery/artists/${me.userId}`);
  if (!res.ok) throw new Error('Failed to load profile');
  const data = await res.json();

  return (
    <div>
      <ArtistBanner
        id={data.artist.id}
        displayName={data.artist.displayName}
        memberSince={data.artist.memberSince}
        stats={data.artist.stats}
        isOwner={true}
      />
      <GalleryFeed
        initialItems={data.items}
        initialCursor={data.nextCursor}
        artistId={me.userId}
      />
    </div>
  );
}
