'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function EditDisplayNameForm({
  initialDisplayName,
}: {
  initialDisplayName: string;
}) {
  const router = useRouter();
  const [displayName, setDisplayName] = useState(initialDisplayName);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const res = await fetch('/api/me/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ displayName }),
    });

    setLoading(false);

    if (!res.ok) {
      const body = await res.json().catch(() => ({ message: 'Update failed' }));
      setError(body.message ?? 'Update failed');
      return;
    }

    setSuccess(true);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={displayName}
        onChange={(e) => setDisplayName(e.target.value)}
        maxLength={60}
        required
        className="flex-1 px-3 py-2 rounded border border-ink/20 bg-paper text-sm"
      />
      <button
        type="submit"
        disabled={loading}
        className="bg-accent text-paper-light rounded-full px-4 py-2 text-sm font-medium disabled:opacity-60"
      >
        {loading ? 'Saving…' : 'Save'}
      </button>
      {error && (
        <p className="text-accent text-xs self-center" role="alert">
          {error}
        </p>
      )}
      {success && (
        <p className="text-brass text-xs self-center">Saved</p>
      )}
    </form>
  );
}
