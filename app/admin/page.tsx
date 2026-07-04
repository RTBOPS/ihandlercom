'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { verifyAdminSecret } from '@/lib/adminAuth';

type Invitation = {
  id: string;
  email: string;
  companyName: string;
  companyType: 'fbo' | 'handler';
  icao: string;
  emailType: 'new' | 'annual';
  contactName?: string;
  pocName?: string;
  status: string;
  isExisting: boolean;
  sentAt: string | null;
  accountExists?: boolean;
  lastSignIn?: string | null;
  emailEvents?: Record<string, string>;
  emailBounceReason?: string;
};

type DeliveryStatus = 'bounced' | 'spam' | 'clicked' | 'opened' | 'delivered' | null;

function deliveryStatus(ev?: Record<string, string>): DeliveryStatus {
  if (!ev) return null;
  if (ev.bounce || ev.dropped) return 'bounced';
  if (ev.spamreport) return 'spam';
  if (ev.click) return 'clicked';
  if (ev.open) return 'opened';
  if (ev.delivered) return 'delivered';
  return null;
}

function DeliveryBadge({ inv }: { inv: Invitation }) {
  const st = deliveryStatus(inv.emailEvents);
  if (st === 'bounced') return <span title={inv.emailBounceReason} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">Bounced</span>;
  if (st === 'spam') return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">Spam</span>;
  if (st === 'clicked') return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">Clicked</span>;
  if (st === 'opened') return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-sky-100 text-sky-700">Opened</span>;
  if (st === 'delivered') return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">Delivered</span>;
  return <span className="text-xs text-gray-300">—</span>;
}

type ResendState = { status: 'sending' | 'sent' | 'error'; msg?: string };

function buildSupportReply(inv: Invitation): string {
  const name = inv.contactName || inv.pocName;
  const greeting = name ? `Dear ${name},` : `Dear ${inv.companyName} Team,`;
  return `${greeting}

Thank you for reaching out, and we apologize for the inconvenience.

We have just re-sent your i-Handler portal access credentials to this email address (${inv.email}). Please check your inbox — and your spam/junk folder — for a message from cto@i-handler.app containing your new login details.

Portal: https://www.i-handler.com/portal-login

If you still cannot access your portal after that, simply reply to this email and we will assist you right away.

Best regards,
Felipe Aguilar
i-Handler Operations Team
cto@i-handler.app · www.i-handler.com`;
}

export default function AdminPage() {
  const [secret, setSecret] = useState('');
  const [authed, setAuthed] = useState(false);
  const [authError, setAuthError] = useState('');
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(false);
  const [resendState, setResendState] = useState<Record<string, ResendState>>({});
  const [copiedReply, setCopiedReply] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [onlyNeverSignedIn, setOnlyNeverSignedIn] = useState(false);

  // Check sessionStorage on mount
  useEffect(() => {
    const stored = sessionStorage.getItem('ih_admin_secret');
    if (!stored) return;
    verifyAdminSecret(stored).then((ok) => {
      if (ok) { setSecret(stored); setAuthed(true); }
      else sessionStorage.removeItem('ih_admin_secret');
    });
  }, []);

  const loadInvitations = useCallback(async (s: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/invitations', {
        headers: { 'x-admin-secret': s },
      });
      if (res.ok) {
        const data = await res.json();
        setInvitations(data.invitations || []);
      }
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (authed && secret) loadInvitations(secret);
  }, [authed, secret, loadInvitations]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    const ok = await verifyAdminSecret(secret);
    if (!ok) { setAuthError('Incorrect password'); return; }
    sessionStorage.setItem('ih_admin_secret', secret);
    setAuthed(true);
  };

  const handleResend = async (inv: Invitation) => {
    setResendState((prev) => ({ ...prev, [inv.email]: { status: 'sending' } }));
    try {
      const res = await fetch('/api/admin/resend-invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminSecret: secret,
          email: inv.email,
          companyName: inv.companyName,
          companyType: inv.companyType,
          icao: inv.icao,
          contactName: inv.contactName || inv.pocName || '',
          emailType: inv.emailType,
        }),
      });
      const data = await res.json();
      if (res.ok && data.emailSent) {
        setResendState((prev) => ({ ...prev, [inv.email]: { status: 'sent' } }));
      } else {
        setResendState((prev) => ({ ...prev, [inv.email]: { status: 'error', msg: data.error || 'Send failed' } }));
      }
    } catch {
      setResendState((prev) => ({ ...prev, [inv.email]: { status: 'error', msg: 'Network error' } }));
    }
  };

  const handleCopyReply = async (inv: Invitation) => {
    await navigator.clipboard.writeText(buildSupportReply(inv));
    setCopiedReply(inv.email);
    setTimeout(() => setCopiedReply((cur) => (cur === inv.email ? null : cur)), 3000);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('ih_admin_secret');
    setAuthed(false);
    setSecret('');
    setInvitations([]);
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

  const newCount = invitations.filter((i) => i.emailType === 'new').length;
  const annualCount = invitations.filter((i) => i.emailType === 'annual').length;
  const neverSignedInCount = invitations.filter((i) => !i.lastSignIn).length;
  const bouncedCount = invitations.filter((i) => deliveryStatus(i.emailEvents) === 'bounced' || deliveryStatus(i.emailEvents) === 'spam').length;

  const q = search.trim().toLowerCase();
  const filtered = invitations.filter((inv) => {
    if (onlyNeverSignedIn && inv.lastSignIn) return false;
    if (!q) return true;
    return (
      inv.companyName?.toLowerCase().includes(q) ||
      inv.email?.toLowerCase().includes(q) ||
      inv.icao?.toLowerCase().includes(q)
    );
  });

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 pb-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto">

          {/* Header */}
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F34707]/10 text-[#F34707] text-xs font-semibold mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#F34707]" />
              Admin Portal
            </div>
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Invitation Management</h1>
                <p className="text-gray-400 text-sm mt-1">Send and track invitations to FBO & Handler companies</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link href="/admin/status"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#F34707] hover:bg-[#d93d06] text-white font-semibold text-sm transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Status Dashboard
                </Link>
                <Link href="/admin/owners"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#F34707] hover:bg-[#d93d06] text-white font-semibold text-sm transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Owners
                </Link>
                <Link href="/admin/subscriptions"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#F34707]/80 hover:bg-[#d93d06] text-white font-semibold text-sm transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  Subscriptions
                </Link>
                <Link href="/admin/db"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold text-sm transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                  </svg>
                  Database
                </Link>
                <Link href="/admin/bulk"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold text-sm transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Send to All
                </Link>
                <Link href="/admin/invite"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#F34707] hover:bg-[#d93d06] text-white font-semibold text-sm transition-colors shadow-md">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Send Invitation
                </Link>
                <Link href="/admin/stations"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold text-sm transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Stations
                </Link>
                <Link href="/admin/change-email"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold text-sm transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Change Email
                </Link>
                <button onClick={handleLogout}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-gray-500 text-sm hover:bg-gray-50 transition-colors">
                  Sign Out
                </button>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
            {[
              { label: 'Total Sent', value: invitations.length, color: 'bg-blue-50 text-blue-600 border-blue-100' },
              { label: 'New Companies', value: newCount, color: 'bg-green-50 text-green-600 border-green-100' },
              { label: 'Annual Updates', value: annualCount, color: 'bg-orange-50 text-[#F34707] border-orange-100' },
              { label: 'Never Signed In', value: neverSignedInCount, color: 'bg-amber-50 text-amber-600 border-amber-100' },
              { label: 'Bounced / Spam', value: bouncedCount, color: 'bg-red-50 text-red-600 border-red-100' },
            ].map((s) => (
              <div key={s.label} className={`rounded-2xl border p-5 ${s.color}`}>
                <div className="text-3xl font-bold mb-1">{s.value}</div>
                <div className="text-sm font-medium opacity-80">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Table */}
          <div className="rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex flex-wrap items-center gap-3">
              <h2 className="text-sm font-semibold text-gray-700">Invitation History</h2>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search company, email or ICAO…"
                className="flex-1 min-w-[220px] px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#F34707] focus:ring-2 focus:ring-[#F34707]/20 transition-colors"
              />
              <label className="flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer select-none whitespace-nowrap">
                <input
                  type="checkbox"
                  checked={onlyNeverSignedIn}
                  onChange={(e) => setOnlyNeverSignedIn(e.target.checked)}
                  className="accent-[#F34707]"
                />
                Never signed in only
              </label>
              <button onClick={() => loadInvitations(secret)}
                className="text-xs text-gray-400 hover:text-gray-600 transition-colors flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
            </div>

            {loading ? (
              <div className="p-12 text-center text-gray-400 text-sm">Loading invitations...</div>
            ) : invitations.length === 0 ? (
              <div className="p-12 text-center">
                <div className="text-gray-300 mb-3">
                  <svg className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-gray-400 text-sm">No invitations sent yet.</p>
                <Link href="/admin/invite" className="text-[#F34707] text-sm font-semibold mt-2 inline-block hover:underline">
                  Send your first invitation →
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left px-6 py-3 text-xs text-gray-400 font-semibold uppercase tracking-wider">Company</th>
                      <th className="text-left px-6 py-3 text-xs text-gray-400 font-semibold uppercase tracking-wider">ICAO</th>
                      <th className="text-left px-6 py-3 text-xs text-gray-400 font-semibold uppercase tracking-wider">Type</th>
                      <th className="text-left px-6 py-3 text-xs text-gray-400 font-semibold uppercase tracking-wider">Email</th>
                      <th className="text-left px-6 py-3 text-xs text-gray-400 font-semibold uppercase tracking-wider">Kind</th>
                      <th className="text-left px-6 py-3 text-xs text-gray-400 font-semibold uppercase tracking-wider">Access</th>
                      <th className="text-left px-6 py-3 text-xs text-gray-400 font-semibold uppercase tracking-wider">Delivery</th>
                      <th className="text-left px-6 py-3 text-xs text-gray-400 font-semibold uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-xs text-gray-400 font-semibold uppercase tracking-wider text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((inv, i) => (
                      <tr key={inv.id} className={`border-b border-gray-100 hover:bg-orange-50 transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{inv.companyName}</td>
                        <td className="px-6 py-4 text-sm font-mono text-[#F34707] font-bold">{inv.icao}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${inv.companyType === 'fbo' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                            {inv.companyType === 'fbo' ? 'FBO' : 'Handler'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">{inv.email}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${inv.emailType === 'new' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                            {inv.emailType === 'new' ? 'New Company' : 'Annual Update'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {inv.lastSignIn ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700"
                              title={`Last sign-in: ${new Date(inv.lastSignIn).toLocaleString('en-US')}`}>
                              Active
                            </span>
                          ) : inv.accountExists ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                              Never signed in
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
                              No account
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4"><DeliveryBadge inv={inv} /></td>
                        <td className="px-6 py-4 text-sm text-gray-400">
                          {inv.sentAt ? new Date(inv.sentAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                        </td>
                        <td className="px-6 py-4 text-right whitespace-nowrap">
                          {(() => {
                            const rs = resendState[inv.email];
                            if (rs?.status === 'sending') {
                              return <span className="text-xs text-gray-400 font-medium">Sending…</span>;
                            }
                            if (rs?.status === 'sent') {
                              return (
                                <span className="inline-flex items-center gap-2">
                                  <span className="text-xs text-green-600 font-semibold">✓ Sent</span>
                                  <button onClick={() => handleCopyReply(inv)}
                                    className="text-xs px-2.5 py-1 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium transition-colors">
                                    {copiedReply === inv.email ? '✓ Copied' : 'Copy Reply'}
                                  </button>
                                </span>
                              );
                            }
                            return (
                              <span className="inline-flex items-center gap-2">
                                {rs?.status === 'error' && (
                                  <span className="text-xs text-red-500" title={rs.msg}>Failed</span>
                                )}
                                <button onClick={() => handleResend(inv)}
                                  className="text-xs px-2.5 py-1 rounded-lg bg-[#F34707] hover:bg-[#d93d06] text-white font-semibold transition-colors">
                                  {rs?.status === 'error' ? 'Retry' : 'Resend Credentials'}
                                </button>
                              </span>
                            );
                          })()}
                        </td>
                      </tr>
                    ))}
                    {filtered.length === 0 && (
                      <tr>
                        <td colSpan={9} className="px-6 py-10 text-center text-sm text-gray-400">
                          No invitations match your search.
                        </td>
                      </tr>
                    )}
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
