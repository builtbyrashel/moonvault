export default function ProfileLoading() {
  return (
    <div className="max-w-md">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 rounded-full bg-ink/10 animate-pulse" />
        <div>
          <div className="h-5 w-32 bg-ink/10 rounded mb-2 animate-pulse" />
          <div className="h-3 w-40 bg-ink/10 rounded animate-pulse" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-16 bg-ink/10 rounded-lg animate-pulse" />
        ))}
      </div>
    </div>
  );
}
