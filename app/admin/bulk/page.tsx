'use client';

import { useState, useEffect, useCallback } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

type EmailType = 'new' | 'annual';

type CompanyRow = {
  id: string;
  email: string;
  companyName: string;
  companyType: 'fbo' | 'handler';
  icao: string;
  selected: boolean;
};

type BulkResult = {
  email: string;
  companyName: string;
  companyType: string;
  icao: string;
  contactName: string;
  tempPassword: string | null;
  isExisting: boolean;
  error?: string;
};

const LOGIN_URL = 'https://ihandler-landing.vercel.app/login';

function buildEmailBody(r: BulkResult, emailType: EmailType): string {
  const greeting = `Dear ${r.companyName} Team,`;

  const credentialsBlock = r.isExisting
    ? `──────────────────────────────────────
  🔐 YOUR LOGIN CREDENTIALS
  Portal:   ${LOGIN_URL}
  Email:    ${r.email}
──────────────────────────────────────`
    : `──────────────────────────────────────
  🔐 YOUR LOGIN CREDENTIALS
  Portal:   ${LOGIN_URL}
  Email:    ${r.email}
  Password: ${r.tempPassword}
──────────────────────────────────────`;

  if (emailType === 'new') {
    return `${greeting}

We hope this message finds you well.

My name is [Your Name] from i-Handler, the leading digital platform for international private aviation operations. We are pleased to inform you that ${r.companyName} has been included in our global aviation directory — the reference used by operators, pilots, and dispatchers worldwide to find FBOs and ground handlers at airports around the globe.

Your company is listed under ICAO ${r.icao}.

We would like to invite you to access your private portal to verify and update your company information. Keeping your data current ensures that aviation professionals around the world can reach you with accurate contact details.

To access your portal, please use the following credentials:

${credentialsBlock}
${r.isExisting ? '' : '\nPlease log in and change your password after your first access.\n'}
In your portal you will be able to update:
  • Company contact information (phone, email, website, address)
  • Point of contact details
  • Car rental options at your airport
  • Catering services at your airport
  • Nearby hotel information

We would love to schedule a brief call to introduce you to all the features i-Handler offers. Please reply to this email to arrange a convenient time.

Thank you for being part of the i-Handler community.

Best regards,
[Your Name]
i-Handler Operations Team
operation@i-handler.app
www.i-handler.app`;
  }

  return `${greeting}

We hope the year has been going well for ${r.companyName}.

As part of our annual directory maintenance, we kindly ask you to review and update your company's information in the i-Handler platform. Accurate, up-to-date information ensures that aviation operators worldwide can contact you reliably.

Please log in to your portal using the credentials below:

${credentialsBlock}

Fields to review and update:
  • Contact information (phone, email, website)
  • Point of contact name and title
  • Car rental options near the airport
  • Catering services available
  • Nearby accommodation / hotels

This process takes only a few minutes, and we greatly appreciate your cooperation in keeping the i-Handler directory accurate and up-to-date.

If you have any questions, please do not hesitate to reach out.

Warm regards,
[Your Name]
i-Handler Operations Team
operation@i-handler.app
www.i-handler.app`;
}

type Step = 'select' | 'sending' | 'done';

export default function BulkInvitePage() {
  const [adminSecret, setAdminSecret] = useState('');
  const [authed, setAuthed] = useState(false);

  const [companies, setCompanies] = useState<CompanyRow[]>([]);
  const [loadingCompanies, setLoadingCompanies] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'fbo' | 'handler'>('all');
  const [filterText, setFilterText] = useState('');
  const [emailType, setEmailType] = useState<EmailType>('annual');

  const [step, setStep] = useState<Step>('select');
  const [results, setResults] = useState<BulkResult[]>([]);
  const [sending, setSending] = useState(false);
  const [progress, setProgress] = useState(0);

  const [expandedEmail, setExpandedEmail] = useState<string | null>(null);
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem('ih_admin_secret');
    if (stored) { setAdminSecret(stored); setAuthed(true); }
  }, []);

  const loadCompanies = useCallback(async () => {
    setLoadingCompanies(true);
    try {
      const [fboSnap, handlerSnap] = await Promise.all([
        getDocs(collection(db, 'fbo')),
        getDocs(collection(db, 'handler')),
      ]);

      const rows: CompanyRow[] = [];

      fboSnap.docs.forEach((d) => {
        const data = d.data();
        const email = data.fboEmail?.trim();
        const name = data.fboName?.trim();
        const icao = data.fboIcao?.trim();
        if (email && name && icao) {
          rows.push({ id: d.id, email, companyName: name, companyType: 'fbo', icao, selected: false });
        }
      });

      handlerSnap.docs.forEach((d) => {
        const data = d.data();
        const email = data.handlerEmail?.trim();
        const name = data.handlerName?.trim();
        const icao = data.handlerIcao?.trim();
        if (email && name && icao) {
          rows.push({ id: d.id, email, companyName: name, companyType: 'handler', icao, selected: false });
        }
      });

      // Deduplicate by email (same company may appear multiple times)
      const seen = new Set<string>();
      const unique = rows.filter((r) => {
        if (seen.has(r.email)) return false;
        seen.add(r.email);
        return true;
      });

      // Sort by ICAO then name
      unique.sort((a, b) => a.icao.localeCompare(b.icao) || a.companyName.localeCompare(b.companyName));
      setCompanies(unique);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingCompanies(false);
    }
  }, []);

  useEffect(() => {
    if (authed) loadCompanies();
  }, [authed, loadCompanies]);

  const visible = companies.filter((c) => {
    if (filterType !== 'all' && c.companyType !== filterType) return false;
    if (filterText && !c.companyName.toLowerCase().includes(filterText.toLowerCase()) && !c.icao.toLowerCase().includes(filterText.toLowerCase())) return false;
    return true;
  });

  const selectedAll = visible.length > 0 && visible.every((c) => c.selected);
  const selectedCount = companies.filter((c) => c.selected).length;

  const toggleAll = () => {
    const ids = new Set(visible.map((c) => c.id));
    setCompanies((prev) => prev.map((c) => ids.has(c.id) ? { ...c, selected: !selectedAll } : c));
  };

  const toggleOne = (id: string) => {
    setCompanies((prev) => prev.map((c) => c.id === id ? { ...c, selected: !c.selected } : c));
  };

  const handleSend = async () => {
    const selected = companies.filter((c) => c.selected);
    if (!selected.length) return;
    setSending(true);
    setStep('sending');
    setProgress(0);

    // Send in batches of 10 to avoid timeouts
    const BATCH = 10;
    const allResults: BulkResult[] = [];

    for (let i = 0; i < selected.length; i += BATCH) {
      const batch = selected.slice(i, i + BATCH);
      try {
        const res = await fetch('/api/admin/bulk-invite', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ adminSecret, companies: batch, emailType }),
        });
        if (res.ok) {
          const data = await res.json();
          allResults.push(...(data.results || []));
        }
      } catch (err) {
        console.error(err);
      }
      setProgress(Math.round(((i + BATCH) / selected.length) * 100));
    }

    setResults(allResults);
    setSending(false);
    setStep('done');
  };

  const downloadCsv = () => {
    const header = 'Company Name,Type,ICAO,Email,Password,Status';
    const rows = results.map((r) =>
      [r.companyName, r.companyType, r.icao, r.email, r.tempPassword || '(existing account)', r.error ? `ERROR: ${r.error}` : r.isExisting ? 'existing' : 'new account created']
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(',')
    );
    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ihandler-invitations-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyEmailBody = async (r: BulkResult) => {
    const body = buildEmailBody(r, emailType);
    await navigator.clipboard.writeText(body);
    setCopiedEmail(r.email);
    setTimeout(() => setCopiedEmail(null), 2500);
  };

  const openMailto = (r: BulkResult) => {
    const subject = emailType === 'new'
      ? `i-Handler – Invitation to manage your listing at ${r.icao}`
      : `i-Handler – Annual Directory Update Request for ${r.companyName}`;
    window.open(`mailto:${r.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(buildEmailBody(r, emailType))}`);
  };

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

  // ── STEP: SENDING ──────────────────────────────────────────────────────────
  if (step === 'sending') {
    return (
      <>
        <Navbar />
        <main className="min-h-screen pt-24 pb-20 px-4 bg-white flex items-center justify-center">
          <div className="w-full max-w-md text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#F34707]/10 mb-6">
              <svg className="animate-spin w-8 h-8 text-[#F34707]" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Creating accounts…</h2>
            <p className="text-gray-400 text-sm mb-6">Processing {selectedCount} companies. Please don&apos;t close this tab.</p>
            <div className="w-full bg-gray-100 rounded-full h-3">
              <div className="bg-[#F34707] h-3 rounded-full transition-all duration-500" style={{ width: `${Math.min(progress, 100)}%` }} />
            </div>
            <p className="text-gray-400 text-sm mt-3">{Math.min(progress, 100)}% complete</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // ── STEP: DONE ─────────────────────────────────────────────────────────────
  if (step === 'done') {
    const succeeded = results.filter((r) => !r.error);
    const failed = results.filter((r) => r.error);
    const newAccounts = results.filter((r) => !r.isExisting && !r.error);
    const existing = results.filter((r) => r.isExisting && !r.error);

    return (
      <>
        <Navbar />
        <main className="min-h-screen pt-24 pb-20 px-4 bg-white">
          <div className="max-w-5xl mx-auto">

            <div className="mb-8">
              <Link href="/admin" className="inline-flex items-center gap-2 text-gray-400 hover:text-gray-700 text-sm mb-4 transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Dashboard
              </Link>
              <h1 className="text-3xl font-bold text-gray-900 mb-1">Bulk Invite Complete</h1>
              <p className="text-gray-400 text-sm">Accounts created. Now send each company their credentials email.</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              {[
                { label: 'Total Processed', value: results.length, color: 'border-blue-100 bg-blue-50 text-blue-600' },
                { label: 'New Accounts', value: newAccounts.length, color: 'border-green-100 bg-green-50 text-green-600' },
                { label: 'Existing', value: existing.length, color: 'border-orange-100 bg-orange-50 text-[#F34707]' },
                { label: 'Errors', value: failed.length, color: 'border-red-100 bg-red-50 text-red-500' },
              ].map((s) => (
                <div key={s.label} className={`rounded-2xl border p-4 ${s.color}`}>
                  <div className="text-3xl font-bold mb-1">{s.value}</div>
                  <div className="text-xs font-medium opacity-80">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3 mb-6">
              <button onClick={downloadCsv}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download CSV (with passwords)
              </button>
              <button onClick={() => { setStep('select'); setResults([]); }}
                className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors">
                Send Another Batch
              </button>
            </div>

            <p className="text-xs text-gray-400 mb-6">
              💡 <strong>Tip:</strong> Download the CSV first — it contains all passwords. Then use the email buttons below to send each company their invitation, or import the CSV into your email marketing tool.
            </p>

            {/* Results table */}
            <div className="rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <h2 className="text-sm font-semibold text-gray-700">
                  {succeeded.length} companies ready to email
                </h2>
              </div>
              <div className="divide-y divide-gray-100">
                {succeeded.map((r) => (
                  <div key={r.email} className="px-6 py-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-gray-900 text-sm">{r.companyName}</span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${r.companyType === 'fbo' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                            {r.companyType === 'fbo' ? 'FBO' : 'Handler'}
                          </span>
                          <span className="font-mono text-xs text-[#F34707] font-bold">{r.icao}</span>
                          {r.isExisting
                            ? <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-500">existing account</span>
                            : <span className="px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-700">new account</span>
                          }
                        </div>
                        <p className="text-gray-500 text-xs">{r.email}</p>
                        {r.tempPassword && (
                          <p className="text-gray-400 text-xs mt-0.5">
                            Password: <code className="font-mono text-gray-700 bg-gray-100 px-1.5 py-0.5 rounded">{r.tempPassword}</code>
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button onClick={() => setExpandedEmail(expandedEmail === r.email ? null : r.email)}
                          className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-500 text-xs hover:bg-gray-50 transition-colors">
                          {expandedEmail === r.email ? 'Hide' : 'Preview'}
                        </button>
                        <button onClick={() => copyEmailBody(r)}
                          className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 text-xs hover:bg-gray-50 transition-colors flex items-center gap-1">
                          {copiedEmail === r.email ? '✓ Copied' : 'Copy'}
                        </button>
                        <button onClick={() => openMailto(r)}
                          className="px-3 py-1.5 rounded-lg bg-[#F34707] hover:bg-[#d93d06] text-white text-xs font-semibold transition-colors flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          Send Email
                        </button>
                      </div>
                    </div>
                    {expandedEmail === r.email && (
                      <pre className="mt-3 text-xs text-gray-600 bg-gray-50 rounded-xl p-4 whitespace-pre-wrap font-mono border border-gray-200 max-h-64 overflow-y-auto">
                        {buildEmailBody(r, emailType)}
                      </pre>
                    )}
                  </div>
                ))}
                {failed.map((r) => (
                  <div key={r.email} className="px-6 py-4 bg-red-50">
                    <div className="flex items-center gap-3">
                      <span className="text-red-500 text-sm">⚠</span>
                      <div>
                        <span className="font-medium text-gray-900 text-sm">{r.companyName}</span>
                        <span className="text-gray-500 text-xs ml-2">{r.email}</span>
                        <p className="text-red-600 text-xs mt-0.5">{r.error}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </main>
        <Footer />
      </>
    );
  }

  // ── STEP: SELECT ───────────────────────────────────────────────────────────
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 pb-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto">

          <div className="mb-8">
            <Link href="/admin" className="inline-flex items-center gap-2 text-gray-400 hover:text-gray-700 text-sm mb-4 transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">Send to All</h1>
            <p className="text-gray-400 text-sm">Select FBOs and Handlers to invite. Only companies with an email address in the database are shown.</p>
          </div>

          {/* Email type selector */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 mb-6 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">Email Type</h2>
            <div className="grid grid-cols-2 gap-4">
              {([
                { value: 'new', label: '🌟 New Company Introduction', desc: 'First contact — presentation + portal invitation with credentials' },
                { value: 'annual', label: '🔄 Annual Update Request', desc: 'Yearly reminder to verify and update their information' },
              ] as { value: EmailType; label: string; desc: string }[]).map((t) => (
                <button key={t.value} type="button" onClick={() => setEmailType(t.value)}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${emailType === t.value ? 'border-[#F34707] bg-[#F34707]/5' : 'border-gray-200 hover:border-gray-300'}`}>
                  <div className={`font-semibold text-sm mb-0.5 ${emailType === t.value ? 'text-[#F34707]' : 'text-gray-900'}`}>{t.label}</div>
                  <div className="text-xs text-gray-500">{t.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Filters + select all */}
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden mb-2">
            <div className="px-5 py-4 border-b border-gray-100 flex flex-wrap items-center gap-3">
              <input type="text" value={filterText} onChange={(e) => setFilterText(e.target.value)}
                placeholder="Filter by name or ICAO…"
                className="flex-1 min-w-48 px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-900 focus:outline-none focus:border-[#F34707] transition-colors" />
              <div className="flex gap-1 p-1 bg-gray-100 rounded-xl">
                {(['all', 'fbo', 'handler'] as const).map((t) => (
                  <button key={t} onClick={() => setFilterType(t)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize ${filterType === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                    {t === 'all' ? 'All' : t === 'fbo' ? 'FBOs' : 'Handlers'}
                  </button>
                ))}
              </div>
              <button onClick={() => loadCompanies()} className="text-xs text-gray-400 hover:text-gray-600 transition-colors">↻ Refresh</button>
            </div>

            {loadingCompanies ? (
              <div className="p-12 text-center text-gray-400 text-sm">Loading companies from Firestore…</div>
            ) : (
              <>
                {/* Select all row */}
                <div className="px-5 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input type="checkbox" checked={selectedAll} onChange={toggleAll}
                      className="w-4 h-4 rounded accent-[#F34707]" />
                    <span className="text-sm font-medium text-gray-700">
                      Select all {visible.length} visible
                      {filterType !== 'all' || filterText ? ` (filtered)` : ''}
                    </span>
                  </label>
                  <span className="text-xs text-gray-400">{selectedCount} selected total</span>
                </div>

                {/* Company rows */}
                <div className="max-h-[480px] overflow-y-auto divide-y divide-gray-100">
                  {visible.length === 0 ? (
                    <div className="p-8 text-center text-gray-400 text-sm">No companies match your filter.</div>
                  ) : visible.map((c) => (
                    <label key={c.id} className={`flex items-center gap-3 px-5 py-3.5 cursor-pointer hover:bg-orange-50 transition-colors ${c.selected ? 'bg-orange-50/60' : ''}`}>
                      <input type="checkbox" checked={c.selected} onChange={() => toggleOne(c.id)}
                        className="w-4 h-4 rounded accent-[#F34707] flex-shrink-0" />
                      <span className="font-mono text-xs text-[#F34707] font-bold w-14 flex-shrink-0">{c.icao}</span>
                      <span className="text-sm text-gray-900 flex-1 font-medium truncate">{c.companyName}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${c.companyType === 'fbo' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                        {c.companyType === 'fbo' ? 'FBO' : 'Handler'}
                      </span>
                      <span className="text-gray-400 text-xs truncate max-w-48 flex-shrink-0">{c.email}</span>
                    </label>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="flex items-center justify-between mt-6">
            <p className="text-xs text-gray-400">
              {companies.filter(c => !c.id).length > 0
                ? `⚠ Some companies in the database have no email address and are not shown.`
                : `Companies without an email address in Firestore are not shown.`}
            </p>
            <button
              onClick={handleSend}
              disabled={selectedCount === 0 || sending}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#F34707] hover:bg-[#d93d06] text-white font-semibold text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-md">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Create {selectedCount} Account{selectedCount !== 1 ? 's' : ''} & Generate Emails
            </button>
          </div>

        </div>
      </main>
      <Footer />
    </>
  );
}
