'use client';

import { useState, useEffect, useCallback } from 'react';
import { verifyAdminSecret } from '@/lib/adminAuth';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

// ─── Types ─────────────────────────────────────────────────────────────────────
type Sub = {
  id: string;
  email: string;
  name: string;
  company: string;
  country: string;
  plan: string;
  status: string;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  createdAt: string | null;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
};

type Stats = {
  total: number;
  active: number;
  cancelled: number;
  past_due: number;
  mrr: number;
  arr: number;
  countries: Record<string, number>;
  recentCount: number; // last 30 days
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const STATUS_COLORS: Record<string, string> = {
  active:    'bg-green-100 text-green-700 border-green-200',
  cancelled: 'bg-gray-100 text-gray-500 border-gray-200',
  past_due:  'bg-yellow-100 text-yellow-700 border-yellow-200',
  expired:   'bg-red-100 text-red-500 border-red-200',
};

function fmt(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function Badge({ status }: { status: string }) {
  const cls = STATUS_COLORS[status] ?? 'bg-gray-100 text-gray-500 border-gray-200';
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${cls}`}>
      {status}
    </span>
  );
}

// ─── Admin API helper ─────────────────────────────────────────────────────────
async function adminFetch(path: string, init?: RequestInit) {
  const secret = sessionStorage.getItem('adminSecret') || '';
  return fetch(path, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      'x-admin-secret': secret,
      ...(init?.headers as Record<string, string>),
    },
  });
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function AdminSubscriptionsPage() {
  const router = useRouter();
  const [authed, setAuthed]     = useState(false);
  const [secretInput, setSecretInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [subs, setSubs]         = useState<Sub[]>([]);
  const [stats, setStats]       = useState<Stats | null>(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [search, setSearch]     = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCountry, setFilterCountry] = useState('all');
  const [sortField, setSortField] = useState<keyof Sub>('createdAt');
  const [sortAsc, setSortAsc]   = useState(false);

  // Check session auth
  useEffect(() => {
    const s = sessionStorage.getItem('adminSecret');
    if (!s) return;
    verifyAdminSecret(s).then((ok) => {
      if (ok) setAuthed(true);
      else sessionStorage.removeItem('adminSecret');
    });
  }, []);

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const res = await adminFetch('/api/admin/subscriptions');
      if (res.status === 401) { setAuthed(false); setLoading(false); return; }
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setSubs(data.subscriptions);
      setStats(data.stats);
    } catch (err) {
      setError(String(err));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (authed) load();
  }, [authed, load]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    const ok = await verifyAdminSecret(secretInput);
    if (!ok) { setAuthError('Incorrect password'); return; }
    sessionStorage.setItem('adminSecret', secretInput);
    setAuthed(true);
  };

  // ── Filter + Sort ────────────────────────────────────────────────────────────
  const filtered = subs
    .filter((s) => {
      const q = search.toLowerCase();
      const matchSearch = !q || [s.email, s.name, s.company, s.country]
        .some((v) => v?.toLowerCase().includes(q));
      const matchStatus  = filterStatus  === 'all' || s.status  === filterStatus;
      const matchCountry = filterCountry === 'all' || s.country === filterCountry;
      return matchSearch && matchStatus && matchCountry;
    })
    .sort((a, b) => {
      const va = a[sortField] ?? '';
      const vb = b[sortField] ?? '';
      const cmp = String(va).localeCompare(String(vb));
      return sortAsc ? cmp : -cmp;
    });

  const countries = Array.from(new Set(subs.map((s) => s.country).filter(Boolean))).sort();

  const toggleSort = (field: keyof Sub) => {
    if (sortField === field) setSortAsc((p) => !p);
    else { setSortField(field); setSortAsc(true); }
  };

  const SortTh = ({ field, label }: { field: keyof Sub; label: string }) => (
    <th
      className="px-4 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-600 select-none whitespace-nowrap"
      onClick={() => toggleSort(field)}>
      {label}
      {sortField === field && (
        <span className="ml-1 text-[#F34707]">{sortAsc ? '↑' : '↓'}</span>
      )}
    </th>
  );

  // ─── Auth gate ──────────────────────────────────────────────────────────────
  if (!authed) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen pt-24 pb-20 px-4 bg-white flex items-center justify-center">
          <div className="w-full max-w-sm">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#F34707]/10 mb-4">
                <svg className="w-7 h-7 text-[#F34707]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
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
                <input type="password" required value={secretInput} onChange={(e) => setSecretInput(e.target.value)}
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

  // ─── Main UI ────────────────────────────────────────────────────────────────
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
              <h1 className="text-3xl font-bold text-gray-900">Subscriptions</h1>
              <p className="text-gray-400 text-sm mt-1">Pro plan · $290/year</p>
            </div>
            <div className="flex gap-3 flex-wrap">
              <button onClick={() => router.push('/admin')}
                className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-500 text-sm hover:bg-gray-50 transition-colors">
                ← Admin Home
              </button>
              <button onClick={load} disabled={loading}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-500 text-sm hover:bg-gray-50 transition-colors disabled:opacity-50">
                <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-6 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">{error}</div>
          )}

          {/* Stats cards */}
          {stats && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
              {[
                { label: 'Total',      value: stats.total,                      color: 'bg-gray-50 text-gray-700 border-gray-200'       },
                { label: 'Active',     value: stats.active,                     color: 'bg-green-50 text-green-700 border-green-100'    },
                { label: 'Cancelled',  value: stats.cancelled,                  color: 'bg-gray-100 text-gray-500 border-gray-200'      },
                { label: 'Past Due',   value: stats.past_due,                   color: 'bg-yellow-50 text-yellow-700 border-yellow-100' },
                { label: 'MRR',        value: `$${stats.mrr.toLocaleString()}`, color: 'bg-orange-50 text-[#F34707] border-orange-100'  },
                { label: 'ARR',        value: `$${stats.arr.toLocaleString()}`, color: 'bg-orange-50 text-[#F34707] border-orange-100'  },
              ].map((s) => (
                <div key={s.label} className={`rounded-2xl border px-5 py-4 ${s.color}`}>
                  <p className="text-2xl font-bold mb-1">{s.value}</p>
                  <p className="text-xs font-medium opacity-70">{s.label}</p>
                </div>
              ))}
            </div>
          )}

          {/* Countries breakdown */}
          {stats && Object.keys(stats.countries).length > 0 && (
            <div className="mb-8 rounded-2xl border border-gray-200 bg-gray-50 p-5">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Active Subscribers by Country</h2>
              <div className="flex flex-wrap gap-2">
                {Object.entries(stats.countries)
                  .sort((a, b) => b[1] - a[1])
                  .map(([country, count]) => (
                    <span key={country} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-gray-200 text-sm shadow-sm">
                      <span className="text-gray-700 font-medium">{country}</span>
                      <span className="text-[#F34707] font-bold text-xs">{count}</span>
                    </span>
                  ))}
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="flex flex-wrap gap-3 mb-5">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, email, company, country…"
              className="flex-1 min-w-48 px-4 py-2.5 rounded-xl border border-gray-300 text-gray-900 text-sm placeholder:text-gray-400 focus:outline-none focus:border-[#F34707] focus:ring-2 focus:ring-[#F34707]/20 transition-colors"
            />
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2.5 rounded-xl border border-gray-300 text-gray-700 text-sm focus:outline-none focus:border-[#F34707] transition-colors bg-white">
              <option value="all">All statuses</option>
              <option value="active">Active</option>
              <option value="cancelled">Cancelled</option>
              <option value="past_due">Past Due</option>
            </select>
            <select value={filterCountry} onChange={(e) => setFilterCountry(e.target.value)}
              className="px-4 py-2.5 rounded-xl border border-gray-300 text-gray-700 text-sm focus:outline-none focus:border-[#F34707] transition-colors bg-white">
              <option value="all">All countries</option>
              {countries.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <div className="flex items-center text-gray-400 text-sm px-1">
              {filtered.length} result{filtered.length !== 1 ? 's' : ''}
            </div>
          </div>

          {/* Table */}
          <div className="rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <SortTh field="status"           label="Status"    />
                    <SortTh field="name"             label="Name"      />
                    <SortTh field="company"          label="Company"   />
                    <SortTh field="email"            label="Email"     />
                    <SortTh field="country"          label="Country"   />
                    <SortTh field="currentPeriodEnd" label="Expires"   />
                    <SortTh field="createdAt"        label="Joined"    />
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loading && (
                    <tr>
                      <td colSpan={8} className="px-4 py-12 text-center text-gray-400 text-sm">
                        Loading subscriptions…
                      </td>
                    </tr>
                  )}
                  {!loading && filtered.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-4 py-12 text-center text-gray-400 text-sm">
                        No subscriptions found.
                      </td>
                    </tr>
                  )}
                  {filtered.map((s, i) => (
                    <tr key={s.id} className={`hover:bg-orange-50/50 transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'}`}>
                      <td className="px-4 py-3">
                        <Badge status={s.status} />
                        {s.cancelAtPeriodEnd && s.status === 'active' && (
                          <span className="ml-1 text-[10px] text-yellow-600">· cancels</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 font-medium">{s.name || '—'}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{s.company || '—'}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        <a href={`mailto:${s.email}`} className="hover:text-[#F34707] transition-colors">{s.email}</a>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">{s.country || '—'}</td>
                      <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">{fmt(s.currentPeriodEnd)}</td>
                      <td className="px-4 py-3 text-sm text-gray-400 whitespace-nowrap">{fmt(s.createdAt)}</td>
                      <td className="px-4 py-3">
                        <a href={`https://dashboard.stripe.com/customers/${s.stripeCustomerId}`}
                          target="_blank" rel="noopener noreferrer"
                          className="text-xs text-[#F34707] hover:text-[#d93d06] transition-colors font-semibold">
                          Stripe →
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </main>
      <Footer />
    </>
  );
}
