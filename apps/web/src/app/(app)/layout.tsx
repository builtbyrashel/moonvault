import { cookies } from 'next/headers';
import { LogoutButton } from '@/components/logout-button';

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const isLoggedIn = Boolean(cookieStore.get('moonvault_token'));

  return (
    <div className="min-h-screen">
      <header className="flex items-center justify-between px-8 py-4 border-b border-ink/10">
        <span className="font-display font-semibold text-lg">Print Room</span>
        <nav className="flex items-center gap-6 text-sm text-slate">
          <a href="/gallery">Explore</a>
          {isLoggedIn ? (
            <>
              <a href="/dashboard">Vault</a>
              <LogoutButton />
            </>
          ) : (
            <a href="/login">Log in</a>
          )}
        </nav>
      </header>
      <main className="p-8">{children}</main>
    </div>
  );
}
