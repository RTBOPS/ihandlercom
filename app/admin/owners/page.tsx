'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

type Owner = {
  uid: string;
  email: string;
  companyName: string;
  companyType: 'fbo' | 'handler';
  icao: string;
  status: string;
  tempPassword: string | null;
  hasUpdated: boolean;
  createdAt: string | null;
};

function fmt(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };
  return (
    <button
      onClick={copy}
      title="Copy"
      className="ml-1.5 inline-flex items-center justify-center w-5 h-5 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-400 hover:text-gray-700 transition-colors flex-shrink-0">
      {copied
        ? <svg className="w-3 h-3 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/></svg>
        : <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>}
    </button>
  );
}

function PasswordCell({ pw }: { pw: string | null }) {
  const [show, setShow] = useState(false);
  if (!pw) return <span className="text-gray-300 text-xs italic">not stored</span>;
  return (
    <span className="inline-flex items-center gap-1">
      <span className="font-mono text-xs text-gray-700 select-all">
        {show ? pw : '••••••••••••'}
      </span>
      <button
        onClick={() => setShow((s) => !s)}
        className="ml-1 inline-flex items-center justify-center w-5 h-5 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-400 hover:text-gray-700 transition-colors flex-shrink-0"
        title={show ? 'Hide' : 'Show'}>
        {show
          ? <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/></svg>
          : <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>}
      </button>
      {show && <CopyBtn text={pw} />}
    </span>
  );
}

export default function AdminOwnersPage() {
  const [secret, setSecret] = useState('');
  const [authed, setAuthed] = useState(false);
  const [owners, setOwners] = useState<Owner[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'fbo' | 'handler'>('all');
  const [filterUpdated, setFilterUpdated] = useState<'all' | 'yes' | 'no'>('all');

  useEffect(() => {
    const stored = sessionStorage.getItem('ih_admin_secret');
    if (stored) { setAuthed(true); setSecret(stored); }
  }, []);

  const load = useCallback(async (s: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/owners', { headers: { 'x-admin-secret': s } });
      if (res.ok) { const data = await res.json(); setOwners(data.owners || []); }
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { if (authed && secret) load(secret); }, [authed, secret, load]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    sessionStorage.setItem('ih_admin_secret', secret);
    setAuthed(true);
  };

  if (!authed) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen pt-24 pb-20 px-4 bg-white flex items-center justify-center">
          <div className="w-full max-w-sm">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#F34707]/10 mb-4">
                <svg className="w-7 h-7 text-[#F34707]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Access</h1>
              <p className="text-gray-400 text-sm mt-1">i-Handler internal portal</p>
            </div>
            <form onSubmit={handleLogin} className="space-y-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div>
                <label className="block text-sm text-gray-600 mb-1.5">Admin Password</label>
                <input type="password" required value={secret} onChange={(e) => setSecret(e.target.value)}
                  placeholder="Enter admin secret"
                  className="w-full px-4 py-3 rounded-xl bg-white border border-gray-300 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#F34707] focus:ring-2 focus:ring-[#F34707]/20 transition-colors text-sm" />
              </div>
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

  const filtered = owners.filter((o) => {
    const q = search.toLowerCase();
    const matchQ = !q || [o.email, o.companyName, o.icao].some((v) => v.toLowerCase().includes(q));
    const matchType = filterType === 'all' || o.companyType === filterType;
    const matchUpdated = filterUpdated === 'all' || (filterUpdated === 'yes') === o.hasUpdated;
    return matchQ && matchType && matchUpdated;
  });

  const totalFbo     = owners.filter((o) => o.companyType === 'fbo').length;
  const totalHandler = owners.filter((o) => o.companyType === 'handler').length;
  const totalUpdated = owners.filter((o) => o.hasUpdated).length;

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 pb-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">

          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F34707]/10 text-[#F34707] text-xs font-semibold mb-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#F34707]" />
                Admin Portal
              </div>
              <h1 className="text-3xl font-bold text-gray-900">FBO &amp; Handler Owners</h1>
              <p className="text-gray-400 text-sm mt-1">Accounts, credentials and update status</p>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <Link href="/admin"
                className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-500 text-sm hover:bg-gray-50 transition-colors">
                ← Admin Home
              </Link>
              <button onClick={() => load(secret)} disabled={loading}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-500 text-sm hover:bg-gray-50 transition-colors disabled:opacity-50">
                <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Total Owners',   value: owners.length,  color: 'bg-gray-50 text-gray-700 border-gray-200' },
              { label: 'FBOs',           value: totalFbo,       color: 'bg-blue-50 text-blue-700 border-blue-100' },
              { label: 'Handlers',       value: totalHandler,   color: 'bg-purple-50 text-purple-700 border-purple-100' },
              { label: 'Updated Info',   value: totalUpdated,   color: 'bg-green-50 text-green-700 border-green-100' },
            ].map((s) => (
              <div key={s.label} className={`rounded-2xl border p-5 ${s.color}`}>
                <div className="text-3xl font-bold mb-1">{s.value}</div>
                <div className="text-sm font-medium opacity-70">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3 mb-5">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search company, email or ICAO…"
              className="flex-1 min-w-48 px-4 py-2.5 rounded-xl border border-gray-300 text-gray-900 text-sm placeholder:text-gray-400 focus:outline-none focus:border-[#F34707] focus:ring-2 focus:ring-[#F34707]/20 transition-colors"
            />
            <select value={filterType} onChange={(e) => setFilterType(e.target.value as typeof filterType)}
              className="px-4 py-2.5 rounded-xl border border-gray-300 text-gray-700 text-sm focus:outline-none focus:border-[#F34707] transition-colors bg-white">
              <option value="all">All types</option>
              <option value="fbo">FBO only</option>
              <option value="handler">Handler only</option>
            </select>
            <select value={filterUpdated} onChange={(e) => setFilterUpdated(e.target.value as typeof filterUpdated)}
              className="px-4 py-2.5 rounded-xl border border-gray-300 text-gray-700 text-sm focus:outline-none focus:border-[#F34707] transition-colors bg-white">
              <option value="all">All statuses</option>
              <option value="yes">Updated info</option>
              <option value="no">Not updated</option>
            </select>
            <div className="flex items-center text-gray-400 text-sm px-1">
              {filtered.length} result{filtered.length !== 1 ? 's' : ''}
            </div>
          </div>

          {/* Table */}
          <div className="rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            {loading ? (
              <div className="py-20 text-center text-gray-400 text-sm">Loading owners…</div>
            ) : filtered.length === 0 ? (
              <div className="py-20 text-center text-gray-400 text-sm">No owners found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Company</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">ICAO</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Password</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Updated Info</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((owner, i) => (
                      <tr key={owner.uid}
                        className={`border-b border-gray-100 hover:bg-orange-50/60 transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'}`}>
                        <td className="px-5 py-4 font-semibold text-gray-900 max-w-[180px]">
                          <span className="truncate block">{owner.companyName || '—'}</span>
                        </td>
                        <td className="px-5 py-4 font-mono text-[#F34707] font-bold">{owner.icao || '—'}</td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                            owner.companyType === 'fbo'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-purple-100 text-purple-700'
                          }`}>
                            {owner.companyType === 'fbo' ? 'FBO' : 'Handler'}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-gray-600">
                          <span className="inline-flex items-center gap-1">
                            <a href={`mailto:${owner.email}`} className="hover:text-[#F34707] transition-colors truncate max-w-[180px] block">
                              {owner.email}
                            </a>
                            <CopyBtn text={owner.email} />
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <PasswordCell pw={owner.tempPassword} />
                        </td>
                        <td className="px-5 py-4">
                          {owner.hasUpdated ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/>
                              </svg>
                              Updated
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-yellow-50 text-yellow-600 text-xs font-semibold border border-yellow-200">
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                              </svg>
                              Pending
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-4 text-gray-400 text-xs whitespace-nowrap">{fmt(owner.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      </main>
      <Footer />
    </>
  );
}
