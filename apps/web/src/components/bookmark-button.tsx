'use client';

import { useState } from 'react';

interface BookmarkButtonProps {
  imageId: string;
  initialBookmarked: boolean;
  initialCount: number;
}

export function BookmarkButton({
  imageId,
  initialBookmarked,
  initialCount,
}: BookmarkButtonProps) {
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    if (loading) return;
    setLoading(true);
    const method = bookmarked ? 'DELETE' : 'POST';
    const res = await fetch(`/api/uploads/${imageId}/bookmark`, { method });
    if (res.ok) {
      setBookmarked(!bookmarked);
      setCount((c) => (bookmarked ? c - 1 : c + 1));
    }
    setLoading(false);
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`text-sm font-mono px-3 py-1.5 rounded-full border ${
        bookmarked
          ? 'bg-accent text-paper-light border-accent'
          : 'border-ink/20 text-ink'
      }`}
    >
      ♥ {count}
    </button>
  );
}
