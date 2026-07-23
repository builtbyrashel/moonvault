import { notFound } from 'next/navigation';
import { serverFetch } from '@/lib/api';
import { GalleryFeed } from '@/components/gallery-feed';
import { Avatar } from '@/components/avatar';

interface ArtistData {
  id: string;
  displayName: string;
  memberSince: string;
  stats: {
    publicUploadCount: number;
    bookmarksReceived: number;
  };
}

function formatMemberSince(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
}

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
  const artist: ArtistData = data.artist;

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Avatar id={artist.id} displayName={artist.displayName} size={56} />
        <div>
          <div className="font-display font-semibold text-lg">
            {artist.displayName}
          </div>
          <div className="text-sm text-slate">
            Member since {formatMemberSince(artist.memberSince)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-8 max-w-xs">
        <div className="bg-paper-light rounded-lg p-3 text-center">
          <div className="font-mono text-lg">{artist.stats.publicUploadCount}</div>
          <div className="text-xs text-slate">Public uploads</div>
        </div>
        <div className="bg-paper-light rounded-lg p-3 text-center">
          <div className="font-mono text-lg">{artist.stats.bookmarksReceived}</div>
          <div className="text-xs text-slate">Bookmarks received</div>
        </div>
      </div>

      <GalleryFeed
        initialItems={data.items}
        initialCursor={data.nextCursor}
        artistId={id}
      />
    </div>
  );
}
