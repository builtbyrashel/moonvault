export default function DashboardLoading() {
  return (
    <div>
      <div className="max-w-xs mb-6">
        <div className="h-3 w-32 bg-ink/10 rounded mb-2 animate-pulse" />
        <div className="h-1.5 bg-ink/10 rounded-full animate-pulse" />
      </div>
      <div className="h-24 bg-ink/10 rounded-lg mb-6 animate-pulse" />
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-14 bg-ink/10 rounded animate-pulse" />
        ))}
      </div>
    </div>
  );
}
