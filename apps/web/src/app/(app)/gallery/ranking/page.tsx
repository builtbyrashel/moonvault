import { serverFetch } from '@/lib/api';

interface RankingItem {
  rank: number;
  id: string;
  title: string | null;
  artist: string;
  width: number | null;
  height: number | null;
  bookmarkCount: number;
  thumbnailUrl: string | null;
}

const PERIODS = ['daily', 'weekly', 'monthly'] as const;

export default async function RankingPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const { period: rawPeriod } = await searchParams;
  const period = PERIODS.includes(rawPeriod as (typeof PERIODS)[number])
    ? rawPeriod!
    : 'daily';

  const res = await serverFetch(`/gallery/ranking?period=${period}`);
  const data = await res.json();
  const items: RankingItem[] = data.items;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display font-semibold text-xl">Ranking</h1>
        <div className="flex gap-2">
          {PERIODS.map((p) => (
            <a
              key={p}
              href={`/gallery/ranking?period=${p}`}
              className={`text-sm px-3 py-1 rounded-full ${
                p === period
                  ? 'bg-ink text-paper-light'
                  : 'border border-ink/20 text-slate'
              }`}
            >
              {p[0].toUpperCase() + p.slice(1)}
            </a>
          ))}
        </div>
      </div>

      <div className="columns-2 sm:columns-3 lg:columns-4 gap-3.5">
        {items.map((item) => (
          <div
            key={item.id}
            className="break-inside-avoid mb-3.5 bg-paper-light rounded-lg overflow-hidden relative"
          >
            {item.rank <= 3 && (
              <div
                className={`absolute top-2 left-2 z-10 w-5 h-5 rounded-full flex items-center justify-center text-xs font-mono text-paper-light ${
                  item.rank === 1 ? 'bg-accent' : item.rank === 2 ? 'bg-brass' : 'bg-slate'
                }`}
              >
                {item.rank}
              </div>
            )}
            <a href={`/images/${item.id}`}>
              {item.thumbnailUrl && item.width && item.height ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={`${process.env.NEXT_PUBLIC_API_URL}${item.thumbnailUrl}`}
                  alt={item.title ?? 'Untitled artwork'}
                  style={{ aspectRatio: `${item.width} / ${item.height}` }}
                  className="w-full object-cover"
                />
              ) : (
                <div className="aspect-square bg-ink/10" />
              )}
            </a>
            <div className="p-2.5">
              <div className="text-sm font-medium">{item.title ?? 'Untitled'}</div>
              <div className="flex justify-between items-center mt-1">
                <span className="text-xs text-slate">@{item.artist}</span>
                <span className="text-xs font-mono text-accent">
                  ♥ {item.bookmarkCount}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
