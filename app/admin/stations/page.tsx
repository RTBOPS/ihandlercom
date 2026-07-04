'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { verifyAdminSecret } from '@/lib/adminAuth';

type Station = {
  docId: string;
  icao: string;
  companyName: string;
  createdByPortalInvite: boolean;
  missing?: boolean;
};

type Account = {
  uid: string;
  email: string;
  companyType: 'fbo' | 'handler';
  stations: Station[];
};

export default function StationsPage() {
  const [secret, setSecret] = useState('');
  const [authed, setAuthed] = useState(false);
  const [authError, setAuthError] = useState('');

  const [email, setEmail] = useState('');
  const [account, setAccount] = useState<Account | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const [confirmRemove, setConfirmRemove] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [newIcao, setNewIcao] = useState('');

  useEffect(() => {
    const stored = sessionStorage.getItem('ih_admin_secret');
    if (!stored) return;
    verifyAdminSecret(stored).then((ok) => {
      if (ok) { setSecret(stored); setAuthed(true); }
      else sessionStorage.removeItem('ih_admin_secret');
    });
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    const ok = await verifyAdminSecret(secret);
    if (!ok) { setAuthError('Incorrect password'); return; }
    sessionStorage.setItem('ih_admin_secret', secret);
    setAuthed(true);
  };

  const load = async (targetEmail?: string) => {
    const q = (targetEmail ?? email).trim().toLowerCase();
    if (!q) return;
    setLoading(true);
    setError('');
    setMessage('');
    setConfirmRemove(null);
    try {
      const res = await fetch(`/api/admin/stations?email=${encodeURIComponent(q)}`, {
        headers: { 'x-admin-secret': secret },
      });
      const data = await res.json();
      if (!res.ok) { setAccount(null); setError(data.error || 'Lookup failed'); return; }
      setAccount(data);
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (docId: string) => {
    if (!account) return;
    setBusy(true);
    setError('');
    setMessage('');
    try {
      const res = await fetch('/api/admin/stations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminSecret: secret, action: 'remove', email: account.email, docId }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Remove failed'); return; }
      setMessage(data.docDeleted
        ? '✓ Station unlinked and its directory listing deleted (it was created by a portal invite).'
        : '✓ Station unlinked. The directory listing was kept because it is pre-existing data — delete it from the Database page if needed.');
      await load(account.email);
    } catch {
      setError('Network error');
    } finally {
      setBusy(false);
      setConfirmRemove(null);
    }
  };

  const handleAdd = async () => {
    if (!account || newIcao.trim().length < 3) return;
    setBusy(true);
    setError('');
    setMessage('');
    try {
      const res = await fetch('/api/admin/stations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminSecret: secret, action: 'add', email: account.email, icao: newIcao.trim().toUpperCase() }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Add failed'); return; }
      setMessage(data.reusedExistingDoc
        ? `✓ Station ${data.icao} linked — reused the existing directory listing for this email.`
        : `✓ Station ${data.icao} created and linked. The owner can now edit it from their portal.`);
      setNewIcao('');
      await load(account.email);
    } catch {
      setError('Network error');
    } finally {
      setBusy(false);
    }
  };

  if (!authed) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen pt-24 pb-20 px-4 bg-white flex items-center justify-center">
          <div className="w-full max-w-sm">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900">Admin Access</h1>
              <p className="text-gray-400 text-sm mt-1">i-Handler internal portal</p>
            </div>
            <form onSubmit={handleLogin} className="space-y-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              {authError && (
                <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">{authError}</div>
              )}
              <input type="password" required value={secret} onChange={(e) => setSecret(e.target.value)}
                placeholder="Enter admin secret"
                className="w-full px-4 py-3 rounded-xl bg-white border border-gray-300 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#F34707] focus:ring-2 focus:ring-[#F34707]/20 transition-colors text-sm" />
              <button type="submit"
                className="w-full py-3 rounded-xl bg-[#F34707] hover:bg-[#d93d06] text-white font-semibold text-sm transition-colors shadow-md">
                Enter Admin Portal
              </button>
            </form>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 pb-20 px-4 bg-white">
        <div className="max-w-3xl mx-auto">

          {/* Header */}
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F34707]/10 text-[#F34707] text-xs font-semibold mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#F34707]" />
              Admin Portal
            </div>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Station Manager</h1>
                <p className="text-gray-400 text-sm mt-1">Add or remove ICAO stations for a portal account</p>
              </div>
              <Link href="/admin"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold text-sm transition-colors">
                ← Back
              </Link>
            </div>
          </div>

          {/* Search */}
          <div className="flex gap-3 mb-6">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') load(); }}
              placeholder="owner@company.com"
              className="flex-1 px-4 py-3 rounded-xl border border-gray-300 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#F34707] focus:ring-2 focus:ring-[#F34707]/20 transition-colors"
            />
            <button onClick={() => load()} disabled={loading || !email.trim()}
              className="px-6 py-3 rounded-xl bg-[#F34707] hover:bg-[#d93d06] text-white font-semibold text-sm transition-colors disabled:opacity-50">
              {loading ? 'Loading…' : 'Load Account'}
            </button>
          </div>

          {error && (
            <div className="mb-6 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">{error}</div>
          )}
          {message && (
            <div className="mb-6 px-4 py-3 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm">{message}</div>
          )}

          {account && (
            <div className="rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-gray-700">{account.email}</h2>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {account.companyType === 'fbo' ? 'FBO' : 'Handler'} account · {account.stations.length} {account.stations.length === 1 ? 'station' : 'stations'}
                  </p>
                </div>
              </div>

              <div className="divide-y divide-gray-100">
                {account.stations.map((s) => (
                  <div key={s.docId} className="flex items-center gap-4 px-6 py-4">
                    <span className="font-mono text-sm text-[#F34707] font-bold w-16 flex-shrink-0">{s.icao || '—'}</span>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${s.missing ? 'text-red-400 italic' : 'text-gray-900'}`}>{s.companyName}</p>
                      <p className="text-xs text-gray-400">
                        {s.missing ? 'Broken link — directory document no longer exists'
                          : s.createdByPortalInvite ? 'Created by portal invite' : 'Pre-existing directory listing'}
                      </p>
                    </div>
                    {confirmRemove === s.docId ? (
                      <span className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-xs text-red-600 font-medium">
                          {account.stations.length === 1 ? 'Last station — portal will be empty!' : 'Remove?'}
                        </span>
                        <button onClick={() => handleRemove(s.docId)} disabled={busy}
                          className="text-xs px-2.5 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold transition-colors disabled:opacity-50">
                          {busy ? 'Removing…' : 'Yes, remove'}
                        </button>
                        <button onClick={() => setConfirmRemove(null)} disabled={busy}
                          className="text-xs px-2.5 py-1 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 font-medium transition-colors">
                          Cancel
                        </button>
                      </span>
                    ) : (
                      <button onClick={() => setConfirmRemove(s.docId)}
                        className="text-xs px-2.5 py-1 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 font-medium transition-colors flex-shrink-0">
                        Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Add station */}
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center gap-3">
                <input
                  type="text"
                  value={newIcao}
                  onChange={(e) => setNewIcao(e.target.value.toUpperCase())}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleAdd(); }}
                  placeholder="New ICAO (e.g. MHTG)"
                  maxLength={4}
                  className="w-44 px-3 py-2 rounded-lg border border-gray-300 text-sm font-mono text-gray-900 placeholder:text-gray-400 placeholder:font-sans focus:outline-none focus:border-[#F34707] focus:ring-2 focus:ring-[#F34707]/20 transition-colors"
                />
                <button onClick={handleAdd} disabled={busy || newIcao.trim().length < 3}
                  className="px-4 py-2 rounded-lg bg-[#F34707] hover:bg-[#d93d06] text-white font-semibold text-sm transition-colors disabled:opacity-50">
                  {busy ? 'Working…' : '+ Add Station'}
                </button>
                <p className="text-xs text-gray-400">
                  Reuses the existing listing for this email at that ICAO, or creates a new one the owner can edit.
                </p>
              </div>
            </div>
          )}

        </div>
      </main>
      <Footer />
    </>
  );
}
