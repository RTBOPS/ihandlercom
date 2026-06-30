'use client';

import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

export default function PortalLoginPage() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
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

        {/* Form */}
        <div className="px-8 py-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
                {error}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full px-4 py-3 rounded-xl bg-white border border-gray-300 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#F34707] focus:ring-2 focus:ring-[#F34707]/20 transition-colors text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl bg-white border border-gray-300 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#F34707] focus:ring-2 focus:ring-[#F34707]/20 transition-colors text-sm"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-[#F34707] hover:bg-[#d93d06] text-white font-semibold text-sm transition-colors disabled:opacity-50"
            >
              {loading ? 'Signing in…' : 'Sign in to my portal'}
            </button>
          </form>

          {/* Info box */}
          <div className="mt-6 p-4 rounded-2xl bg-blue-50 border border-blue-100">
            <p className="text-xs text-blue-700 font-semibold mb-1">This portal is for FBOs and Ground Handlers only.</p>
            <p className="text-xs text-blue-600">
              Your credentials were sent by email when your company was added to the i-Handler directory.
              If you did not receive them or need a new password, contact us at{' '}
              <a href="mailto:operations@i-handler.app" className="underline">operations@i-handler.app</a>.
            </p>
          </div>

          <p className="mt-6 text-center text-xs text-gray-400">
            Are you a pilot or operator?{' '}
            <a href="https://i-handler.app" target="_blank" rel="noopener noreferrer" className="text-[#F34707] hover:underline">
              Download the i-Handler App
            </a>
          </p>
        </div>
      </div>

      {/* Footer note */}
      <p className="mt-8 text-xs text-gray-400">
        © {new Date().getFullYear()} i-Handler · <Link href="/" className="hover:text-gray-600">i-handler.com</Link>
      </p>
    </main>
  );
}
