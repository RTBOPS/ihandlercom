'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { verifyPasswordResetCode, confirmPasswordReset } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import Image from 'next/image';
import Link from 'next/link';

type View = 'verifying' | 'form' | 'success' | 'invalid';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const oobCode = searchParams.get('oobCode') || '';

  const [view, setView] = useState<View>('verifying');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!oobCode) { setView('invalid'); return; }
    verifyPasswordResetCode(auth, oobCode)
      .then((accountEmail) => { setEmail(accountEmail); setView('form'); })
      .catch(() => setView('invalid'));
  }, [oobCode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    setLoading(true);
    try {
      await confirmPasswordReset(auth, oobCode, password);
      setView('success');
    } catch (err: unknown) {
      const code = (err as { code?: string }).code;
      if (code === 'auth/expired-action-code' || code === 'auth/invalid-action-code') {
        setView('invalid');
      } else if (code === 'auth/weak-password') {
        setError('Password is too weak. Please choose a stronger one.');
      } else {
        setError('Could not reset password. Please try again.');
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
          <h1 className="text-2xl font-bold text-white mb-1">Reset your password</h1>
          <p className="text-white/60 text-sm">Choose a new password for your portal account</p>
        </div>

        {/* Body */}
        <div className="px-8 py-8">

          {view === 'verifying' && (
            <div className="text-center py-8 text-gray-400 text-sm">Verifying your reset link…</div>
          )}

          {view === 'form' && (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">{error}</div>
              )}
              <div className="px-4 py-3 rounded-xl bg-blue-50 border border-blue-100 text-blue-700 text-sm">
                Setting a new password for <strong>{email}</strong>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">New password</label>
                <input type="password" required autoFocus value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full px-4 py-3 rounded-xl bg-white border border-gray-300 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#F34707] focus:ring-2 focus:ring-[#F34707]/20 transition-colors text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm new password</label>
                <input type="password" required value={confirm} onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Repeat your new password"
                  className="w-full px-4 py-3 rounded-xl bg-white border border-gray-300 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#F34707] focus:ring-2 focus:ring-[#F34707]/20 transition-colors text-sm" />
              </div>
              <button type="submit" disabled={loading}
                className="w-full py-3 rounded-xl bg-[#F34707] hover:bg-[#d93d06] text-white font-semibold text-sm transition-colors disabled:opacity-50">
                {loading ? 'Saving…' : 'Set new password'}
              </button>
            </form>
          )}

          {view === 'success' && (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-green-50 border border-green-100 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-lg font-bold text-gray-900 mb-2">Password updated</h2>
              <p className="text-sm text-gray-500 mb-6">
                Your new password is ready. Sign in to your portal with it now.
              </p>
              <button onClick={() => router.push('/portal-login')}
                className="w-full py-3 rounded-xl bg-[#F34707] hover:bg-[#d93d06] text-white font-semibold text-sm transition-colors">
                Sign in to my portal
              </button>
            </div>
          )}

          {view === 'invalid' && (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-red-50 border border-red-100 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="text-lg font-bold text-gray-900 mb-2">Link expired or invalid</h2>
              <p className="text-sm text-gray-500 mb-6">
                This reset link has already been used or has expired. Request a new one from the sign-in page.
              </p>
              <Link href="/portal-login"
                className="block w-full py-3 rounded-xl bg-[#F34707] hover:bg-[#d93d06] text-white font-semibold text-sm transition-colors text-center">
                Back to sign in
              </Link>
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

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-400 text-sm">Loading…</main>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
