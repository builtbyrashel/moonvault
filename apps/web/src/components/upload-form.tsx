'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

export function UploadForm() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState('');
  const [tags, setTags] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      setError('Choose a file first.');
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);
    if (title) formData.append('title', title);
    if (tags) formData.append('tags', tags);
    formData.append('isPublic', String(isPublic));

    const res = await fetch('/api/uploads', { method: 'POST', body: formData });
    setLoading(false);

    if (!res.ok) {
      const body = await res.json().catch(() => ({ message: 'Upload failed' }));
      setError(body.message ?? 'Upload failed');
      return;
    }

    setTitle('');
    setTags('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="border border-dashed border-ink/25 rounded-lg p-5 bg-paper-light mb-6"
    >
      {error && (
        <p className="text-accent text-sm mb-3" role="alert">
          {error}
        </p>
      )}

      <input ref={fileInputRef} type="file" accept="image/*" required className="mb-3 text-sm" />

      <input
        type="text"
        placeholder="Title (optional)"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full mb-3 px-3 py-2 rounded border border-ink/20 bg-paper text-sm"
      />

      <input
        type="text"
        placeholder="Tags, comma separated (optional)"
        value={tags}
        onChange={(e) => setTags(e.target.value)}
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

      <button
        type="submit"
        disabled={loading}
        className="bg-accent text-paper-light rounded-full px-5 py-2 text-sm font-medium disabled:opacity-60"
      >
        {loading ? 'Uploading…' : 'Upload'}
      </button>
    </form>
  );
}
