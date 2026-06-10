'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Image from 'next/image';

export default function ManageSubscriptionPage() {
  const [email, setEmail]   = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');

  const handlePortal = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim()) { setError('Please enter your email.'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/stripe/customer-portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error || 'Could not open portal');
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 pb-20 px-4 bg-white flex items-center justify-center">
        <div className="max-w-md w-full">

          <div className="flex justify-center mb-8">
            <Image src="/images/I-HANDLER_APP_LOGO.png" alt="i-Handler" width={64} height={64} className="w-16 h-16 object-contain" />
          </div>

          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Manage Subscription</h1>
            <p className="text-gray-500 text-sm">
              Enter your subscription email to open the billing portal where you can update
              your payment method, view invoices, or cancel your plan.
            </p>
          </div>

          <form onSubmit={handlePortal} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1.5">Subscription email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-300 text-gray-900 text-sm placeholder:text-gray-400 focus:outline-none focus:border-[#F34707] focus:ring-2 focus:ring-[#F34707]/20 transition-colors"
              />
            </div>

            {error && (
              <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-red-600 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-[#F34707] hover:bg-[#d93d06] text-white font-bold text-sm transition-colors shadow-md disabled:opacity-60 flex items-center justify-center gap-2">
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Opening portal…
                </>
              ) : (
                'Open Billing Portal →'
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-gray-400 text-xs">
            Don&apos;t have a subscription yet?{' '}
            <a href="/pricing" className="text-[#F34707] hover:text-[#d93d06]">View plans</a>
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
