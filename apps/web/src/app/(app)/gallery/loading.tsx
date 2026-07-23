import { GallerySkeleton } from '@/components/gallery-skeleton';

export default function GalleryLoading() {
  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <div className="h-7 w-28 bg-ink/10 rounded animate-pulse" />
        <div className="flex gap-2">
          <div className="h-8 w-16 bg-ink/10 rounded-full animate-pulse" />
          <div className="h-8 w-16 bg-ink/10 rounded-full animate-pulse" />
        </div>
      </div>
      <GallerySkeleton count={12} />
    </div>
  );
}