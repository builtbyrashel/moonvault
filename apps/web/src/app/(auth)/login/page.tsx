'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    setLoading(false);

    if (!res.ok) {
      const body = await res.json().catch(() => ({ message: 'Login failed' }));
      setError(body.message ?? 'Login failed');
      return;
    }

    router.push('/dashboard');
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-sm bg-paper-light rounded-lg p-8 border border-ink/10"
    >
      <h1 className="font-display font-semibold text-xl mb-6">Print Room</h1>

      {error && (
        <p className="text-accent text-sm mb-4" role="alert">
          {error}
        </p>
      )}

      <label className="block text-sm mb-1" htmlFor="email">
        Email
      </label>
      <input
        id="email"
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full mb-4 px-3 py-2 rounded border border-ink/20 bg-paper text-sm"
      />

      <label className="block text-sm mb-1" htmlFor="password">
        Password
      </label>
      <input
        id="password"
        type="password"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full mb-6 px-3 py-2 rounded border border-ink/20 bg-paper text-sm"
      />

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-accent text-paper-light rounded-full py-2 text-sm font-medium disabled:opacity-60"
      >
        {loading ? 'Logging in…' : 'Log in'}
      </button>

      <p className="text-sm text-slate mt-4 text-center">
        No account?{' '}
        <a href="/register" className="text-accent">
          Register
        </a>
      </p>
    </form>
  );
}
