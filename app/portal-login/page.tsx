'use client';

import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

type View = 'login' | 'reset' | 'reset-sent';

export default function PortalLoginPage() {
  const [view, setView]         = useState<View>('login');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const router = useRouter();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) { setError('Enter your email address first.'); return; }
    setError(''); setLoading(true);
    try {
      const res = await fetch('/api/portal/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || 'Could not send reset email. Try again.');
        return;
      }
      setView('reset-sent');
    } catch {
      setError('Could not send reset email. Try again.');
    } finally { setLoading(false); }
  };

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
        setError('Invalid email or password. Check your credentials and try again.');
      } else {
        setError('An error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-16">

      {/* Card */}
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">

        {/* Header strip */}
        <div className="bg-gradient-to-r from-[#0a0f1e] to-[#1a2540] px-8 py-8 text-center">
          <Link href="/">
            <Image
              src="/images/I-HANDLER_APP_LOGO.png"
              alt="i-Handler"
              width={160}
              height={48}
              className="h-10 w-auto object-contain mx-auto mb-4 brightness-0 invert"
            />
          </Link>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white/80 text-xs font-semibold mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[#F34707]" />
            FBO &amp; Handler Portal
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">Welcome back</h1>
          <p className="text-white/60 text-sm">Sign in to manage your company listing</p>
        </div>

        {/* Form area */}
        <div className="px-8 py-8">

          {/* ── LOGIN VIEW ── */}
          {view === 'login' && (
            <>
              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">{error}</div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="w-full px-4 py-3 rounded-xl bg-white border border-gray-300 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#F34707] focus:ring-2 focus:ring-[#F34707]/20 transition-colors text-sm" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-sm font-medium text-gray-700">Password</label>
                    <button type="button" onClick={() => { setError(''); setView('reset'); }}
                      className="text-xs text-[#F34707] hover:underline">
                      Forgot password?
                    </button>
                  </div>
                  <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 rounded-xl bg-white border border-gray-300 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#F34707] focus:ring-2 focus:ring-[#F34707]/20 transition-colors text-sm" />
                </div>
                <button type="submit" disabled={loading}
                  className="w-full py-3 rounded-xl bg-[#F34707] hover:bg-[#d93d06] text-white font-semibold text-sm transition-colors disabled:opacity-50">
                  {loading ? 'Signing in…' : 'Sign in to my portal'}
                </button>
              </form>
              <div className="mt-6 p-4 rounded-2xl bg-blue-50 border border-blue-100">
                <p className="text-xs text-blue-700 font-semibold mb-1">This portal is for FBOs and Ground Handlers only.</p>
                <p className="text-xs text-blue-600">
                  Your credentials were sent by email when your company was added to the i-Handler directory.
                </p>
              </div>
              <p className="mt-6 text-center text-xs text-gray-400">
                Are you a pilot or operator?{' '}
                <a href="https://i-handler.app" target="_blank" rel="noopener noreferrer" className="text-[#F34707] hover:underline">
                  Download the i-Handler App
                </a>
              </p>
            </>
          )}

          {/* ── RESET VIEW ── */}
          {view === 'reset' && (
            <>
              <p className="text-sm text-gray-600 mb-5">
                Enter your email address and we will send you a link to reset your password.
              </p>
              <form onSubmit={handleReset} className="space-y-5">
                {error && (
                  <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">{error}</div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="w-full px-4 py-3 rounded-xl bg-white border border-gray-300 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#F34707] focus:ring-2 focus:ring-[#F34707]/20 transition-colors text-sm" />
                </div>
                <button type="submit" disabled={loading}
                  className="w-full py-3 rounded-xl bg-[#F34707] hover:bg-[#d93d06] text-white font-semibold text-sm transition-colors disabled:opacity-50">
                  {loading ? 'Sending…' : 'Send reset link'}
                </button>
              </form>
              <button onClick={() => { setError(''); setView('login'); }}
                className="mt-4 w-full text-center text-sm text-gray-400 hover:text-gray-700 transition-colors">
                ← Back to sign in
              </button>
            </>
          )}

          {/* ── RESET SENT VIEW ── */}
          {view === 'reset-sent' && (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-green-50 border border-green-100 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                </svg>
              </div>
              <h2 className="text-lg font-bold text-gray-900 mb-2">Check your email</h2>
              <p className="text-sm text-gray-500 mb-1">
                If an account exists for this email, we sent a password reset link to
              </p>
              <p className="text-sm font-semibold text-gray-800 mb-6">{email}</p>
              <p className="text-xs text-gray-400 mb-6">
                Click the link in the email to set a new password. If you don&apos;t see it, check your spam folder.
              </p>
              <button onClick={() => { setView('login'); setError(''); }}
                className="w-full py-3 rounded-xl bg-[#F34707] hover:bg-[#d93d06] text-white font-semibold text-sm transition-colors">
                Back to sign in
              </button>
            </div>
          )}

        </div>
      </div>

      {/* Footer note */}
      <p className="mt-8 text-xs text-gray-400">
        © {new Date().getFullYear()} i-Handler · <Link href="/" className="hover:text-gray-600">i-handler.com</Link>
      </p>
    </main>
  );
}
