import { LogoutButton } from '@/components/logout-button';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <header className="flex items-center justify-between px-8 py-4 border-b border-ink/10">
        <span className="font-display font-semibold text-lg">Print Room</span>
        <nav className="flex items-center gap-6 text-sm text-slate">
          <a href="/dashboard">Vault</a>
          <a href="/gallery">Explore</a>
          <LogoutButton />
        </nav>
      </header>
      <main className="p-8">{children}</main>
    </div>
  );
}
