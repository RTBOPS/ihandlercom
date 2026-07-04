'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { verifyAdminSecret } from '@/lib/adminAuth';
import type { StatusEntry } from '@/app/api/admin/status/route';

type StatusFilter = 'all' | 'never_logged_in' | 'logged_in' | 'updated';
type TypeFilter = 'all' | 'handler' | 'fbo';

function fmtDate(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function DeliveryBadge({ status }: { status: StatusEntry['deliveryStatus'] }) {
  if (status === 'bounced') return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">Bounced</span>;
  if (status === 'spam') return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">Spam</span>;
  if (status === 'clicked') return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">Clicked</span>;
  if (status === 'opened') return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-sky-100 text-sky-700">Opened</span>;
  if (status === 'delivered') return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">Delivered</span>;
  return <span className="text-xs text-gray-300">—</span>;
}

function CompletenessBar({ value }: { value: number | null }) {
  if (value == null) return <span className="text-xs text-gray-300">—</span>;
  const color = value >= 70 ? 'bg-green-500' : value >= 40 ? 'bg-amber-400' : 'bg-red-400';
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-1.5 rounded-full bg-gray-100 overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${value}%` }} />
      </div>
      <span className="text-xs text-gray-500 w-8">{value}%</span>
    </div>
  );
}

function StatusBadge({ status }: { status: StatusEntry['status'] }) {
  if (status === 'updated') {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">
        Updated ✓
      </span>
    );
  }
  if (status === 'logged_in') {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
        Logged in
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-600">
      Never logged in
    </span>
  );
}

export default function StatusPage() {
  const [secret, setSecret] = useState('');
  const [authed, setAuthed] = useState(false);
  const [authError, setAuthError] = useState('');
  const [entries, setEntries] = useState<StatusEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [repairing, setRepairing] = useState(false);
  const [repairResult, setRepairResult] = useState<{ repaired: number; ok: number; skipped: number } | null>(null);
  const [resendingEmail, setResendingEmail] = useState<string | null>(null);
  const [resendResults, setResendResults] = useState<Record<string, 'sent' | 'error'>>({});
  const [remind, setRemind] = useState<{
    phase: 'idle' | 'loading' | 'confirm' | 'sending' | 'done';
    candidates: { email: string; companyName: string; icao: string }[];
    sent: number;
    failed: number;
  }>({ phase: 'idle', candidates: [], sent: 0, failed: 0 });

  // Check sessionStorage on mount
  useEffect(() => {
    const stored = sessionStorage.getItem('ih_admin_secret');
    if (!stored) return;
    verifyAdminSecret(stored).then((ok) => {
      if (ok) { setSecret(stored); setAuthed(true); }
      else sessionStorage.removeItem('ih_admin_secret');
    });
  }, []);

  const loadEntries = useCallback(async (s: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/status', {
        headers: { 'x-admin-secret': s },
      });
      if (res.ok) {
        const data = await res.json();
        setEntries(data.entries || []);
      }
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (authed && secret) loadEntries(secret);
  }, [authed, secret, loadEntries]);

  const handleRepair = async () => {
    setRepairing(true);
    setRepairResult(null);
    try {
      const res = await fetch('/api/admin/repair-portal-links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminSecret: secret }),
      });
      const data = await res.json();
      setRepairResult({ repaired: data.repaired, ok: data.ok, skipped: data.skipped });
      await loadEntries(secret);
    } catch { /* ignore */ }
    finally { setRepairing(false); }
  };

  const handleResend = async (entry: StatusEntry) => {
    setResendingEmail(entry.email);
    try {
      const res = await fetch('/api/admin/resend-invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminSecret: secret,
          email: entry.email,
          companyName: entry.companyName,
          companyType: entry.companyType,
          icao: entry.icao,
          contactName: entry.contactName,
          emailType: 'new',
        }),
      });
      const data = await res.json();
      setResendResults(prev => ({ ...prev, [entry.email]: data.emailSent ? 'sent' : 'error' }));
    } catch {
      setResendResults(prev => ({ ...prev, [entry.email]: 'error' }));
    } finally {
      setResendingEmail(null);
    }
  };

  const handleRemindPreview = async () => {
    setRemind({ phase: 'loading', candidates: [], sent: 0, failed: 0 });
    try {
      const res = await fetch('/api/admin/remind', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminSecret: secret, dryRun: true }),
      });
      const data = await res.json();
      setRemind({ phase: 'confirm', candidates: data.candidates || [], sent: 0, failed: 0 });
    } catch {
      setRemind({ phase: 'idle', candidates: [], sent: 0, failed: 0 });
    }
  };

  const handleRemindSend = async () => {
    const emails = remind.candidates.map((c) => c.email);
    setRemind((r) => ({ ...r, phase: 'sending', sent: 0, failed: 0 }));
    let sent = 0;
    let failed = 0;
    for (let i = 0; i < emails.length; i += 20) {
      const chunk = emails.slice(i, i + 20);
      try {
        const res = await fetch('/api/admin/remind', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ adminSecret: secret, emails: chunk }),
        });
        const data = await res.json();
        for (const r of data.results || []) {
          if (r.sent) sent++; else failed++;
        }
      } catch {
        failed += chunk.length;
      }
      setRemind((r) => ({ ...r, sent, failed }));
    }
    setRemind((r) => ({ ...r, phase: 'done', sent, failed }));
    await loadEntries(secret);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    const ok = await verifyAdminSecret(secret);
    if (!ok) { setAuthError('Incorrect password'); return; }
    sessionStorage.setItem('ih_admin_secret', secret);
    setAuthed(true);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('ih_admin_secret');
    setAuthed(false);
    setSecret('');
    setEntries([]);
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
              {authError && (
                <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">{authError}</div>
              )}
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

  // Summary counts
  const total = entries.length;
  const neverCount = entries.filter((e) => e.status === 'never_logged_in').length;
  const loggedCount = entries.filter((e) => e.status === 'logged_in').length;
  const updatedCount = entries.filter((e) => e.status === 'updated').length;

  // Filtered entries
  const filtered = entries.filter((e) => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      e.companyName.toLowerCase().includes(q) ||
      e.email.toLowerCase().includes(q) ||
      e.icao.toLowerCase().includes(q) ||
      e.contactName.toLowerCase().includes(q);
    const matchStatus = statusFilter === 'all' || e.status === statusFilter;
    const matchType = typeFilter === 'all' || e.companyType === typeFilter;
    return matchSearch && matchStatus && matchType;
  });

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 pb-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">

          {/* Header */}
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F34707]/10 text-[#F34707] text-xs font-semibold mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#F34707]" />
              Admin Portal
            </div>
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Handler &amp; FBO Status</h1>
                <p className="text-gray-400 text-sm mt-1">Track who has updated their portal listing</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link href="/admin"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold text-sm transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back
                </Link>
                <button onClick={() => loadEntries(secret)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#F34707] hover:bg-[#d93d06] text-white font-semibold text-sm transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh
                </button>
                <button onClick={handleRepair} disabled={repairing}
                  title="Fix broken portal access for all invited handlers"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-700 font-semibold text-sm transition-colors disabled:opacity-50">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  {repairing ? 'Repairing…' : 'Repair Access'}
                </button>
                {repairResult && (
                  <span className="text-xs text-green-700 bg-green-50 border border-green-200 px-3 py-2 rounded-lg">
                    ✓ {repairResult.repaired} repaired · {repairResult.ok} already ok · {repairResult.skipped} skipped
                  </span>
                )}
                <button onClick={handleRemindPreview} disabled={remind.phase === 'loading' || remind.phase === 'sending'}
                  title="Send a one-time reminder with fresh credentials to everyone who never logged in (skips bounced emails and already-reminded companies)"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-blue-300 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-sm transition-colors disabled:opacity-50">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  {remind.phase === 'loading' ? 'Checking…' : 'Remind Never Logged In'}
                </button>
                <button onClick={handleLogout}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-gray-500 text-sm hover:bg-gray-50 transition-colors">
                  Sign Out
                </button>
              </div>
            </div>
          </div>

          {/* Reminder confirm / progress banner */}
          {remind.phase === 'confirm' && (
            <div className="mb-6 rounded-2xl border border-blue-200 bg-blue-50 p-5 flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-1">
                <p className="text-sm font-semibold text-blue-800">
                  {remind.candidates.length === 0
                    ? 'No eligible companies — everyone was already reminded, logged in, or their email bounced.'
                    : `Send a reminder with fresh credentials to ${remind.candidates.length} ${remind.candidates.length === 1 ? 'company' : 'companies'} that never logged in?`}
                </p>
                {remind.candidates.length > 0 && (
                  <p className="text-xs text-blue-600 mt-1">
                    Skips bounced emails and companies already reminded. Each gets a new temporary password.
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                {remind.candidates.length > 0 && (
                  <button onClick={handleRemindSend}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-colors">
                    Send {remind.candidates.length} Reminders
                  </button>
                )}
                <button onClick={() => setRemind({ phase: 'idle', candidates: [], sent: 0, failed: 0 })}
                  className="px-4 py-2 rounded-xl border border-blue-200 text-blue-600 font-semibold text-sm hover:bg-blue-100 transition-colors">
                  Cancel
                </button>
              </div>
            </div>
          )}
          {remind.phase === 'sending' && (
            <div className="mb-6 rounded-2xl border border-blue-200 bg-blue-50 p-5">
              <p className="text-sm font-semibold text-blue-800">
                Sending reminders… {remind.sent + remind.failed} of {remind.candidates.length}
              </p>
              <div className="mt-2 h-2 rounded-full bg-blue-100 overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full transition-all"
                  style={{ width: `${remind.candidates.length ? Math.round(((remind.sent + remind.failed) / remind.candidates.length) * 100) : 0}%` }} />
              </div>
            </div>
          )}
          {remind.phase === 'done' && (
            <div className="mb-6 rounded-2xl border border-green-200 bg-green-50 p-5 flex items-center justify-between gap-4">
              <p className="text-sm font-semibold text-green-800">
                ✓ Reminders sent: {remind.sent}{remind.failed > 0 ? ` · Failed: ${remind.failed}` : ''}
              </p>
              <button onClick={() => setRemind({ phase: 'idle', candidates: [], sent: 0, failed: 0 })}
                className="px-3 py-1.5 rounded-lg border border-green-200 text-green-700 text-xs font-semibold hover:bg-green-100 transition-colors">
                Dismiss
              </button>
            </div>
          )}

          {/* Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            <div className="rounded-2xl border border-orange-100 bg-orange-50 p-5">
              <div className="text-3xl font-bold text-[#F34707] mb-1">{total}</div>
              <div className="text-sm font-medium text-[#F34707]/80">Total Invited</div>
            </div>
            <div className="rounded-2xl border border-red-100 bg-red-50 p-5">
              <div className="text-3xl font-bold text-red-600 mb-1">{neverCount}</div>
              <div className="text-sm font-medium text-red-600/80">Never Logged In</div>
            </div>
            <div className="rounded-2xl border border-amber-100 bg-amber-50 p-5">
              <div className="text-3xl font-bold text-amber-600 mb-1">{loggedCount}</div>
              <div className="text-sm font-medium text-amber-600/80">Logged In, Not Updated</div>
            </div>
            <div className="rounded-2xl border border-green-100 bg-green-50 p-5">
              <div className="text-3xl font-bold text-green-600 mb-1">{updatedCount}</div>
              <div className="text-sm font-medium text-green-600/80">Updated ✓</div>
            </div>
          </div>

          {/* Filter bar */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <input
              type="text"
              placeholder="Search by name, email or ICAO..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#F34707] focus:ring-2 focus:ring-[#F34707]/20 transition-colors"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              className="px-4 py-2.5 rounded-xl border border-gray-300 text-sm text-gray-700 focus:outline-none focus:border-[#F34707] focus:ring-2 focus:ring-[#F34707]/20 transition-colors bg-white"
            >
              <option value="all">All Statuses</option>
              <option value="never_logged_in">Never Logged In</option>
              <option value="logged_in">Logged In</option>
              <option value="updated">Updated</option>
            </select>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as TypeFilter)}
              className="px-4 py-2.5 rounded-xl border border-gray-300 text-sm text-gray-700 focus:outline-none focus:border-[#F34707] focus:ring-2 focus:ring-[#F34707]/20 transition-colors bg-white"
            >
              <option value="all">All Types</option>
              <option value="handler">Handler</option>
              <option value="fbo">FBO</option>
            </select>
          </div>

          {/* Table */}
          <div className="rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-700">
                {filtered.length} {filtered.length === 1 ? 'company' : 'companies'}
                {filtered.length !== total && ` (filtered from ${total})`}
              </h2>
            </div>

            {loading ? (
              <div className="p-12 text-center text-gray-400 text-sm">Loading status data… this may take a moment.</div>
            ) : filtered.length === 0 ? (
              <div className="p-12 text-center text-gray-400 text-sm">No results match your filters.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left px-6 py-3 text-xs text-gray-400 font-semibold uppercase tracking-wider">Company</th>
                      <th className="text-left px-6 py-3 text-xs text-gray-400 font-semibold uppercase tracking-wider">Type</th>
                      <th className="text-left px-6 py-3 text-xs text-gray-400 font-semibold uppercase tracking-wider">Email</th>
                      <th className="text-left px-6 py-3 text-xs text-gray-400 font-semibold uppercase tracking-wider">Invited</th>
                      <th className="text-left px-6 py-3 text-xs text-gray-400 font-semibold uppercase tracking-wider">Delivery</th>
                      <th className="text-left px-6 py-3 text-xs text-gray-400 font-semibold uppercase tracking-wider">Last Login</th>
                      <th className="text-left px-6 py-3 text-xs text-gray-400 font-semibold uppercase tracking-wider">Last Updated</th>
                      <th className="text-left px-6 py-3 text-xs text-gray-400 font-semibold uppercase tracking-wider">Profile</th>
                      <th className="text-left px-6 py-3 text-xs text-gray-400 font-semibold uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-xs text-gray-400 font-semibold uppercase tracking-wider text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((entry, i) => (
                      <tr key={entry.email} className={`border-b border-gray-100 hover:bg-orange-50 transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                        <td className="px-6 py-4">
                          <div className="font-medium text-sm text-gray-900">{entry.companyName}</div>
                          <div className="text-xs font-mono text-[#F34707] font-bold mt-0.5">{entry.icao}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${entry.companyType === 'fbo' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                            {entry.companyType === 'fbo' ? 'FBO' : 'Handler'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">{entry.email}</td>
                        <td className="px-6 py-4 text-sm text-gray-400">{fmtDate(entry.sentAt)}</td>
                        <td className="px-6 py-4"><DeliveryBadge status={entry.deliveryStatus} /></td>
                        <td className="px-6 py-4 text-sm text-gray-400">{entry.lastSignIn ? fmtDate(entry.lastSignIn) : <span className="text-red-400">Never</span>}</td>
                        <td className="px-6 py-4 text-sm text-gray-400">{fmtDate(entry.lastUpdated)}</td>
                        <td className="px-6 py-4"><CompletenessBar value={entry.completeness} /></td>
                        <td className="px-6 py-4">
                          <StatusBadge status={entry.status} />
                          {entry.remindedAt && (
                            <div className="text-[10px] text-gray-400 mt-1">reminded {fmtDate(entry.remindedAt)}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          {resendResults[entry.email] === 'sent' ? (
                            <span className="text-xs text-green-600 font-medium">✓ Sent</span>
                          ) : resendResults[entry.email] === 'error' ? (
                            <button onClick={() => handleResend(entry)} className="text-xs text-red-500 hover:text-red-700 font-medium">
                              Failed — Retry
                            </button>
                          ) : (
                            <button
                              onClick={() => handleResend(entry)}
                              disabled={resendingEmail === entry.email}
                              className="text-xs text-[#F34707] hover:text-[#d93d06] font-medium transition-colors disabled:opacity-50">
                              {resendingEmail === entry.email ? 'Sending…' : 'Resend'}
                            </button>
                          )}
                        </td>
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
