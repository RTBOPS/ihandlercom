'use client';

import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/portal');
    } catch (err: unknown) {
      const code = (err as { code?: string }).code;
      if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found') {
        setError('Invalid email or password.');
      } else {
        setError('An error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          {error}
        </div>
      )}
      <div>
        <label className="block text-sm text-white/60 mb-1.5">Email</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@company.com"
          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/20 text-white placeholder:text-white/25 focus:outline-none focus:border-[#F34707] transition-colors text-sm"
        />
      </div>
      <div>
        <label className="block text-sm text-white/60 mb-1.5">Password</label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/20 text-white placeholder:text-white/25 focus:outline-none focus:border-[#F34707] transition-colors text-sm"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 rounded-xl bg-[#F34707] hover:bg-[#d93d06] text-white font-semibold text-sm transition-colors disabled:opacity-50"
      >
        {loading ? 'Signing in...' : 'Sign In'}
      </button>
    </form>
  );
}
