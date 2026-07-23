'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface EditImageFormProps {
  imageId: string;
  initialTitle: string | null;
  initialIsPublic: boolean;
  initialTags: string[];
  onCancel: () => void;
}

export function EditImageForm({
  imageId,
  initialTitle,
  initialIsPublic,
  initialTags,
  onCancel,
}: EditImageFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState(initialTitle ?? '');
  const [isPublic, setIsPublic] = useState(initialIsPublic);
  const [tags, setTags] = useState(initialTags.join(', '));
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch(`/api/uploads/${imageId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, isPublic, tags }),
    });

    setLoading(false);

    if (!res.ok) {
      const body = await res.json().catch(() => ({ message: 'Update failed' }));
      setError(body.message ?? 'Update failed');
      return;
    }

    router.refresh();
    onCancel();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="border border-ink/15 rounded-lg p-4 bg-paper-light mb-4"
    >
      {error && (
        <p className="text-accent text-sm mb-3" role="alert">
          {error}
        </p>
      )}

      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title"
        className="w-full mb-3 px-3 py-2 rounded border border-ink/20 bg-paper text-sm"
      />

      <input
        type="text"
        value={tags}
        onChange={(e) => setTags(e.target.value)}
        placeholder="Tags, comma separated"
        className="w-full mb-3 px-3 py-2 rounded border border-ink/20 bg-paper text-sm"
      />

      <label className="flex items-center gap-2 text-sm mb-4">
        <input
          type="checkbox"
          checked={isPublic}
          onChange={(e) => setIsPublic(e.target.checked)}
        />
        Show on public gallery
      </label>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="bg-accent text-paper-light rounded-full px-4 py-1.5 text-sm font-medium disabled:opacity-60"
        >
          {loading ? 'Saving…' : 'Save'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="text-sm text-slate"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
