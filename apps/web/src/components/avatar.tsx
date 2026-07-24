const COLORS = ['#a63a2e', '#93762f', '#4f8f6b', '#3c6e9e', '#7a5ca3', '#c4507e'];

export function colorForId(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  return COLORS[Math.abs(hash) % COLORS.length];
}

export function Avatar({
  id,
  displayName,
  size = 40,
}: {
  id: string;
  displayName: string;
  size?: number;
}) {
  const initial = displayName.trim().charAt(0).toUpperCase() || '?';
  return (
    <div
      style={{
        width: size,
        height: size,
        backgroundColor: colorForId(id),
        fontSize: size * 0.42,
      }}
      className="rounded-full flex items-center justify-center text-paper-light font-medium shrink-0"
    >
      {initial}
    </div>
  );
}
