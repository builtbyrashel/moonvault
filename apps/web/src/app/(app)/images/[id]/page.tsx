import { notFound, redirect } from 'next/navigation';
import { serverFetch } from '@/lib/api';
import { BookmarkButton } from '@/components/bookmark-button';
import { ImageOwnerControls } from '@/components/image-owner-controls';
import { ImageWithLoader } from '@/components/image-with-loader';

interface ExifData {
  Make?: string;
  Model?: string;
  LensModel?: string;
  ExposureTime?: number;
  FNumber?: number;
  ISO?: number;
  FocalLength?: number;
  DateTimeOriginal?: string;
}

interface ImageDetail {
  id: string;
  title: string | null;
  isPublic: boolean;
  width: number | null;
  height: number | null;
  bookmarkCount: number;
  isBookmarked: boolean;
  isOwner: boolean;
  tags: string[];
  exif: ExifData | null;
  url: string;
  duplicateOfId: string | null;
}

export default async function ImageDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const res = await serverFetch(`/uploads/${id}`);

  if (res.status === 401) redirect('/login');
  if (res.status === 404) notFound();
  if (res.status === 403) {
    return (
      <p className="text-slate">You don&apos;t have access to this image.</p>
    );
  }
  if (!res.ok) throw new Error('Failed to load image');

  const image: ImageDetail = await res.json();

  return (
    <div className="max-w-2xl mx-auto">
      {image.width && image.height ? (
        <div className="w-full rounded-lg mb-4 overflow-hidden">
          <ImageWithLoader
            src={`${process.env.NEXT_PUBLIC_API_URL}${image.url}`}
            alt={image.title ?? 'Untitled artwork'}
            width={image.width}
            height={image.height}
          />
        </div>
      ) : (
        <img
          src={`${process.env.NEXT_PUBLIC_API_URL}${image.url}`}
          alt={image.title ?? 'Untitled artwork'}
          className="w-full rounded-lg mb-4"
        />
      )}

      {image.duplicateOfId && image.isOwner && (
        <div className="text-sm bg-brass/10 text-brass border border-brass/25 rounded-lg px-3 py-2 mb-4">
          This looks similar to{' '}
          <a href={`/images/${image.duplicateOfId}`} className="underline">
            an image you already uploaded
          </a>
          .
        </div>
      )}

      <div className="flex items-center justify-between mb-2">
        <h1 className="font-display font-semibold text-lg">
          {image.title ?? 'Untitled'}
        </h1>
        <BookmarkButton
          imageId={image.id}
          initialBookmarked={image.isBookmarked}
          initialCount={image.bookmarkCount}
        />
      </div>

      {image.tags.length > 0 && (
        <div className="flex gap-2 mb-4">
          {image.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs font-mono px-2 py-1 rounded-full bg-paper-light border border-ink/10"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {image.exif && (
        <div className="text-xs font-mono text-slate mb-4 space-y-0.5">
          {image.exif.Make && image.exif.Model && (
            <div>{image.exif.Make} {image.exif.Model}</div>
          )}
          {image.exif.FNumber && <div>f/{image.exif.FNumber}</div>}
          {image.exif.ISO && <div>ISO {image.exif.ISO}</div>}
        </div>
      )}

      {image.isOwner && (
        <ImageOwnerControls
          imageId={image.id}
          title={image.title}
          isPublic={image.isPublic}
          tags={image.tags}
        />
      )}
    </div>
  );
}
