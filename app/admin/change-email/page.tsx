'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { verifyAdminSecret } from '@/lib/adminAuth';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

type CompanyType = 'handler' | 'fbo';

export default function ChangeEmailPage() {
  const router = useRouter();
  const [adminSecret, setAdminSecret] = useState('');
  const [authed, setAuthed] = useState(false);

  const [oldEmail, setOldEmail] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [companyType, setCompanyType] = useState<CompanyType>('handler');
  const [icao, setIcao] = useState('');

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<{ uid: string; docId: string | null } | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const stored = sessionStorage.getItem('ih_admin_secret');
    if (!stored) return;
    verifyAdminSecret(stored).then((ok) => {
      if (ok) { setAdminSecret(stored); setAuthed(true); }
      else sessionStorage.removeItem('ih_admin_secret');
    });
  }, []);

  if (!authed) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen pt-24 pb-20 px-4 bg-white flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-500 mb-4">You must be signed into the admin portal first.</p>
            <Link href="/admin" className="text-[#F34707] font-semibold hover:underline">← Go to Admin Login</Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(null);
    if (!oldEmail || !newEmail) { setError('Both emails are required.'); return; }
    if (oldEmail === newEmail) { setError('Old and new email must be different.'); return; }

    setLoading(true);
    try {
      const res = await fetch('/api/admin/change-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminSecret, oldEmail, newEmail, companyType, icao: icao.trim().toUpperCase() || undefined }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Request failed.'); return; }
      setSuccess({ uid: data.uid, docId: data.docId });
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 pb-20 px-4 bg-white">
        <div className="max-w-xl mx-auto">
          <div className="mb-8">
            <Link href="/admin" className="inline-flex items-center gap-2 text-gray-400 hover:text-gray-700 text-sm mb-6 transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">Change Contact Email</h1>
            <p className="text-gray-400 text-sm">Update the login email for a handler or FBO account</p>
          </div>

          {success ? (
            <div className="rounded-2xl border border-green-200 bg-green-50 p-6 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-green-800">Email updated successfully</h3>
                  <p className="text-green-700 text-sm mt-0.5">{oldEmail} → {newEmail}</p>
                </div>
              </div>
              <div className="text-xs text-green-600 font-mono bg-green-100 rounded-lg px-3 py-2 space-y-0.5">
                <p>UID: {success.uid}</p>
                {success.docId && <p>Doc: {success.docId}</p>}
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => { setSuccess(null); setOldEmail(''); setNewEmail(''); setIcao(''); }}
                  className="px-4 py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm font-semibold transition-colors">
                  Change Another
                </button>
                <Link href="/admin" className="px-4 py-2 rounded-xl border border-gray-200 text-gray-500 text-sm hover:bg-gray-50 transition-colors">
                  Back to Dashboard
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-5">
              {error && (
                <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">{error}</div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Company Type</label>
                <div className="grid grid-cols-2 gap-3">
                  {(['handler', 'fbo'] as CompanyType[]).map((t) => (
                    <button key={t} type="button" onClick={() => setCompanyType(t)}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${companyType === t ? 'border-[#F34707] bg-[#F34707]/5' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                      <div className={`font-semibold text-sm ${companyType === t ? 'text-[#F34707]' : 'text-gray-900'}`}>
                        {t === 'handler' ? '✈️ Ground Handler' : '🏢 FBO'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1.5">Old Email Address <span className="text-red-400">*</span></label>
                <input type="email" required value={oldEmail} onChange={(e) => setOldEmail(e.target.value)}
                  placeholder="current@company.com"
                  className="w-full px-4 py-3 rounded-xl bg-white border border-gray-300 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#F34707] focus:ring-2 focus:ring-[#F34707]/20 text-sm" />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1.5">New Email Address <span className="text-red-400">*</span></label>
                <input type="email" required value={newEmail} onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="new@company.com"
                  className="w-full px-4 py-3 rounded-xl bg-white border border-gray-300 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#F34707] focus:ring-2 focus:ring-[#F34707]/20 text-sm" />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1.5">Airport ICAO <span className="text-gray-400 font-normal">(optional — helps find the right record)</span></label>
                <input type="text" value={icao} onChange={(e) => setIcao(e.target.value.toUpperCase())} maxLength={4}
                  placeholder="e.g. KJFK"
                  className="w-full px-4 py-3 rounded-xl bg-white border border-gray-300 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#F34707] focus:ring-2 focus:ring-[#F34707]/20 text-sm font-mono uppercase" />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={loading}
                  className="px-6 py-3 rounded-xl bg-[#F34707] hover:bg-[#d93d06] text-white font-semibold text-sm transition-colors disabled:opacity-50 shadow-md">
                  {loading ? 'Updating…' : 'Update Email'}
                </button>
                <Link href="/admin" className="px-6 py-3 rounded-xl border border-gray-200 text-gray-500 text-sm hover:bg-gray-50 transition-colors">
                  Cancel
                </Link>
              </div>
            </form>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
