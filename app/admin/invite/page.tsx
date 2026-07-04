'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { verifyAdminSecret } from '@/lib/adminAuth';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

type CompanyType = 'fbo' | 'handler' | '';
type EmailType = 'new' | 'annual' | '';

type DBCompany = {
  id: string;
  name: string;
  email: string;
  poc: string;
  alreadyInvited: boolean;
};

type InviteMode = 'manual' | 'search';

type InviteResult = {
  success: boolean;
  isExisting: boolean;
  tempPassword: string | null;
  companyName: string;
  companyType: CompanyType;
  icao: string;
  email: string;
  emailType: EmailType;
  contactName: string;
  existingDocId?: string;
};

function buildEmailBody(result: InviteResult): string {
  const { companyName, icao, email, tempPassword, isExisting, emailType, contactName } = result;
  const greeting = contactName ? `Dear ${contactName},` : `Dear ${companyName} Team,`;
  const loginUrl = 'https://www.i-handler.com/portal-login';

  if (emailType === 'new') {
    return `${greeting}

We hope this message finds you well.

My name is Felipe Aguilar from i-Handler, the leading digital platform for international private aviation operations. We are pleased to inform you that ${companyName} has been included in our global aviation directory — the reference used by operators, pilots, and dispatchers worldwide to find FBOs and ground handlers at airports around the globe.

Your company is listed under ICAO ${icao}.

We would like to invite you to access your private portal to verify and update your company information. Keeping your data current ensures that aviation professionals around the world can reach you with accurate contact details.

${isExisting
  ? `As a returning user, you can access your portal with your existing credentials at:\n${loginUrl}`
  : `To access your portal, please use the following credentials:

──────────────────────────────────────
  🔐 YOUR LOGIN CREDENTIALS
  Portal:   ${loginUrl}
  Email:    ${email}
  Password: ${tempPassword}
──────────────────────────────────────

Please log in and change your password after your first access.`}

In your portal you will be able to update:
  • Company contact information (phone, email, website, address)
  • Point of contact details
  • Car rental options at your airport
  • Catering services at your airport
  • Nearby hotel information

Thank you for being part of the i-Handler community.

Best regards,
Felipe Aguilar
i-Handler Operations Team
operations@i-handler.app
www.i-handler.app`;
  }

  // Annual update
  return `${greeting}

We hope the year has been going well for ${companyName}.

As part of our annual directory maintenance, we kindly ask you to review and update your company's information in the i-Handler platform. Accurate, up-to-date information ensures that aviation operators worldwide can contact you reliably.

${isExisting
  ? `Please log in to your portal using your existing credentials:\n\n──────────────────────────────────────\n  🔐 YOUR LOGIN CREDENTIALS\n  Portal:   ${loginUrl}\n  Email:    ${email}\n──────────────────────────────────────`
  : `Please log in to your portal using the credentials below:\n\n──────────────────────────────────────\n  🔐 YOUR LOGIN CREDENTIALS\n  Portal:   ${loginUrl}\n  Email:    ${email}\n  Password: ${tempPassword}\n──────────────────────────────────────`}

Fields to review:
  • Contact information (phone, email, website)
  • Point of contact name and title
  • Car rental options near the airport
  • Catering services available
  • Nearby accommodation

This process takes only a few minutes, and we greatly appreciate your cooperation in keeping the i-Handler directory accurate and up-to-date.

──────────────────────────────────────
THE i-HANDLER ECOSYSTEM
──────────────────────────────────────

i-Handler connects crews, passengers, ground handlers, FBOs, and service
providers on a single platform built exclusively for aviation.

Our ecosystem includes:

  ✈  i-Handler App — Flight ops & ground directory
     Direct access from flight crews and operators worldwide

  📦 BAGControl — Baggage handling & tracking
     IATA Resolution 753 compliance, real-time baggage tracking

  ⏱  GTPS — Ground Turnaround Performance System
     Ground turnaround time analytics and IATA benchmarks

  👥 HRS — Human Resources System
     Staff training & compliance (ISAGO/IATA standards)

──────────────────────────────────────

If you have any questions, please do not hesitate to reach out.

Warm regards,
Felipe Aguilar
i-Handler Operations Team
operations@i-handler.app
www.i-handler.app`;
}

function InviteForm() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [adminSecret, setAdminSecret] = useState('');
  const [authed, setAuthed] = useState(false);

  const [mode, setMode] = useState<InviteMode>('search');
  const [emailType, setEmailType] = useState<EmailType>((searchParams.get('type') as EmailType) || '');
  const [companyType, setCompanyType] = useState<CompanyType>('handler');
  const [companyName, setCompanyName] = useState('');
  const [icao, setIcao] = useState('');
  const [email, setEmail] = useState(searchParams.get('resend') || '');
  const [contactName, setContactName] = useState('');
  const [existingDocId, setExistingDocId] = useState('');

  // Search state
  const [searchIcao, setSearchIcao] = useState('');
  const [searchType, setSearchType] = useState<CompanyType>('handler');
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<DBCompany[] | null>(null);
  const [searchError, setSearchError] = useState('');

  const [additionalIcaos, setAdditionalIcaos] = useState<string[]>([]);
  const [icaoInput, setIcaoInput] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<InviteResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [emailSending, setEmailSending] = useState(false);
  const [emailSentOk, setEmailSentOk] = useState(false);
  const [emailSentError, setEmailSentError] = useState('');
  const emailBodyRef = useRef<HTMLTextAreaElement>(null);

  const handleSearch = async () => {
    if (!searchIcao.trim() || !searchType) { setSearchError('Enter ICAO and select type.'); return; }
    setSearchError(''); setSearching(true); setSearchResults(null);
    try {
      const res = await fetch(`/api/admin/search-companies?icao=${searchIcao.trim().toUpperCase()}&type=${searchType}`, {
        headers: { 'x-admin-secret': adminSecret },
      });
      const data = await res.json();
      if (!res.ok) { setSearchError(data.error || 'Search failed'); return; }
      setSearchResults(data.companies);
    } catch { setSearchError('Network error.'); }
    finally { setSearching(false); }
  };

  const selectCompany = (c: DBCompany) => {
    setCompanyName(c.name);
    setEmail(c.email);
    setContactName(c.poc);
    setIcao(searchIcao.trim().toUpperCase());
    setCompanyType(searchType);
    setExistingDocId(c.id);
    setEmailType('annual');
  };

  useEffect(() => {
    const stored = sessionStorage.getItem('ih_admin_secret');
    if (!stored) return;
    verifyAdminSecret(stored).then((ok) => {
      if (ok) { setAdminSecret(stored); setAuthed(true); }
      else sessionStorage.removeItem('ih_admin_secret');
    });
  }, []);

  const addIcaoChip = () => {
    const v = icaoInput.trim().toUpperCase();
    if (v.length >= 3 && !additionalIcaos.includes(v) && v !== icao.toUpperCase()) {
      setAdditionalIcaos(prev => [...prev, v]);
    }
    setIcaoInput('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailType || !companyType) { setError('Please select both email type and company type.'); return; }
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/admin/create-invitation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminSecret, email, companyName, companyType, icao, emailType, contactName,
          existingDocId: existingDocId || undefined,
          additionalIcaos: additionalIcaos.length > 0 ? additionalIcaos : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Request failed.'); return; }

      setResult({
        success: true,
        isExisting: data.isExisting,
        tempPassword: data.tempPassword,
        companyName, companyType, icao, email, emailType, contactName,
        existingDocId: data.linkedDocId || existingDocId || undefined,
      });
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!result) return;
    const body = buildEmailBody(result);
    await navigator.clipboard.writeText(body);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleOpenMailto = () => {
    if (!result) return;
    const subject = result.emailType === 'new'
      ? `i-Handler – Invitation to manage your listing at ${result.icao}`
      : `i-Handler – Annual Directory Update Request for ${result.companyName}`;
    const body = buildEmailBody(result);
    window.open(`mailto:${result.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
  };

  const handleSendEmail = async () => {
    if (!result) return;
    setEmailSending(true);
    setEmailSentError('');
    try {
      const res = await fetch('/api/admin/bulk-invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminSecret,
          sendEmails: true,
          emailType: result.emailType,
          companies: [{
            id: result.existingDocId || '',
            email: result.email,
            companyName: result.companyName,
            companyType: result.companyType,
            icao: result.icao,
            pocName: result.contactName,
            tempPassword: result.tempPassword,
          }],
        }),
      });
      const data = await res.json();
      const r = data.results?.[0];
      if (r?.emailSent) {
        setEmailSentOk(true);
      } else {
        setEmailSentError(r?.error || 'Send failed — check SendGrid sender verification.');
      }
    } catch {
      setEmailSentError('Network error. Please try again.');
    } finally {
      setEmailSending(false);
    }
  };

  if (!authed) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">You must be signed into the admin portal first.</p>
        <Link href="/admin" className="text-[#F34707] font-semibold hover:underline">← Go to Admin Login</Link>
      </div>
    );
  }

  if (result) {
    const emailBody = buildEmailBody(result);
    const subject = result.emailType === 'new'
      ? `i-Handler – Invitation to manage your listing at ${result.icao}`
      : `i-Handler – Annual Directory Update Request for ${result.companyName}`;
    const loginUrl = 'https://www.i-handler.com/portal-login';

    return (
      <div className="space-y-6">
        {/* Success banner */}
        <div className="rounded-2xl border border-green-200 bg-green-50 p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-green-800 text-lg">
                {result.isExisting ? 'Existing account found' : 'New account created'}
              </h3>
              <p className="text-green-700 text-sm mt-1">
                {result.isExisting
                  ? `${result.companyName} already has an account. The email template below contains their login URL.`
                  : `Account created for ${result.companyName} (${result.email}). Temporary password: `}
                {!result.isExisting && (
                  <code className="bg-green-100 px-2 py-0.5 rounded text-green-900 font-mono font-bold ml-1">{result.tempPassword}</code>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Tabs: Preview / Edit */}
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          {/* Toolbar */}
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-gray-700">Email Preview</h3>
              <p className="text-xs text-gray-400 mt-0.5">To: {result.email} · {subject}</p>
            </div>
            <div className="flex flex-wrap gap-2 items-center">
              {emailSentOk && (
                <span className="text-xs text-green-700 font-semibold bg-green-50 border border-green-200 px-3 py-2 rounded-lg">
                  Email sent!
                </span>
              )}
              {emailSentError && (
                <span className="text-xs text-red-700 bg-red-50 border border-red-200 px-3 py-2 rounded-lg max-w-xs truncate" title={emailSentError}>
                  {emailSentError}
                </span>
              )}
              <button onClick={handleCopy}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 text-gray-600 text-xs font-medium hover:bg-gray-50 transition-colors">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                {copied ? 'Copied!' : 'Copy Text'}
              </button>
              <button onClick={handleOpenMailto}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 text-gray-600 text-xs font-medium hover:bg-gray-50 transition-colors">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Open in Email Client
              </button>
              <button onClick={handleSendEmail} disabled={emailSending || emailSentOk}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#F34707] text-white text-xs font-semibold hover:bg-[#d93d06] transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                {emailSending ? (
                  <>
                    <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                    Sending...
                  </>
                ) : emailSentOk ? (
                  'Sent!'
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    Send via SendGrid
                  </>
                )}
              </button>
            </div>
          </div>

          {/* HTML Visual Preview */}
          <div className="p-6 bg-gray-100">
            <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-md overflow-hidden">
              {/* Email header with logo */}
              <div style={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)' }} className="px-8 py-8 text-center">
                {/* Logo using img tag so it works in email preview context */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/I-HANDLER_APP_LOGO.png"
                  alt="i-Handler"
                  style={{ height: '48px', width: 'auto', filter: 'brightness(0) invert(1)', display: 'inline-block' }}
                />
                <p style={{ color: '#F34707', fontSize: '11px', fontWeight: '600', letterSpacing: '0.15em', marginTop: '10px', textTransform: 'uppercase' }}>
                  International Aviation Support
                </p>
              </div>

              {/* Orange accent bar */}
              <div style={{ height: '4px', background: 'linear-gradient(90deg, #F34707, #FC8C00)' }} />

              {/* Body */}
              <div className="px-8 py-8">
                <p style={{ fontSize: '15px', color: '#374151', lineHeight: '1.7', marginBottom: '16px' }}>
                  {result.contactName ? `Dear ${result.contactName},` : `Dear ${result.companyName} Team,`}
                </p>

                {result.emailType === 'new' ? (<>
                  <p style={{ fontSize: '15px', color: '#374151', lineHeight: '1.7', marginBottom: '16px' }}>
                    We hope this message finds you well. My name is <strong>Felipe Aguilar</strong> from i-Handler, the leading digital platform for international private aviation operations.
                  </p>
                  <p style={{ fontSize: '15px', color: '#374151', lineHeight: '1.7', marginBottom: '16px' }}>
                    We are pleased to inform you that <strong>{result.companyName}</strong> has been included in our global aviation directory — the reference used by operators, pilots, and dispatchers worldwide.
                  </p>
                  <div style={{ background: '#FFF7F4', border: '1px solid #F34707', borderRadius: '12px', padding: '16px 20px', marginBottom: '20px' }}>
                    <p style={{ fontSize: '13px', color: '#9CA3AF', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: '600' }}>Airport ICAO</p>
                    <p style={{ fontSize: '22px', color: '#F34707', fontWeight: '800', fontFamily: 'monospace', margin: 0 }}>{result.icao}</p>
                  </div>
                  <p style={{ fontSize: '15px', color: '#374151', lineHeight: '1.7', marginBottom: '20px' }}>
                    We would like to invite you to access your private portal to verify and update your company information.
                  </p>
                </>) : (<>
                  <p style={{ fontSize: '15px', color: '#374151', lineHeight: '1.7', marginBottom: '16px' }}>
                    We hope the year has been going well for <strong>{result.companyName}</strong>.
                  </p>
                  <p style={{ fontSize: '15px', color: '#374151', lineHeight: '1.7', marginBottom: '20px' }}>
                    As part of our annual directory maintenance, we kindly ask you to review and update your company&apos;s information in the i-Handler platform.
                  </p>
                </>)}

                {/* Credentials box */}
                <div style={{ background: '#1a1a1a', borderRadius: '12px', padding: '20px 24px', marginBottom: '24px' }}>
                  <p style={{ color: '#F34707', fontSize: '11px', fontWeight: '700', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '12px' }}>
                    🔐 Your Login Credentials
                  </p>
                  <div style={{ display: 'grid', gap: '6px' }}>
                    {[
                      ['Portal', loginUrl],
                      ['Email', result.email],
                      ...(!result.isExisting && result.tempPassword ? [['Password', result.tempPassword]] : []),
                    ].map(([label, value]) => (
                      <div key={label} style={{ display: 'flex', gap: '12px', alignItems: 'baseline' }}>
                        <span style={{ color: '#6B7280', fontSize: '12px', minWidth: '70px', fontWeight: '600' }}>{label}</span>
                        <span style={{ color: '#FFFFFF', fontSize: '13px', fontFamily: 'monospace', wordBreak: 'break-all' }}>{value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CTA Button */}
                <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                  <a href={loginUrl}
                    style={{ display: 'inline-block', background: '#F34707', color: '#FFFFFF', padding: '14px 32px', borderRadius: '10px', fontWeight: '700', fontSize: '14px', textDecoration: 'none', letterSpacing: '0.03em' }}>
                    Access My Portal →
                  </a>
                </div>

                {/* Ecosystem section — annual only */}
                {result.emailType === 'annual' && (
                  <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: '24px', marginBottom: '24px' }}>
                    <p style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: '700', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '16px' }}>
                      The i-Handler Ecosystem
                    </p>
                    <div style={{ display: 'grid', gap: '12px' }}>
                      {[
                        { icon: '✈', name: 'i-Handler App', desc: 'Flight ops & ground directory — direct access from flight crews worldwide' },
                        { icon: '📦', name: 'BAGControl', desc: 'Baggage handling & tracking — IATA Resolution 753 compliance' },
                        { icon: '⏱', name: 'GTPS', desc: 'Ground Turnaround Performance System — analytics and IATA benchmarks' },
                        { icon: '👥', name: 'HRS', desc: 'Human Resources System — staff training & compliance (ISAGO/IATA)' },
                      ].map((item) => (
                        <div key={item.name} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', background: '#F9FAFB', borderRadius: '10px', padding: '12px 14px' }}>
                          <span style={{ fontSize: '18px', lineHeight: 1, flexShrink: 0 }}>{item.icon}</span>
                          <div>
                            <p style={{ fontSize: '13px', fontWeight: '700', color: '#111827', margin: '0 0 2px' }}>{item.name}</p>
                            <p style={{ fontSize: '12px', color: '#6B7280', margin: 0, lineHeight: '1.5' }}>{item.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <p style={{ fontSize: '14px', color: '#6B7280', lineHeight: '1.6' }}>
                  If you have any questions, please reply to this email or contact us at{' '}
                  <a href="mailto:operations@i-handler.app" style={{ color: '#F34707', textDecoration: 'none', fontWeight: '600' }}>
                    operations@i-handler.app
                  </a>
                </p>
              </div>

              {/* Footer */}
              <div style={{ background: '#F9FAFB', borderTop: '1px solid #E5E7EB', padding: '20px 32px', textAlign: 'center' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/logo-square.png" alt="i-Handler App" style={{ height: '36px', width: '36px', borderRadius: '8px', display: 'inline-block', marginBottom: '8px' }} />
                <p style={{ fontSize: '12px', color: '#9CA3AF', margin: '0 0 4px' }}>
                  i-Handler — International Aviation Support
                </p>
                <p style={{ fontSize: '11px', color: '#D1D5DB', margin: 0 }}>
                  operations@i-handler.app · www.i-handler.app
                </p>
              </div>
            </div>
          </div>

          {/* Editable plain text */}
          <div className="px-6 pb-6">
            <p className="text-xs text-gray-400 mb-2 font-semibold uppercase tracking-wide">Plain Text (editable — used when you click &ldquo;Open in Email Client&rdquo;)</p>
            <textarea ref={emailBodyRef} defaultValue={emailBody} rows={20}
              className="w-full text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-xl p-4 resize-none focus:outline-none focus:border-[#F34707] font-mono leading-relaxed" />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button onClick={() => { setResult(null); setCompanyName(''); setIcao(''); setEmail(''); setContactName(''); setEmailType(''); setCompanyType(''); setExistingDocId(''); setSearchResults(null); setSearchIcao(''); }}
            className="px-5 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold transition-colors">
            Send Another Invitation
          </button>
          <Link href="/admin"
            className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-500 text-sm hover:bg-gray-50 transition-colors">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">{error}</div>
      )}

      {/* Mode toggle */}
      <div className="flex rounded-xl border border-gray-200 overflow-hidden">
        {([['search', '🔍 Search Database', 'Find existing company'], ['manual', '✏️ Manual Entry', 'Enter details manually']] as [InviteMode, string, string][]).map(([m, label, sub]) => (
          <button key={m} type="button" onClick={() => setMode(m)}
            className={`flex-1 py-3 px-4 text-sm font-semibold transition-colors ${mode === m ? 'bg-[#F34707] text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}>
            {label}<br /><span className={`text-xs font-normal ${mode === m ? 'text-orange-100' : 'text-gray-400'}`}>{sub}</span>
          </button>
        ))}
      </div>

      {/* Search mode */}
      {mode === 'search' && (
        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5 space-y-4">
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Airport ICAO</label>
              <input value={searchIcao} onChange={e => setSearchIcao(e.target.value.toUpperCase())} maxLength={4}
                placeholder="e.g. KJFK" onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleSearch())}
                className="w-full px-4 py-3 rounded-xl bg-white border border-gray-300 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#F34707] text-sm font-mono uppercase" />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Type</label>
              <div className="flex rounded-xl border border-gray-300 overflow-hidden bg-white">
                {(['handler', 'fbo'] as CompanyType[]).map(t => (
                  <button key={t} type="button" onClick={() => { setSearchType(t); setCompanyType(t); }}
                    className={`flex-1 py-3 text-sm font-semibold transition-colors ${searchType === t ? 'bg-[#F34707] text-white' : 'text-gray-500 hover:bg-gray-50'}`}>
                    {t === 'handler' ? '✈️ Handler' : '🏢 FBO'}
                  </button>
                ))}
              </div>
            </div>
            <button type="button" onClick={handleSearch} disabled={searching}
              className="px-5 py-3 rounded-xl bg-gray-900 text-white text-sm font-semibold disabled:opacity-50 whitespace-nowrap">
              {searching ? 'Searching…' : 'Search'}
            </button>
          </div>
          {searchError && <p className="text-red-500 text-sm">{searchError}</p>}
          {searchResults !== null && (
            searchResults.length === 0
              ? <p className="text-gray-400 text-sm text-center py-4">No {searchType}s found at {searchIcao}.</p>
              : <div className="space-y-2 max-h-72 overflow-y-auto">
                  <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">{searchResults.length} found — click to pre-fill the invite form</p>
                  {searchResults.map(c => (
                    <button key={c.id} type="button" onClick={() => { selectCompany(c); setMode('manual'); }}
                      className={`w-full text-left rounded-xl border px-4 py-3 transition-all hover:border-[#F34707] hover:bg-[#F34707]/5 ${c.alreadyInvited ? 'border-yellow-200 bg-yellow-50' : 'border-gray-200 bg-white'}`}>
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{c.name || '(no name)'}</p>
                          <p className="text-xs text-gray-400">{c.email || 'no email on file'}{c.poc ? ` · ${c.poc}` : ''}</p>
                        </div>
                        {c.alreadyInvited && <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-semibold flex-shrink-0">Already invited</span>}
                        {!c.email && <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-semibold flex-shrink-0">No email</span>}
                      </div>
                    </button>
                  ))}
                </div>
          )}
        </div>
      )}

      {/* Show pre-filled banner when company selected from DB */}
      {existingDocId && mode === 'manual' && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-green-50 border border-green-200">
          <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          <p className="text-sm text-green-700"><strong>{companyName}</strong> found in the database — this invite will link to their existing listing.</p>
          <button type="button" onClick={() => { setExistingDocId(''); setCompanyName(''); setEmail(''); setContactName(''); setIcao(''); }} className="ml-auto text-xs text-green-500 hover:text-green-700 font-semibold">Clear</button>
        </div>
      )}

      {/* Email Type */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">Email Type</label>
        <div className="grid grid-cols-2 gap-4">
          {([
            {
              value: 'new', label: 'New Company', icon: '🌟',
              desc: 'First contact — company presentation + portal invitation',
            },
            {
              value: 'annual', label: 'Annual Update', icon: '🔄',
              desc: 'Yearly reminder for existing companies to verify their data',
            },
          ] as { value: EmailType; label: string; icon: string; desc: string }[]).map((t) => (
            <button key={t.value} type="button" onClick={() => setEmailType(t.value)}
              className={`p-5 rounded-2xl border-2 text-left transition-all ${emailType === t.value ? 'border-[#F34707] bg-[#F34707]/5' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
              <div className="text-2xl mb-2">{t.icon}</div>
              <div className={`font-semibold text-sm mb-1 ${emailType === t.value ? 'text-[#F34707]' : 'text-gray-900'}`}>{t.label}</div>
              <div className="text-xs text-gray-500 leading-relaxed">{t.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Company Type */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">Company Type</label>
        <div className="grid grid-cols-2 gap-4">
          {([
            { value: 'handler', label: '✈️ Ground Handler', desc: 'Ramp & ground services' },
            { value: 'fbo', label: '🏢 FBO', desc: 'Fixed Base Operator' },
          ] as { value: CompanyType; label: string; desc: string }[]).map((t) => (
            <button key={t.value} type="button" onClick={() => setCompanyType(t.value)}
              className={`p-4 rounded-xl border-2 text-left transition-all ${companyType === t.value ? 'border-[#F34707] bg-[#F34707]/5' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
              <div className={`font-semibold text-sm mb-0.5 ${companyType === t.value ? 'text-[#F34707]' : 'text-gray-900'}`}>{t.label}</div>
              <div className="text-xs text-gray-500">{t.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="block text-sm text-gray-600 mb-1.5">Company Name <span className="text-red-400">*</span></label>
          <input type="text" required value={companyName} onChange={(e) => setCompanyName(e.target.value)}
            placeholder="Exact name as it appears in the directory"
            className="w-full px-4 py-3 rounded-xl bg-white border border-gray-300 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#F34707] focus:ring-2 focus:ring-[#F34707]/20 text-sm" />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1.5">Airport ICAO Code <span className="text-red-400">*</span></label>
          <input type="text" required value={icao} onChange={(e) => setIcao(e.target.value.toUpperCase())} maxLength={4}
            placeholder="e.g. KJFK"
            className="w-full px-4 py-3 rounded-xl bg-white border border-gray-300 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#F34707] focus:ring-2 focus:ring-[#F34707]/20 text-sm font-mono uppercase" />
        </div>
        {/* Additional ICAOs */}
        <div className="sm:col-span-2">
          <label className="block text-sm text-gray-600 mb-1.5">Additional ICAO Stations <span className="text-gray-400 text-xs font-normal">(optional — if this company operates at multiple airports)</span></label>
          <div className="flex gap-2">
            <input
              type="text" value={icaoInput}
              onChange={(e) => setIcaoInput(e.target.value.toUpperCase())}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addIcaoChip(); } }}
              maxLength={4} placeholder="e.g. MMUN"
              className="flex-1 px-4 py-3 rounded-xl bg-white border border-gray-300 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#F34707] focus:ring-2 focus:ring-[#F34707]/20 text-sm font-mono uppercase"
            />
            <button type="button" onClick={addIcaoChip}
              className="px-4 py-3 rounded-xl border border-gray-300 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors whitespace-nowrap">
              + Add
            </button>
          </div>
          {additionalIcaos.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {additionalIcaos.map(code => (
                <span key={code} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F34707]/10 border border-[#F34707]/30 text-[#F34707] text-xs font-mono font-semibold">
                  {code}
                  <button type="button" onClick={() => setAdditionalIcaos(prev => prev.filter(x => x !== code))}
                    className="text-[#F34707]/60 hover:text-[#F34707] leading-none">×</button>
                </span>
              ))}
            </div>
          )}
          <p className="mt-1.5 text-xs text-gray-400">All stations are linked to the same account in one click.</p>
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1.5">Contact Person Name</label>
          <input type="text" value={contactName} onChange={(e) => setContactName(e.target.value)}
            placeholder="e.g. John Smith (optional)"
            className="w-full px-4 py-3 rounded-xl bg-white border border-gray-300 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#F34707] focus:ring-2 focus:ring-[#F34707]/20 text-sm" />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm text-gray-600 mb-1.5">Owner Email Address <span className="text-red-400">*</span></label>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="owner@company.com"
            className="w-full px-4 py-3 rounded-xl bg-white border border-gray-300 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#F34707] focus:ring-2 focus:ring-[#F34707]/20 text-sm" />
          <p className="mt-1.5 text-xs text-gray-400">
            If this email already has an account, credentials will not be reset — only the invitation record is updated.
          </p>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={loading}
          className="px-6 py-3 rounded-xl bg-[#F34707] hover:bg-[#d93d06] text-white font-semibold text-sm transition-colors disabled:opacity-50 shadow-md">
          {loading ? 'Processing...' : 'Create Account & Generate Email'}
        </button>
        <Link href="/admin"
          className="px-6 py-3 rounded-xl border border-gray-200 text-gray-500 text-sm hover:bg-gray-50 transition-colors">
          Cancel
        </Link>
      </div>
    </form>
  );
}

export default function InvitePage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 pb-20 px-4 bg-white">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <Link href="/admin" className="inline-flex items-center gap-2 text-gray-400 hover:text-gray-700 text-sm mb-6 transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">Send Invitation</h1>
            <p className="text-gray-400 text-sm">Create a portal account and generate a customized invitation email</p>
          </div>
          <Suspense fallback={<div className="text-gray-400 text-sm">Loading...</div>}>
            <InviteForm />
          </Suspense>
        </div>
      </main>
      <Footer />
    </>
  );
}
