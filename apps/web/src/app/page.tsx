import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

export default async function HomePage() {
  const cookieStore = await cookies();
  const isLoggedIn = Boolean(cookieStore.get('moonvault_token'));

  if (isLoggedIn) {
    redirect('/gallery');
  }

  const res = await fetch(`${process.env.API_URL}/gallery?limit=8`, {
    cache: 'no-store',
  });
  const data = await res.json();

  return (
    <div className="min-h-screen">
      <header className="flex items-center justify-between px-8 py-4">
        <span className="font-display font-semibold text-lg">Print Room</span>
        <nav className="flex items-center gap-4 text-sm">
          <a href="/login" className="text-slate">
            Log in
          </a>
          <a
            href="/register"
            className="bg-accent text-paper-light rounded-full px-4 py-1.5"
          >
            Join
          </a>
        </nav>
      </header>

      <div className="px-8 py-10 text-center max-w-lg mx-auto">
        <h1 className="font-display font-semibold text-2xl mb-2">
          Your art, your vault, your gallery.
        </h1>
        <p className="text-slate text-sm">
          Store your illustrations privately, share the ones you choose, at
          full quality and true aspect ratio.
        </p>
      </div>

      <div className="px-8 pb-10">
        {data.items.length > 0 ? (
          <div className="columns-2 sm:columns-3 lg:columns-4 gap-3.5">
            {data.items.map(
              (item: {
                id: string;
                title: string | null;
                width: number | null;
                height: number | null;
                thumbnailUrl: string | null;
              }) => (
                <a
                  key={item.id}
                    href="/register"
                    className="group relative block break-inside-avoid mb-3.5 rounded-lg overflow-hidden bg-paper-light"
                  >
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
                    <div className="absolute inset-0 bg-ink/0 group-hover:bg-ink/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <span className="text-paper-light text-sm font-medium">Join to view</span>
                    </div>
                  </a>
              ),
            )}
          </div>
        ) : (
          <p className="text-center text-sm text-slate">
            No public art yet — be the first to share something.
          </p>
        )}
      </div>
    </div>
  );
}
