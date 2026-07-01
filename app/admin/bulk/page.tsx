'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { verifyAdminSecret } from '@/lib/adminAuth';
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
  pocName: string;
  country: string;
  alreadyInvited: boolean;
  selected: boolean;
};

type BulkResult = {
  email: string;
  companyName: string;
  companyType: string;
  icao: string;
  pocName: string;
  tempPassword: string | null;
  isExisting: boolean;
  emailSent: boolean;
  error?: string;
};

const LOGIN_URL = 'https://www.i-handler.com/portal-login';
const BASE_URL = 'https://www.i-handler.com';
const LOGO_URL = `${BASE_URL}/images/IHANDLER_LOGO.png`;
const APP_LOGO_URL = `${BASE_URL}/images/ihandler-app/app-logo.jpg`;
const BHS_LOGO = `${BASE_URL}/images/bhs/bhs-logo.png`;
const HRS_LOGO = `${BASE_URL}/images/hrs/hrs-logo.jpg`;
const GTPS_LOGO = `${BASE_URL}/images/gtps/gtps-logo.jpg`;

// ── Email HTML builder ─────────────────────────────────────────────────────────
function buildHtmlEmail(r: {
  companyName: string; icao: string; email: string; pocName: string;
  tempPassword: string | null; isExisting: boolean; emailType: EmailType;
}): string {
  const { companyName, icao, email, pocName, tempPassword, isExisting, emailType } = r;
  const greeting = pocName ? `Dear ${pocName},` : `Dear ${companyName} Team,`;

  const credBlock = isExisting
    ? `<table width="100%" cellpadding="0" cellspacing="0" style="background:#fff8f5;border:2px solid #f34707;border-radius:8px;margin:20px 0;">
        <tr><td style="padding:18px 22px;">
          <p style="margin:0 0 8px 0;font-size:12px;font-weight:700;color:#f34707;letter-spacing:1.5px;text-transform:uppercase;">Your Portal Access</p>
          <p style="margin:0 0 5px 0;font-size:14px;color:#333;"><strong>Portal:</strong> <a href="${LOGIN_URL}" style="color:#f34707;">${LOGIN_URL}</a></p>
          <p style="margin:0;font-size:14px;color:#333;"><strong>Email:</strong> ${email}</p>
        </td></tr>
      </table>`
    : `<table width="100%" cellpadding="0" cellspacing="0" style="background:#fff8f5;border:2px solid #f34707;border-radius:8px;margin:20px 0;">
        <tr><td style="padding:18px 22px;">
          <p style="margin:0 0 8px 0;font-size:12px;font-weight:700;color:#f34707;letter-spacing:1.5px;text-transform:uppercase;">Your Login Credentials</p>
          <p style="margin:0 0 5px 0;font-size:14px;color:#333;"><strong>Portal:</strong> <a href="${LOGIN_URL}" style="color:#f34707;">${LOGIN_URL}</a></p>
          <p style="margin:0 0 5px 0;font-size:14px;color:#333;"><strong>Email:</strong> ${email}</p>
          <p style="margin:0;font-size:14px;color:#333;"><strong>Password:</strong> <span style="font-family:monospace;background:#fff;padding:3px 10px;border-radius:4px;border:1px solid #ddd;font-size:15px;">${tempPassword ?? '(generated on send)'}</span></p>
        </td></tr>
      </table>
      <p style="font-size:13px;color:#888;margin:0 0 20px 0;">Please log in and change your password after your first access.</p>`;

  const appsSection = `
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;border:1px solid #e5e7eb;border-radius:10px;overflow:hidden;">
      <tr><td style="background:#f9fafb;padding:14px 20px;border-bottom:1px solid #e5e7eb;">
        <p style="margin:0;font-size:13px;font-weight:700;color:#111827;text-transform:uppercase;letter-spacing:1px;">The i-Handler Ecosystem</p>
      </td></tr>
      <tr><td style="padding:16px 20px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td width="25%" style="text-align:center;padding:8px 6px;vertical-align:top;">
              <a href="${BASE_URL}" style="text-decoration:none;">
                <img src="${APP_LOGO_URL}" width="48" height="48" alt="i-Handler App" style="border-radius:12px;display:block;margin:0 auto 6px;object-fit:cover;" />
                <p style="margin:0;font-size:11px;font-weight:700;color:#111827;">i-Handler App</p>
                <p style="margin:2px 0 0;font-size:10px;color:#6b7280;">Flight ops platform</p>
              </a>
            </td>
            <td width="25%" style="text-align:center;padding:8px 6px;vertical-align:top;">
              <a href="${BASE_URL}/bhs" style="text-decoration:none;">
                <img src="${BHS_LOGO}" width="48" height="48" alt="BAGControl" style="border-radius:12px;display:block;margin:0 auto 6px;object-fit:cover;" />
                <p style="margin:0;font-size:11px;font-weight:700;color:#111827;">BAGControl</p>
                <p style="margin:2px 0 0;font-size:10px;color:#6b7280;">Baggage tracking</p>
              </a>
            </td>
            <td width="25%" style="text-align:center;padding:8px 6px;vertical-align:top;">
              <a href="${BASE_URL}/gtps" style="text-decoration:none;">
                <img src="${GTPS_LOGO}" width="48" height="48" alt="GTPS" style="border-radius:12px;display:block;margin:0 auto 6px;object-fit:cover;" />
                <p style="margin:0;font-size:11px;font-weight:700;color:#111827;">GTPS</p>
                <p style="margin:2px 0 0;font-size:10px;color:#6b7280;">Turnaround analytics</p>
              </a>
            </td>
            <td width="25%" style="text-align:center;padding:8px 6px;vertical-align:top;">
              <a href="${BASE_URL}/hrs" style="text-decoration:none;">
                <img src="${HRS_LOGO}" width="48" height="48" alt="HRS" style="border-radius:12px;display:block;margin:0 auto 6px;object-fit:cover;" />
                <p style="margin:0;font-size:11px;font-weight:700;color:#111827;">HRS</p>
                <p style="margin:2px 0 0;font-size:10px;color:#6b7280;">Staff compliance</p>
              </a>
            </td>
          </tr>
        </table>
      </td></tr>
    </table>`;

  const benefitsSection = `
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;">
      <tr><td style="padding:18px 22px;">
        <p style="margin:0 0 10px 0;font-size:13px;font-weight:700;color:#15803d;text-transform:uppercase;letter-spacing:1px;">Why Being Listed in i-Handler Matters</p>
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
          <tr><td style="padding:5px 0;font-size:13px;color:#166534;line-height:1.5;"><strong>Direct access from flight crews and operators.</strong> Pilots and dispatchers search for handlers and FBOs by ICAO directly from the i-Handler mobile app and request your services in real time.</td></tr>
          </tr>
          <tr>
          <tr><td style="padding:5px 0;font-size:13px;color:#166534;line-height:1.5;"><strong>Exclusive aviation ecosystem.</strong> i-Handler connects crews, passengers, ground handlers, FBOs, and service providers on a single platform built exclusively for aviation.</td></tr>
          </tr>
          <tr>
          <tr><td style="padding:5px 0;font-size:13px;color:#166534;line-height:1.5;"><strong>Global reach, local impact.</strong> Aviation professionals from over 100 countries use i-Handler daily to plan operations, find ground support, and manage their flights.</td></tr>
          </tr>
          <tr>
          <tr><td style="padding:5px 0;font-size:13px;color:#166534;line-height:1.5;"><strong>Your data, your control.</strong> Update your profile, services, and contact information at any time through your private portal.</td></tr>
          </tr>
        </table>
      </td></tr>
    </table>`;

  const newBody = `
    <p style="margin:0 0 16px 0;">${greeting}</p>
    <p style="margin:0 0 16px 0;">My name is <strong>Felipe Aguilar</strong> from <strong>i-Handler</strong> — the exclusive digital ecosystem for international private aviation ground operations. We are pleased to inform you that <strong>${companyName}</strong> has been included in our global aviation directory, the reference used by operators, pilots, and flight dispatchers worldwide to find FBOs and ground handlers at airports across the globe.</p>
    <p style="margin:0 0 16px 0;">Your company is listed under ICAO <strong style="color:#f34707;font-size:16px;">${icao}</strong>.</p>

    ${benefitsSection}

    <p style="margin:0 0 12px 0;font-weight:600;color:#111;">Access your private portal to verify and update your listing:</p>
    ${credBlock}

    <p style="margin:0 0 8px 0;font-weight:600;">From your portal you can update:</p>
    <ul style="margin:0 0 20px 0;padding-left:20px;color:#555;">
      <li style="margin-bottom:5px;">Company contact information (phone, email, website, address)</li>
      <li style="margin-bottom:5px;">Point of contact details</li>
      <li style="margin-bottom:5px;">Ground handling rates and capabilities</li>
      <li style="margin-bottom:5px;">Car rental options at your airport</li>
      <li style="margin-bottom:5px;">Catering services available</li>
      <li style="margin-bottom:5px;">Nearby hotel recommendations</li>
    </ul>

    ${appsSection}

    <p style="margin:0 0 16px 0;">Thank you for being part of the i-Handler community.</p>`;

  const annualBody = `
    <p style="margin:0 0 16px 0;">${greeting}</p>
    <p style="margin:0 0 16px 0;">We hope the year has been going well for <strong>${companyName}</strong>.</p>
    <p style="margin:0 0 16px 0;">As part of our annual directory maintenance, we kindly ask you to review and update your company's information in the <strong>i-Handler</strong> platform. Accurate, up-to-date information ensures that aviation operators worldwide can contact you reliably — and that <strong>pilots request your services directly from our app</strong>.</p>

    ${benefitsSection}

    <p style="margin:0 0 12px 0;">Please log in to your portal at <strong>ICAO ${icao}</strong>:</p>
    ${credBlock}

    <p style="margin:0 0 8px 0;font-weight:600;">Fields to review and update:</p>
    <ul style="margin:0 0 20px 0;padding-left:20px;color:#555;">
      <li style="margin-bottom:5px;">Contact information (phone, email, website)</li>
      <li style="margin-bottom:5px;">Point of contact name and title</li>
      <li style="margin-bottom:5px;">Ground handling capabilities</li>
      <li style="margin-bottom:5px;">Car rental options near the airport</li>
      <li style="margin-bottom:5px;">Catering services available</li>
      <li style="margin-bottom:5px;">Nearby accommodation / hotels</li>
    </ul>

    ${appsSection}

    <p style="margin:0 0 16px 0;">This process takes only a few minutes, and we greatly appreciate your cooperation in keeping the i-Handler directory accurate and up-to-date.</p>
    <p style="margin:0 0 16px 0;">If you have any questions, please do not hesitate to reach out.</p>`;

  const bodyContent = emailType === 'new' ? newBody : annualBody;

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>i-Handler Invitation</title></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:32px 16px;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 4px 16px rgba(0,0,0,0.10);max-width:600px;">
      <tr><td style="background:#ffffff;padding:28px 32px 20px;text-align:center;border-bottom:4px solid #f34707;">
        <img src="${LOGO_URL}" alt="i-Handler" width="190" style="display:block;margin:0 auto;" />
        <p style="margin:10px 0 0;font-size:11px;color:#9ca3af;letter-spacing:1.5px;text-transform:uppercase;">Global Aviation Ground Operations Platform</p>
      </td></tr>
      <tr><td style="background:#f34707;height:4px;"></td></tr>
      <tr><td style="padding:32px;font-size:14px;line-height:1.7;color:#374151;">
        ${bodyContent}
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:28px 0;" />
        <p style="margin:0;font-size:13px;color:#6b7280;">
          Best regards,<br/>
          <strong style="color:#111827;">Felipe Aguilar</strong><br/>
          i-Handler Operations Team<br/>
          <a href="mailto:cto@i-handler.app" style="color:#f34707;">cto@i-handler.app</a> &nbsp;·&nbsp;
          <a href="${BASE_URL}" style="color:#f34707;">www.i-handler.com</a>
        </p>
      </td></tr>
      <tr><td style="background:#f9fafb;padding:20px 32px;text-align:center;border-top:1px solid #e5e7eb;">
        <img src="${LOGO_URL}" alt="i-Handler" width="100" style="display:block;margin:0 auto 10px;opacity:0.5;" />
        <p style="margin:0;font-size:11px;color:#9ca3af;">
          © ${new Date().getFullYear()} i-Handler &nbsp;·&nbsp; Global Aviation Ground Operations Platform<br/>
          You are receiving this email because your company is listed in the i-Handler aviation directory.<br/>
          <a href="mailto:cto@i-handler.app?subject=Unsubscribe" style="color:#9ca3af;">Unsubscribe</a>
        </p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`;
}

type Step = 'select' | 'sending' | 'done';

// ── Search mode: country | icao | name ────────────────────────────────────────
type SearchMode = 'country' | 'icao' | 'name';

export default function BulkInvitePage() {
  const [adminSecret, setAdminSecret] = useState('');
  const [authed, setAuthed] = useState(false);

  // Search mode
  const [searchMode, setSearchMode] = useState<SearchMode>('country');

  // Country filter
  const [allCountries, setAllCountries] = useState<string[]>([]);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [countrySearch, setCountrySearch] = useState('');
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const countryRef = useRef<HTMLDivElement>(null);

  // ICAO / name search
  const [icaoInput, setIcaoInput] = useState('');
  const [nameInput, setNameInput] = useState('');

  // Companies
  const [companies, setCompanies] = useState<CompanyRow[]>([]);
  const [loadingCompanies, setLoadingCompanies] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'fbo' | 'handler'>('all');
  const [filterText, setFilterText] = useState('');
  const [filterInvited, setFilterInvited] = useState<'all' | 'not-invited'>('not-invited');
  const [emailType, setEmailType] = useState<EmailType>('new');
  const [sendEmails, setSendEmails] = useState(true);

  // Steps
  const [step, setStep] = useState<Step>('select');
  const [results, setResults] = useState<BulkResult[]>([]);
  const [sending, setSending] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedCount, setSelectedCount] = useState(0);

  // Preview modal
  const [previewCompany, setPreviewCompany] = useState<CompanyRow | null>(null);
  const [previewEmailType, setPreviewEmailType] = useState<EmailType>('new');

  useEffect(() => {
    const stored = sessionStorage.getItem('ih_admin_secret');
    if (!stored) return;
    verifyAdminSecret(stored).then((ok) => {
      if (ok) { setAdminSecret(stored); setAuthed(true); }
      else sessionStorage.removeItem('ih_admin_secret');
    });
  }, []);

  // Click outside closes country dropdown
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (countryRef.current && !countryRef.current.contains(e.target as Node))
        setShowCountryDropdown(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Load countries list once
  useEffect(() => {
    if (!authed) return;
    fetch('/api/admin/bulk-companies?action=countries', {
      headers: { 'x-admin-secret': adminSecret },
    })
      .then(r => r.json())
      .then(d => setAllCountries(d.countries ?? []))
      .catch(console.error);
  }, [authed, adminSecret]);

  const loadByCountry = useCallback(async () => {
    if (!selectedCountries.length) { setCompanies([]); return; }
    setLoadingCompanies(true);
    try {
      const params = new URLSearchParams({ countries: selectedCountries.join(','), type: filterType });
      const res = await fetch(`/api/admin/bulk-companies?${params}`, {
        headers: { 'x-admin-secret': adminSecret },
      });
      const data = await res.json();
      const rows: CompanyRow[] = (data.companies ?? []).map((c: Omit<CompanyRow, 'selected'>) => ({ ...c, selected: false }));
      setCompanies(rows);
      setSelectedCount(0);
    } catch (err) { console.error(err); }
    finally { setLoadingCompanies(false); }
  }, [selectedCountries, filterType, adminSecret]);

  const loadByIcaoOrName = useCallback(async () => {
    const icao = icaoInput.trim().toUpperCase();
    const name = nameInput.trim();
    if (!icao && !name) { setCompanies([]); return; }
    setLoadingCompanies(true);
    try {
      const params = new URLSearchParams({ type: filterType });
      if (icao) params.set('icao', icao);
      if (name) params.set('name', name);
      const res = await fetch(`/api/admin/bulk-companies?${params}`, {
        headers: { 'x-admin-secret': adminSecret },
      });
      const data = await res.json();
      const rows: CompanyRow[] = (data.companies ?? []).map((c: Omit<CompanyRow, 'selected'>) => ({ ...c, selected: false }));
      setCompanies(rows);
      setSelectedCount(0);
    } catch (err) { console.error(err); }
    finally { setLoadingCompanies(false); }
  }, [icaoInput, nameInput, filterType, adminSecret]);

  // Auto-load on country change
  useEffect(() => {
    if (authed && searchMode === 'country') {
      if (selectedCountries.length > 0) loadByCountry();
      else setCompanies([]);
    }
  }, [authed, searchMode, selectedCountries, filterType, loadByCountry]);

  const handleSearch = () => {
    if (searchMode === 'country') loadByCountry();
    else loadByIcaoOrName();
  };

  const visible = companies.filter(c => {
    if (filterInvited === 'not-invited' && c.alreadyInvited) return false;
    if (filterText && !c.companyName.toLowerCase().includes(filterText.toLowerCase()) && !c.icao.toLowerCase().includes(filterText.toLowerCase())) return false;
    return true;
  });

  const visibleSelectedAll = visible.length > 0 && visible.every(c => c.selected);

  const toggleAll = () => {
    const ids = new Set(visible.map(c => c.id));
    setCompanies(prev => {
      const next = prev.map(c => ids.has(c.id) ? { ...c, selected: !visibleSelectedAll } : c);
      setSelectedCount(next.filter(c => c.selected).length);
      return next;
    });
  };

  const toggleOne = (id: string) => {
    setCompanies(prev => {
      const next = prev.map(c => c.id === id ? { ...c, selected: !c.selected } : c);
      setSelectedCount(next.filter(c => c.selected).length);
      return next;
    });
  };

  const toggleCountry = (country: string) => {
    setSelectedCountries(prev =>
      prev.includes(country) ? prev.filter(c => c !== country) : [...prev, country]
    );
  };

  const handleSend = async () => {
    const selected = companies.filter(c => c.selected);
    if (!selected.length) return;
    setSending(true);
    setStep('sending');
    setProgress(0);
    const BATCH = 10;
    const allResults: BulkResult[] = [];
    for (let i = 0; i < selected.length; i += BATCH) {
      const batch = selected.slice(i, i + BATCH);
      try {
        const res = await fetch('/api/admin/bulk-invite', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ adminSecret, companies: batch, emailType, sendEmails }),
        });
        if (res.ok) { const data = await res.json(); allResults.push(...(data.results ?? [])); }
      } catch (err) { console.error(err); }
      setProgress(Math.round(((i + BATCH) / selected.length) * 100));
    }
    setResults(allResults);
    setSending(false);
    setStep('done');
  };

  const downloadCsv = () => {
    const header = 'Company Name,Type,ICAO,Email,POC,Password,Email Sent,Status';
    const rows = results.map(r =>
      [r.companyName, r.companyType, r.icao, r.email, r.pocName,
       r.tempPassword || '(existing)', r.emailSent ? 'Yes' : 'No',
       r.error ? `ERROR: ${r.error}` : r.isExisting ? 'existing account' : 'new account']
        .map(v => `"${String(v).replace(/"/g, '""')}"`)
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

  // ── SENDING ────────────────────────────────────────────────────────────────
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
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {sendEmails ? 'Creating accounts & sending emails…' : 'Creating accounts…'}
            </h2>
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

  // ── DONE ───────────────────────────────────────────────────────────────────
  if (step === 'done') {
    const succeeded = results.filter(r => !r.error);
    const failed = results.filter(r => r.error);
    const newAccounts = succeeded.filter(r => !r.isExisting);
    const existing = succeeded.filter(r => r.isExisting);
    const emailsSent = succeeded.filter(r => r.emailSent).length;

    return (
      <>
        <Navbar />
        <main className="min-h-screen pt-24 pb-20 px-4 bg-white">
          <div className="max-w-5xl mx-auto">
            <div className="mb-8">
              <button onClick={() => { setStep('select'); setResults([]); }}
                className="inline-flex items-center gap-2 text-gray-400 hover:text-gray-700 text-sm mb-4 transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Send Another Batch
              </button>
              <h1 className="text-3xl font-bold text-gray-900 mb-1">Bulk Invite Complete</h1>
              <p className="text-gray-400 text-sm">Accounts created{sendEmails ? ' and emails sent' : ''}.</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-8">
              {[
                { label: 'Total', value: results.length, color: 'border-blue-100 bg-blue-50 text-blue-600' },
                { label: 'New Accounts', value: newAccounts.length, color: 'border-green-100 bg-green-50 text-green-600' },
                { label: 'Existing', value: existing.length, color: 'border-gray-100 bg-gray-50 text-gray-500' },
                { label: 'Emails Sent', value: emailsSent, color: 'border-orange-100 bg-orange-50 text-[#F34707]' },
                { label: 'Errors', value: failed.length, color: 'border-red-100 bg-red-50 text-red-500' },
              ].map(s => (
                <div key={s.label} className={`rounded-2xl border p-4 ${s.color}`}>
                  <div className="text-3xl font-bold mb-1">{s.value}</div>
                  <div className="text-xs font-medium opacity-80">{s.label}</div>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-3 mb-6">
              <button onClick={downloadCsv}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download CSV (with passwords)
              </button>
            </div>
            <div className="rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <h2 className="text-sm font-semibold text-gray-700">{succeeded.length} processed · {existing.length} existing accounts</h2>
              </div>
              <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
                {succeeded.map(r => (
                  <div key={r.email} className="px-6 py-4 flex items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm text-gray-900">{r.companyName}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${r.companyType === 'fbo' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                          {r.companyType === 'fbo' ? 'FBO' : 'Handler'}
                        </span>
                        <span className="font-mono text-xs text-[#F34707] font-bold">{r.icao}</span>
                        {r.isExisting
                          ? <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-500">existing</span>
                          : <span className="px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-700">new account</span>
                        }
                        {r.emailSent && <span className="px-2 py-0.5 rounded-full text-xs bg-teal-100 text-teal-700">email sent</span>}
                      </div>
                      <p className="text-gray-400 text-xs mt-0.5">{r.email}{r.tempPassword ? ` · pw: ${r.tempPassword}` : ''}</p>
                    </div>
                  </div>
                ))}
                {failed.map(r => (
                  <div key={r.email} className="px-6 py-4 bg-red-50">
                    <span className="font-medium text-gray-900 text-sm">{r.companyName}</span>
                    <span className="text-gray-500 text-xs ml-2">{r.email}</span>
                    <p className="text-red-600 text-xs mt-0.5">{r.error}</p>
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

  // ── SELECT ─────────────────────────────────────────────────────────────────
  const filteredCountries = allCountries.filter(c =>
    !countrySearch || c.toLowerCase().includes(countrySearch.toLowerCase())
  );

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
            <h1 className="text-3xl font-bold text-gray-900 mb-1">Bulk Invite</h1>
            <p className="text-gray-400 text-sm">Search by country, ICAO, or name — select companies, preview the email, and send via SendGrid.</p>
          </div>

          {/* Email type */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 mb-5 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">Email Type</h2>
            <div className="grid grid-cols-2 gap-4 mb-4">
              {([
                { value: 'new', label: '🌟 New Company Introduction', desc: 'First contact — presentation + portal invitation with credentials' },
                { value: 'annual', label: '🔄 Annual Update Request', desc: 'Yearly reminder to verify and update their listing' },
              ] as { value: EmailType; label: string; desc: string }[]).map(t => (
                <button key={t.value} type="button" onClick={() => setEmailType(t.value)}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${emailType === t.value ? 'border-[#F34707] bg-[#F34707]/5' : 'border-gray-200 hover:border-gray-300'}`}>
                  <div className={`font-semibold text-sm mb-0.5 ${emailType === t.value ? 'text-[#F34707]' : 'text-gray-900'}`}>{t.label}</div>
                  <div className="text-xs text-gray-500">{t.desc}</div>
                </button>
              ))}
            </div>
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input type="checkbox" checked={sendEmails} onChange={e => setSendEmails(e.target.checked)}
                className="w-4 h-4 rounded accent-[#F34707]" />
              <span className="text-sm text-gray-700">Send emails via SendGrid automatically</span>
            </label>
          </div>

          {/* Search mode tabs */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 mb-5 shadow-sm">
            <div className="flex gap-1 p-1 bg-gray-100 rounded-xl w-fit mb-4">
              {([
                { value: 'country', label: '🌍 By Country' },
                { value: 'icao',    label: '✈️ By ICAO' },
                { value: 'name',    label: '🔍 By Name' },
              ] as { value: SearchMode; label: string }[]).map(t => (
                <button key={t.value} onClick={() => { setSearchMode(t.value); setCompanies([]); setSelectedCount(0); }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${searchMode === t.value ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                  {t.label}
                </button>
              ))}
            </div>

            {/* Country picker */}
            {searchMode === 'country' && (
              <div className="relative" ref={countryRef}>
                <div onClick={() => setShowCountryDropdown(v => !v)}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-gray-200 cursor-pointer hover:border-[#F34707] transition-colors min-h-10 flex-wrap">
                  {selectedCountries.length === 0
                    ? <span className="text-gray-400 text-sm">Select one or more countries…</span>
                    : selectedCountries.map(c => (
                      <span key={c} className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#F34707]/10 text-[#F34707] text-xs font-medium">
                        {c}
                        <button onClick={e => { e.stopPropagation(); toggleCountry(c); }} className="hover:text-red-700 ml-0.5">×</button>
                      </span>
                    ))}
                  <svg className="w-4 h-4 text-gray-400 ml-auto flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                {showCountryDropdown && (
                  <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white rounded-xl border border-gray-200 shadow-xl max-h-64 overflow-hidden flex flex-col">
                    <div className="p-2 border-b border-gray-100">
                      <input type="text" value={countrySearch} onChange={e => setCountrySearch(e.target.value)}
                        placeholder="Search countries…"
                        className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#F34707]"
                        onClick={e => e.stopPropagation()} />
                    </div>
                    <div className="overflow-y-auto flex-1">
                      {filteredCountries.map(c => (
                        <label key={c} className={`flex items-center gap-2.5 px-3 py-2 cursor-pointer hover:bg-orange-50 transition-colors ${selectedCountries.includes(c) ? 'bg-orange-50/60' : ''}`}>
                          <input type="checkbox" checked={selectedCountries.includes(c)} onChange={() => toggleCountry(c)}
                            className="w-4 h-4 rounded accent-[#F34707]" />
                          <span className="text-sm text-gray-700">{c}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
                {selectedCountries.length > 0 && (
                  <button onClick={() => setSelectedCountries([])} className="mt-2 text-xs text-gray-400 hover:text-gray-600 transition-colors">
                    Clear selection
                  </button>
                )}
              </div>
            )}

            {/* ICAO search */}
            {searchMode === 'icao' && (
              <div className="flex gap-3">
                <input type="text" value={icaoInput} onChange={e => setIcaoInput(e.target.value.toUpperCase())}
                  onKeyDown={e => e.key === 'Enter' && handleSearch()}
                  placeholder="e.g. MHRO, LATI, EGLL"
                  className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 font-mono focus:outline-none focus:border-[#F34707] transition-colors" />
                <div className="flex gap-1 p-1 bg-gray-100 rounded-xl self-start">
                  {(['all', 'fbo', 'handler'] as const).map(t => (
                    <button key={t} onClick={() => setFilterType(t)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize ${filterType === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                      {t === 'all' ? 'All' : t === 'fbo' ? 'FBOs' : 'Handlers'}
                    </button>
                  ))}
                </div>
                <button onClick={handleSearch}
                  className="px-5 py-2.5 rounded-xl bg-[#F34707] hover:bg-[#d93d06] text-white text-sm font-semibold transition-colors">
                  Search
                </button>
              </div>
            )}

            {/* Name search */}
            {searchMode === 'name' && (
              <div className="flex gap-3">
                <input type="text" value={nameInput} onChange={e => setNameInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSearch()}
                  placeholder="e.g. Apogee, Sky Handlers, AeroGround"
                  className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 focus:outline-none focus:border-[#F34707] transition-colors" />
                <div className="flex gap-1 p-1 bg-gray-100 rounded-xl self-start">
                  {(['all', 'fbo', 'handler'] as const).map(t => (
                    <button key={t} onClick={() => setFilterType(t)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize ${filterType === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                      {t === 'all' ? 'All' : t === 'fbo' ? 'FBOs' : 'Handlers'}
                    </button>
                  ))}
                </div>
                <button onClick={handleSearch}
                  className="px-5 py-2.5 rounded-xl bg-[#F34707] hover:bg-[#d93d06] text-white text-sm font-semibold transition-colors">
                  Search
                </button>
              </div>
            )}
          </div>

          {/* Company table */}
          {(companies.length > 0 || loadingCompanies) && (
            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden mb-4">
              <div className="px-5 py-4 border-b border-gray-100 flex flex-wrap items-center gap-3">
                <input type="text" value={filterText} onChange={e => setFilterText(e.target.value)}
                  placeholder="Filter results by name or ICAO…"
                  className="flex-1 min-w-48 px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-900 focus:outline-none focus:border-[#F34707] transition-colors" />
                {searchMode === 'country' && (
                  <div className="flex gap-1 p-1 bg-gray-100 rounded-xl">
                    {(['all', 'fbo', 'handler'] as const).map(t => (
                      <button key={t} onClick={() => setFilterType(t)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize ${filterType === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                        {t === 'all' ? 'All' : t === 'fbo' ? 'FBOs' : 'Handlers'}
                      </button>
                    ))}
                  </div>
                )}
                <div className="flex gap-1 p-1 bg-gray-100 rounded-xl">
                  {([
                    { value: 'not-invited', label: 'Not Invited' },
                    { value: 'all', label: 'All' },
                  ] as { value: 'all' | 'not-invited'; label: string }[]).map(t => (
                    <button key={t.value} onClick={() => setFilterInvited(t.value)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filterInvited === t.value ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {loadingCompanies ? (
                <div className="p-12 text-center text-gray-400 text-sm">Loading companies…</div>
              ) : (
                <>
                  <div className="px-5 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input type="checkbox" checked={visibleSelectedAll} onChange={toggleAll}
                        className="w-4 h-4 rounded accent-[#F34707]" />
                      <span className="text-sm font-medium text-gray-700">Select all {visible.length} visible</span>
                    </label>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-400">{selectedCount} selected</span>
                      {selectedCount > 0 && (
                        <button onClick={() => { const s = companies.find(c => c.selected); if (s) { setPreviewCompany(s); setPreviewEmailType(emailType); } }}
                          className="text-xs text-[#F34707] font-medium hover:underline">
                          Preview email →
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="max-h-[480px] overflow-y-auto divide-y divide-gray-100">
                    {visible.length === 0 ? (
                      <div className="p-8 text-center text-gray-400 text-sm">No companies match your filter.</div>
                    ) : visible.map(c => (
                      <div key={c.id} className={`flex items-center gap-3 px-5 py-3.5 hover:bg-orange-50/40 transition-colors ${c.selected ? 'bg-orange-50/60' : ''}`}>
                        <input type="checkbox" checked={c.selected} onChange={() => toggleOne(c.id)}
                          className="w-4 h-4 rounded accent-[#F34707] flex-shrink-0 cursor-pointer" />
                        <span className="font-mono text-xs text-[#F34707] font-bold w-14 flex-shrink-0">{c.icao}</span>
                        <span className="text-sm text-gray-900 flex-1 font-medium truncate">{c.companyName}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${c.companyType === 'fbo' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                          {c.companyType === 'fbo' ? 'FBO' : 'Handler'}
                        </span>
                        {c.alreadyInvited && <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-400 flex-shrink-0">invited</span>}
                        {c.country && <span className="text-gray-400 text-xs flex-shrink-0 hidden sm:block max-w-28 truncate">{c.country}</span>}
                        <span className="text-gray-400 text-xs truncate max-w-40 flex-shrink-0">{c.email}</span>
                        <button onClick={() => { setPreviewCompany(c); setPreviewEmailType(emailType); }}
                          className="text-xs text-gray-400 hover:text-[#F34707] transition-colors flex-shrink-0 px-2 py-1 rounded hover:bg-orange-50">
                          Preview
                        </button>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {!loadingCompanies && companies.length === 0 && (
            <div className="rounded-2xl border-2 border-dashed border-gray-200 p-12 text-center text-gray-400 mb-4">
              <p className="text-sm">
                {searchMode === 'country' ? 'Select one or more countries above to load companies.' : 'Enter a search term above and click Search.'}
              </p>
            </div>
          )}

          <div className="flex items-center justify-between mt-4">
            <p className="text-xs text-gray-400">Only companies with an email address in the database are shown.</p>
            <button
              onClick={handleSend}
              disabled={selectedCount === 0 || sending}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#F34707] hover:bg-[#d93d06] text-white font-semibold text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-md">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              {sendEmails
                ? `Create & Send to ${selectedCount} Compan${selectedCount !== 1 ? 'ies' : 'y'}`
                : `Create Accounts for ${selectedCount} Compan${selectedCount !== 1 ? 'ies' : 'y'}`}
            </button>
          </div>

        </div>
      </main>

      {/* Email Preview Modal */}
      {previewCompany && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 flex-shrink-0">
              <div>
                <h2 className="font-semibold text-gray-900">Email Preview</h2>
                <p className="text-xs text-gray-400 mt-0.5">{previewCompany.companyName} · {previewCompany.icao} · {previewCompany.email}</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex gap-1 p-1 bg-gray-100 rounded-lg">
                  {([
                    { value: 'new', label: 'New' },
                    { value: 'annual', label: 'Annual' },
                  ] as { value: EmailType; label: string }[]).map(t => (
                    <button key={t.value} onClick={() => setPreviewEmailType(t.value)}
                      className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${previewEmailType === t.value ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}>
                      {t.label}
                    </button>
                  ))}
                </div>
                <button onClick={() => setPreviewCompany(null)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 transition-colors text-xl leading-none">
                  ×
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-3 bg-gray-100 min-h-0">
              <iframe
                srcDoc={buildHtmlEmail({
                  companyName: previewCompany.companyName,
                  icao: previewCompany.icao,
                  email: previewCompany.email,
                  pocName: previewCompany.pocName,
                  tempPassword: 'Pr3v1ew$123',
                  isExisting: false,
                  emailType: previewEmailType,
                })}
                className="w-full min-h-[600px] rounded-xl border-0 bg-white"
                title="Email Preview"
              />
            </div>
            <div className="px-6 py-3 border-t border-gray-100 flex justify-end flex-shrink-0">
              <button onClick={() => setPreviewCompany(null)}
                className="px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}
