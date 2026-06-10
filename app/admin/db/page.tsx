'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

// ── Exact Firestore collection names & real field names (verified via db-peek)
const COLLECTIONS = [
  { key: 'airports', label: 'Airport',    nameField: 'name',        icaoField: 'icao' },
  { key: 'permits',  label: 'Permit',     nameField: 'country_one', icaoField: 'icao' },
  { key: 'fbo',      label: 'FBO',        nameField: 'fboName',     icaoField: 'fboIcao' },
  { key: 'handler',  label: 'Handler',    nameField: 'handlerName', icaoField: 'handlerIcao' },
  { key: 'hotel',    label: 'Hotel',      nameField: 'hotelName',   icaoField: 'hotelIcao' },
  { key: 'fuel',     label: 'Fuel',       nameField: 'fuelName',    icaoField: 'fuelIcao' },
  { key: 'car',      label: 'Car Rental', nameField: 'carName',     icaoField: 'carIcao' },
] as const;

type ColKey = typeof COLLECTIONS[number]['key'];
type Doc = Record<string, unknown>;

// Fields that hold image URLs (detected by substring match)
const IMAGE_FIELDS = ['LogoImage', 'Logo', 'Image', 'Photo', 'Picture', 'logo', 'image', 'photo'];

// ── Image Upload Field ────────────────────────────────────────────────────────
function ImageField({
  fieldKey, value, secret, onChange,
}: {
  fieldKey: string;
  value: string;
  secret: string;
  onChange: (url: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setErr('');
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('folder', 'company-logos');
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: { 'x-admin-secret': secret },
        body: fd,
      });
      if (!res.ok) throw new Error((await res.json()).error);
      const { url } = await res.json();
      onChange(url);
    } catch (ex: unknown) {
      setErr(ex instanceof Error ? ex.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      {/* Current image preview */}
      {value && (
        <div className="relative w-32 h-20 rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="logo" className="w-full h-full object-contain p-1" />
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute top-1 right-1 w-5 h-5 rounded-full bg-gray-800/70 text-white text-[10px] flex items-center justify-center hover:bg-black transition-colors"
          >×</button>
        </div>
      )}
      {/* URL input */}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Paste URL or upload file below…"
        className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-900 focus:outline-none focus:border-[#F34707] focus:ring-2 focus:ring-[#F34707]/20"
      />
      {/* Upload button */}
      <div className="flex items-center gap-2">
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-900 hover:bg-black text-white text-xs font-semibold transition-colors disabled:opacity-50"
        >
          {uploading ? (
            <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
          )}
          {uploading ? 'Uploading…' : 'Upload Image'}
        </button>
        {err && <span className="text-xs text-gray-500">{err}</span>}
      </div>
    </div>
  );
}

// ── Edit / Create Modal ───────────────────────────────────────────────────────
function RecordModal({
  doc, colKey, onClose, onSave, secret,
}: {
  doc: Doc | null;
  colKey: ColKey;
  onClose: () => void;
  onSave: () => void;
  secret: string;
}) {
  const col = COLLECTIONS.find((c) => c.key === colKey)!;
  const [form, setForm] = useState<Doc>(doc ?? { [col.icaoField]: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [newFieldKey, setNewFieldKey] = useState('');
  const isNew = !doc;

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/admin/db', {
        method: isNew ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-admin-secret': secret },
        body: JSON.stringify(isNew
          ? { collection: colKey, data: form }
          : { collection: colKey, id: doc!.id as string, data: form }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      onSave();
      onClose();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const fields = isNew
    ? [col.icaoField, col.nameField, 'phone', 'email', 'website', 'remarks']
    : Object.keys(form).filter((k) => k !== 'id');

  const isImageField = (k: string) =>
    IMAGE_FIELDS.some((f) => k.toLowerCase().includes(f.toLowerCase()));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 flex-shrink-0">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              {isNew ? `New ${col.label}` : `Edit ${col.label}`}
            </h2>
            {!isNew && <p className="text-xs text-gray-400 font-mono mt-0.5">ID: {doc!.id as string}</p>}
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Fields */}
        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-gray-100 border border-gray-200 text-gray-700 text-sm">{error}</div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {fields.map((key) => {
              const val = form[key];
              const isArray = Array.isArray(val);
              const isImg = isImageField(key);
              const isLong = !isImg && !isArray && String(val ?? '').length > 80;
              return (
                <div key={key} className={isImg || isArray || isLong ? 'sm:col-span-2' : ''}>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">{key}</label>
                  {isImg ? (
                    <ImageField
                      fieldKey={key}
                      value={String(val ?? '')}
                      secret={secret}
                      onChange={(url) => setForm((f) => ({ ...f, [key]: url }))}
                    />
                  ) : isArray ? (
                    <textarea
                      rows={3}
                      value={(val as string[]).join(', ')}
                      onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value.split(',').map((s) => s.trim()) }))}
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-900 focus:outline-none focus:border-[#F34707] focus:ring-2 focus:ring-[#F34707]/20 font-mono resize-none"
                      placeholder="Comma-separated values"
                    />
                  ) : (
                    <input
                      type="text"
                      value={String(val ?? '')}
                      onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-900 focus:outline-none focus:border-[#F34707] focus:ring-2 focus:ring-[#F34707]/20"
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Add new field */}
          <div className="mt-5 pt-4 border-t border-dashed border-gray-200 flex gap-2">
            <input
              placeholder="Add new field name…"
              value={newFieldKey}
              onChange={(e) => setNewFieldKey(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && newFieldKey && !(newFieldKey in form)) {
                  setForm((f) => ({ ...f, [newFieldKey]: '' }));
                  setNewFieldKey('');
                }
              }}
              className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#F34707] focus:ring-2 focus:ring-[#F34707]/20"
            />
            <button
              type="button"
              onClick={() => {
                if (newFieldKey && !(newFieldKey in form)) {
                  setForm((f) => ({ ...f, [newFieldKey]: '' }));
                  setNewFieldKey('');
                }
              }}
              className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold transition-colors"
            >
              + Add Field
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 flex-shrink-0">
          <button onClick={onClose} className="px-4 py-2 rounded-xl border border-gray-200 text-gray-500 text-sm hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving}
            className="px-6 py-2 rounded-xl bg-[#F34707] hover:bg-[#d93d06] text-white font-semibold text-sm transition-colors disabled:opacity-50 flex items-center gap-2">
            {saving && <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>}
            {saving ? 'Saving…' : 'Save Record'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Delete confirm ────────────────────────────────────────────────────────────
function DeleteConfirm({ doc, colKey, secret, onClose, onDone }: {
  doc: Doc; colKey: ColKey; secret: string; onClose: () => void; onDone: () => void;
}) {
  const col = COLLECTIONS.find((c) => c.key === colKey)!;
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    await fetch(`/api/admin/db?collection=${colKey}&id=${doc.id}`, {
      method: 'DELETE',
      headers: { 'x-admin-secret': secret },
    });
    setLoading(false);
    onDone();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-center">
        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-1">Delete {col.label}?</h3>
        <p className="text-sm text-gray-400 mb-6">
          <span className="font-semibold text-gray-700">{String(doc[col.nameField] ?? doc.id)}</span>
          <br />This cannot be undone.
        </p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2 rounded-xl border border-gray-200 text-gray-500 text-sm hover:bg-gray-50 transition-colors">Cancel</button>
          <button onClick={handleDelete} disabled={loading}
            className="flex-1 py-2 rounded-xl bg-gray-900 hover:bg-black text-white text-sm font-semibold transition-colors disabled:opacity-50">
            {loading ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function AdminDbPage() {
  const [secret, setSecret] = useState('');
  const [authed, setAuthed] = useState(false);
  const [icaoInput, setIcaoInput] = useState('');
  const [searchedIcao, setSearchedIcao] = useState('');
  const [activeTab, setActiveTab] = useState<ColKey>('airports');
  const [docs, setDocs] = useState<Partial<Record<ColKey, Doc[]>>>({});
  const [loading, setLoading] = useState(false);
  const [editDoc, setEditDoc] = useState<{ doc: Doc | null; col: ColKey } | null>(null);
  const [deleteDoc, setDeleteDoc] = useState<{ doc: Doc; col: ColKey } | null>(null);
  const [rowFilter, setRowFilter] = useState('');

  // Permit-specific state
  const [detectedCountry, setDetectedCountry] = useState('');   // auto-filled from airport result
  const [countryInput, setCountryInput] = useState('');
  const [permitLoading, setPermitLoading] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem('ih_admin_secret');
    if (stored) { setAuthed(true); setSecret(stored); }
  }, []);

  const fetchPermits = useCallback(async (country: string, s: string) => {
    if (!country.trim()) return;
    setPermitLoading(true);
    try {
      const res = await fetch(`/api/admin/permits?country=${encodeURIComponent(country.trim().toUpperCase())}`, {
        headers: { 'x-admin-secret': s },
      });
      const data = res.ok ? await res.json() : { docs: [] };
      setDocs((prev) => ({ ...prev, permits: data.docs ?? [] }));
    } catch { /* ignore */ }
    finally { setPermitLoading(false); }
  }, []);

  const fetchAll = useCallback(async (icao: string, s: string) => {
    setLoading(true);
    const results: Partial<Record<ColKey, Doc[]>> = {};

    // Fetch all non-permit collections by ICAO
    await Promise.all(
      COLLECTIONS.filter((c) => c.key !== 'permits').map(async ({ key }) => {
        try {
          const res = await fetch(`/api/admin/db?collection=${key}&icao=${icao}`, {
            headers: { 'x-admin-secret': s },
          });
          const data = res.ok ? await res.json() : { docs: [] };
          results[key] = data.docs ?? [];
        } catch {
          results[key] = [];
        }
      })
    );

    setDocs((prev) => ({ ...prev, ...results }));
    setLoading(false);

    // Auto-detect country from airport result and fetch permits
    const airportDocs = results.airports ?? [];
    if (airportDocs.length > 0) {
      const country = String(airportDocs[0].country ?? '').toUpperCase().trim();
      if (country) {
        setDetectedCountry(country);
        setCountryInput(country);
        fetchPermits(country, s);
      }
    }
  }, [fetchPermits]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const icao = icaoInput.trim().toUpperCase();
    if (!icao) return;
    setSearchedIcao(icao);
    setRowFilter('');
    fetchAll(icao, secret);
  };

  const handleRefresh = () => {
    if (searchedIcao) fetchAll(searchedIcao, secret);
    if (activeTab === 'permits' && countryInput) fetchPermits(countryInput, secret);
  };

  if (!authed) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen pt-24 pb-20 px-4 bg-white flex items-center justify-center">
          <div className="w-full max-w-sm">
            <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">Admin Access</h1>
            <form onSubmit={(e) => { e.preventDefault(); sessionStorage.setItem('ih_admin_secret', secret); setAuthed(true); }}
              className="space-y-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <input type="password" required value={secret} onChange={(e) => setSecret(e.target.value)}
                placeholder="Enter admin secret"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 text-gray-900 focus:outline-none focus:border-[#F34707] focus:ring-2 focus:ring-[#F34707]/20 text-sm" />
              <button type="submit" className="w-full py-3 rounded-xl bg-[#F34707] hover:bg-[#d93d06] text-white font-semibold text-sm">Enter</button>
            </form>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const activeDocs = docs[activeTab] ?? [];
  const activeCol = COLLECTIONS.find((c) => c.key === activeTab)!;
  const isPermitTab = activeTab === 'permits';;

  const previewFields = (doc: Doc): [string, string][] => {
    const skip = new Set([
      'id', 'uid', 'updatedAt', 'updatedBy', '_createdBy',
      'handlerLogoImage', 'fboLogo', 'logo', 'logoImage',
      'handlerBusinessGenAviationScvs', 'handlerCargoServices', 'handlerFuelServices',
      'handlerRampServices', 'handlerAdminOpsSvcs', 'handlerSvcsCategories',
      'handlerFuelCards', 'handlerPassengersService', 'handlerPaymentForms',
      'handlerLanguageSpoken', 'handlerOtherServices', 'handlerAccreditations',
      'fboAdministrationOpsSvcs', 'fboBusinessGenSvcs', 'fboCargoServices',
      'fboFuelServices', 'fboRampServices', 'fboServiceCategories',
      'fboFuelCards', 'fboPaymentForms', 'fboLanguageSpoken',
      'fboPassengerService', 'fboOtherServices', 'fboAccreditations',
    ]);
    return Object.entries(doc)
      .filter(([k, v]) => !skip.has(k) && v !== undefined && v !== null && v !== '')
      .slice(0, 7)
      .map(([k, v]) => [k, Array.isArray(v) ? (v as string[]).join(', ') : String(v)]);
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 pb-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">

          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F34707]/10 text-[#F34707] text-xs font-semibold mb-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#F34707]" />
                Admin Portal
              </div>
              <h1 className="text-3xl font-bold text-gray-900">Database Manager</h1>
              <p className="text-gray-400 text-sm mt-1">Search by ICAO · View · Edit · Create · Delete · Upload Images</p>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/admin" className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-500 text-sm hover:bg-white transition-colors">
                ← Admin Home
              </Link>
              <button
                onClick={() => setEditDoc({ doc: null, col: activeTab })}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#F34707] hover:bg-[#d93d06] text-white font-semibold text-sm transition-colors shadow-md">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                New {activeCol.label}
              </button>
            </div>
          </div>

          {/* ICAO Search */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-6">
            <form onSubmit={handleSearch} className="flex gap-3">
              <div className="flex-1 relative">
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                </svg>
                <input
                  type="text"
                  value={icaoInput}
                  onChange={(e) => setIcaoInput(e.target.value)}
                  placeholder="Enter ICAO code (e.g. KJFK, EGLL, KAUS)…"
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#F34707] focus:ring-2 focus:ring-[#F34707]/20 text-sm font-mono uppercase tracking-widest"
                />
              </div>
              <button type="submit" disabled={loading}
                className="px-6 py-3 rounded-xl bg-[#F34707] hover:bg-[#d93d06] text-white font-semibold text-sm transition-colors disabled:opacity-50 flex items-center gap-2 shadow-md">
                {loading
                  ? <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                  : <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" /></svg>
                }
                Search All
              </button>
            </form>
            {searchedIcao && (
              <p className="text-xs text-gray-400 mt-3">
                Showing all records for <span className="font-mono font-bold text-[#F34707]">{searchedIcao}</span> across all collections.{' '}
                <button onClick={handleRefresh} className="text-[#F34707] hover:underline font-medium">Refresh</button>
              </p>
            )}
          </div>

          {/* Collection tabs */}
          <div className="flex flex-wrap gap-2 mb-4">
            {COLLECTIONS.map((col) => {
              const count = col.key === 'permits'
                ? (docs.permits ?? []).length > 0 ? (docs.permits ?? []).length : null
                : searchedIcao ? (docs[col.key] ?? []).length : null;
              const isActive = activeTab === col.key;
              return (
                <button
                  key={col.key}
                  onClick={() => { setActiveTab(col.key); setRowFilter(''); }}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 border ${
                    isActive
                      ? 'bg-[#F34707] text-white border-[#F34707] shadow-md'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-[#F34707]/40 hover:text-[#F34707]'
                  }`}
                >
                  {col.label}
                  {count !== null && (
                    <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold ${
                      isActive ? 'bg-white text-[#F34707]'
                        : count > 0 ? 'bg-[#F34707]/15 text-[#F34707]'
                        : 'bg-gray-100 text-gray-400'
                    }`}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* ── Permit tab: country search bar ───────────────────────────────── */}
          {isPermitTab && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 mb-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Search Permits by Country
                {detectedCountry && (
                  <span className="ml-2 text-[#F34707] normal-case font-normal">
                    (auto-detected from airport: <strong>{detectedCountry}</strong>)
                  </span>
                )}
              </p>
              <form onSubmit={(e) => { e.preventDefault(); fetchPermits(countryInput, secret); }}
                className="flex gap-3">
                <input
                  type="text"
                  value={countryInput}
                  onChange={(e) => setCountryInput(e.target.value)}
                  placeholder="e.g. UNITED STATES OF AMERICA, MEXICO, FRANCE…"
                  className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#F34707] focus:ring-2 focus:ring-[#F34707]/20 uppercase"
                />
                <button type="submit" disabled={permitLoading}
                  className="px-5 py-2.5 rounded-xl bg-[#F34707] hover:bg-[#d93d06] text-white font-semibold text-sm transition-colors disabled:opacity-50 flex items-center gap-2">
                  {permitLoading
                    ? <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                    : <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" /></svg>
                  }
                  Search
                </button>
              </form>
            </div>
          )}

          {/* Results table */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#F34707]/10 text-[#F34707]">
                  {activeCol.label}
                </span>
                <span className="text-sm text-gray-400">
                  {activeDocs.length} record{activeDocs.length !== 1 ? 's' : ''}
                  {isPermitTab && countryInput && (
                    <span className="ml-1 text-gray-300">· {countryInput.toUpperCase()}</span>
                  )}
                </span>
              </div>
              <input
                placeholder="Filter visible rows…"
                value={rowFilter}
                onChange={(e) => setRowFilter(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#F34707] focus:ring-2 focus:ring-[#F34707]/20 w-52"
              />
            </div>

            {/* Permit tab: waiting for country search */}
            {isPermitTab && !countryInput && !permitLoading ? (
              <div className="py-16 text-center">
                <p className="text-gray-400 text-sm">Enter a country name above to search permits.</p>
              </div>
            ) : !isPermitTab && !searchedIcao ? (
              <div className="py-20 text-center">
                <svg className="w-14 h-14 mx-auto text-gray-200 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                </svg>
                <p className="text-gray-400 text-sm">Enter an ICAO code above to search all collections.</p>
              </div>
            ) : (loading || permitLoading) ? (
              <div className="py-20 text-center text-gray-400 text-sm">Searching…</div>
            ) : activeDocs.length === 0 ? (
              <div className="py-16 text-center">
                <p className="text-gray-400 text-sm mb-4">
                  {isPermitTab
                    ? <>No permits found for <span className="font-bold">{countryInput.toUpperCase()}</span>.</>
                    : <>No {activeCol.label} records for <span className="font-mono font-bold">{searchedIcao}</span>.</>
                  }
                </p>
                <button onClick={() => setEditDoc({ doc: null, col: activeTab })}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#F34707] hover:bg-[#d93d06] text-white font-semibold text-sm transition-colors">
                  + Create New {activeCol.label}
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-10">#</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Name / ID</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">ICAO</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Key Fields</th>
                      <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeDocs
                      .filter((d) => !rowFilter || JSON.stringify(d).toLowerCase().includes(rowFilter.toLowerCase()))
                      .map((doc, i) => {
                        const name = String(doc[activeCol.nameField] ?? doc.id ?? '—');
                        const icao = String(doc[activeCol.icaoField] ?? '—');
                        // For airports show airportDiagram; for others find any logo/image field
                        const imageFieldKey = activeCol.key === 'airports'
                          ? 'airportDiagram'
                          : Object.keys(doc).find((k) =>
                              IMAGE_FIELDS.some((f) => k.toLowerCase().includes(f.toLowerCase())) && doc[k]
                            );
                        const logoUrl = imageFieldKey && doc[imageFieldKey] ? String(doc[imageFieldKey]) : null;
                        const hasDiagram = activeCol.key === 'airports'; // show placeholder when missing
                        const fields = previewFields(doc).filter(
                          ([k]) => k !== activeCol.nameField && k !== activeCol.icaoField
                        ).slice(0, 5);

                        return (
                          <tr key={String(doc.id ?? i)}
                            className={`border-b border-gray-100 hover:bg-orange-50/50 transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                            <td className="px-5 py-4 text-xs text-gray-300 font-mono">{i + 1}</td>
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-3">
                                {/* Airport diagram or company logo thumbnail */}
                                {logoUrl ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img
                                    src={logoUrl}
                                    alt="diagram"
                                    className="w-16 h-12 object-contain rounded-lg border border-gray-200 bg-gray-50 flex-shrink-0 cursor-pointer hover:scale-150 hover:shadow-xl transition-transform"
                                    title="Click to open full size"
                                    onClick={() => window.open(logoUrl, '_blank')}
                                  />
                                ) : hasDiagram ? (
                                  /* Missing airport diagram — show red placeholder */
                                  <div className="w-16 h-12 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 flex-shrink-0 flex flex-col items-center justify-center gap-0.5" title="No airport diagram">
                                    <svg className="w-4 h-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <span className="text-[9px] text-gray-400 font-semibold">NO DIAGRAM</span>
                                  </div>
                                ) : null}
                                <span className="font-semibold text-gray-900 max-w-[180px] truncate">{name}</span>
                              </div>
                            </td>
                            <td className="px-5 py-4 font-mono text-[#F34707] font-bold text-sm">{icao}</td>
                            <td className="px-5 py-4">
                              <div className="flex flex-wrap gap-x-4 gap-y-0.5">
                                {fields.map(([k, v]) => (
                                  <span key={k} className="text-xs text-gray-500">
                                    <span className="text-gray-400">{k}:</span>{' '}
                                    <span className="text-gray-700 max-w-[140px] inline-block truncate align-bottom">{v}</span>
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td className="px-5 py-4 text-right">
                              <div className="flex items-center gap-2 justify-end">
                                <button
                                  onClick={() => setEditDoc({ doc, col: activeTab })}
                                  className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold transition-colors flex items-center gap-1">
                                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                  Edit
                                </button>
                                <button
                                  onClick={() => setDeleteDoc({ doc, col: activeTab })}
                                  className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold transition-colors flex items-center gap-1">
                                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />

      {editDoc && (
        <RecordModal
          doc={editDoc.doc}
          colKey={editDoc.col}
          secret={secret}
          onClose={() => setEditDoc(null)}
          onSave={handleRefresh}
        />
      )}
      {deleteDoc && (
        <DeleteConfirm
          doc={deleteDoc.doc}
          colKey={deleteDoc.col}
          secret={secret}
          onClose={() => setDeleteDoc(null)}
          onDone={handleRefresh}
        />
      )}
    </>
  );
}
