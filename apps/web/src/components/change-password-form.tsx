'use client';

import { useState } from 'react';

export function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const res = await fetch('/api/me/password', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword, newPassword }),
    });

    setLoading(false);

    if (!res.ok) {
      const body = await res.json().catch(() => ({ message: 'Password change failed' }));
      setError(body.message ?? 'Password change failed');
      return;
    }

    setCurrentPassword('');
    setNewPassword('');
    setSuccess(true);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {error && (
        <p className="text-accent text-sm" role="alert">
          {error}
        </p>
      )}
      {success && <p className="text-brass text-sm">Password updated.</p>}

      <input
        type="password"
        placeholder="Current password"
        value={currentPassword}
        onChange={(e) => setCurrentPassword(e.target.value)}
        required
        className="w-full px-3 py-2 rounded border border-ink/20 bg-paper text-sm"
      />
      <input
        type="password"
        placeholder="New password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        required
        minLength={8}
        className="w-full px-3 py-2 rounded border border-ink/20 bg-paper text-sm"
      />
      <button
        type="submit"
        disabled={loading}
        className="bg-ink text-paper-light rounded-full px-4 py-2 text-sm font-medium disabled:opacity-60"
      >
        {loading ? 'Updating…' : 'Change password'}
      </button>
    </form>
  );
}
