import { GallerySkeleton } from '@/components/gallery-skeleton';

export default function ArtistLoading() {
  return (
    <div>
      <div className="h-7 w-48 bg-ink/10 rounded mb-6 animate-pulse" />
      <GallerySkeleton count={12} />
    </div>
  );
}