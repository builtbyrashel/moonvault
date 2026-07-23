export function GallerySkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="columns-2 sm:columns-3 lg:columns-4 gap-3.5">
      {Array.from({ length: count }).map((_, i) => {
        // Random-looking but deterministic aspect ratios
        const heights = [200, 280, 240, 320, 260, 300, 220, 280];
        const height = heights[i % heights.length];
        
        return (
          <div
            key={i}
            className="break-inside-avoid mb-3.5 bg-paper-light rounded-lg overflow-hidden"
          >
            {/* Image skeleton */}
            <div 
              className="w-full bg-ink/10 animate-pulse"
              style={{ height }}
            />
            
            {/* Content skeleton */}
            <div className="p-2.5 space-y-2">
              {/* Title skeleton */}
              <div className="h-4 bg-ink/10 animate-pulse rounded w-3/4" />
              
              {/* Artist and bookmark skeleton */}
              <div className="flex justify-between items-center">
                <div className="h-3 bg-ink/10 animate-pulse rounded w-1/3" />
                <div className="h-3 bg-ink/10 animate-pulse rounded w-8" />
              </div>
              
              {/* Tags skeleton */}
              <div className="flex gap-1">
                <div className="h-5 bg-ink/10 animate-pulse rounded-full w-12" />
                <div className="h-5 bg-ink/10 animate-pulse rounded-full w-16" />
                <div className="h-5 bg-ink/10 animate-pulse rounded-full w-10" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}