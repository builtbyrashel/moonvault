'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function DeleteImageButton({ imageId }: { imageId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm('Delete this image permanently?')) return;
    setLoading(true);
    const res = await fetch(`/api/uploads/${imageId}`, { method: 'DELETE' });
    if (res.ok) {
      router.push('/dashboard');
      router.refresh();
    } else {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="text-sm text-accent"
    >
      {loading ? 'Deleting…' : 'Delete'}
    </button>
  );
}
