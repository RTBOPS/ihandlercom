'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { HandlerRecord, FboRecord, CarRentalRecord, CateringRecord, HotelRecord } from '@/lib/types';
import {
  PAYMENT_CARDS, FUEL_CARDS, CardOption,
  FBO_SERVICE_CATEGORIES, HANDLER_SERVICE_CATEGORIES,
  FUEL_SERVICES, RAMP_SERVICES, PASSENGER_SERVICES, CARGO_SERVICES,
  ADMIN_OPS_SERVICES, LANGUAGES, ACCREDITATIONS, OTHER_SERVICES,
} from '@/lib/portal-options';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import IhIcon from '@/components/IhIcon';

type Tab = 'company' | 'services' | 'carRental' | 'catering' | 'hotel';

type UserProfile = {
  email: string;
  companyName: string;
  companyType: 'fbo' | 'handler';
  icao: string;
  role: string;
  status: string;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function Field({ label, name, value, onChange, multiline, type = 'text', hint }: {
  label: string; name: string; value: string; type?: string; hint?: string;
  onChange: (k: string, v: string) => void; multiline?: boolean;
}) {
  const cls = "w-full px-4 py-3 rounded-xl bg-white border border-gray-300 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#F34707] focus:ring-2 focus:ring-[#F34707]/20 text-sm transition-colors";
  return (
    <div>
      <label className="block text-sm text-gray-600 mb-1.5">{label}</label>
      {multiline
        ? <textarea rows={3} value={value} onChange={(e) => onChange(name, e.target.value)} className={`${cls} resize-none`} />
        : <input type={type} value={value} onChange={(e) => onChange(name, e.target.value)} className={cls} />
      }
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="col-span-full pt-2 pb-1 border-b border-gray-100">
      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">{children}</h3>
    </div>
  );
}

// ─── Tag multi-select ─────────────────────────────────────────────────────────
function TagSelect({ label, options, selected, onChange }: {
  label: string; options: string[]; selected: string[];
  onChange: (v: string[]) => void;
}) {
  const toggle = (o: string) => {
    onChange(selected.includes(o) ? selected.filter((x) => x !== o) : [...selected, o]);
  };
  return (
    <div className="col-span-full">
      <label className="block text-sm text-gray-600 mb-2">{label}</label>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <button key={o} type="button" onClick={() => toggle(o)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${selected.includes(o) ? 'bg-[#F34707] border-[#F34707] text-white' : 'bg-white border-gray-300 text-gray-600 hover:border-[#F34707]/50'}`}>
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Card image multi-select ──────────────────────────────────────────────────
function CardSelect({ label, cards, selected, onChange }: {
  label: string; cards: CardOption[]; selected: string[];
  onChange: (v: string[]) => void;
}) {
  const toggle = (c: CardOption) => {
    onChange(selected.includes(c.label) ? selected.filter((x) => x !== c.label) : [...selected, c.label]);
  };
  return (
    <div className="col-span-full">
      <label className="block text-sm text-gray-600 mb-2">{label}</label>
      <div className="flex flex-wrap gap-3">
        {cards.map((c) => {
          const active = selected.includes(c.label);
          return (
            <button key={c.label} type="button" onClick={() => toggle(c)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl border-2 transition-all ${active ? 'border-[#F34707] bg-[#F34707]/5' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
              {c.logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={c.logo} alt={c.label} className="w-6 h-6 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              ) : (
                <span className="w-6 h-6 rounded flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: c.bg, fontSize: '8px', lineHeight: 1 }}>
                  {c.label.split(' ').map(w => w[0]).join('').slice(0, 3)}
                </span>
              )}
              <span className={`text-xs font-medium ${active ? 'text-[#F34707]' : 'text-gray-700'}`}>{c.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Logo Upload ──────────────────────────────────────────────────────────────
function LogoUpload({ currentUrl, onUploaded, getToken }: {
  currentUrl?: string;
  onUploaded: (url: string) => void;
  getToken: () => Promise<string>;
}) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(currentUrl || '');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { alert('Logo must be under 2 MB.'); return; }
    setUploading(true);
    try {
      const token = await getToken();
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/portal/upload-logo', {
        method: 'POST',
        headers: { authorization: `Bearer ${token}` },
        body: fd,
      });
      if (!res.ok) throw new Error('Upload failed');
      const { url } = await res.json();
      setPreview(url);
      onUploaded(url);
    } catch (err) { console.error(err); alert('Upload failed. Try again.'); }
    finally { setUploading(false); }
  };

  return (
    <div className="col-span-full">
      <label className="block text-sm text-gray-600 mb-2">Company Logo</label>
      <div className="flex items-center gap-4">
        <div className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50 overflow-hidden flex-shrink-0">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="Logo" className="w-full h-full object-contain p-1" />
          ) : (
            <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          )}
        </div>
        <div>
          <button type="button" onClick={() => inputRef.current?.click()} disabled={uploading}
            className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium transition-colors disabled:opacity-50">
            {uploading ? 'Uploading…' : preview ? 'Change Logo' : 'Upload Logo'}
          </button>
          <p className="text-xs text-gray-400 mt-1">PNG, JPG or SVG · Max 2 MB</p>
          <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
        </div>
      </div>
    </div>
  );
}

// ─── Car Rental / Catering / Hotel shared helpers ─────────────────────────────

function ServiceCard({ title, titleIcon, children, editing, onEdit, onSave, onCancel, saving }: {
  title: string; titleIcon?: React.ReactNode; children: React.ReactNode; editing: boolean;
  onEdit: () => void; onSave: () => void; onCancel: () => void; saving: boolean;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      <div className="bg-gray-50 px-5 py-3 border-b border-gray-200 flex items-center justify-between">
        <span className="font-semibold text-gray-800 text-sm flex items-center gap-2">{titleIcon}{title}</span>
        {!editing ? (
          <button onClick={onEdit} className="text-xs text-[#F34707] hover:text-[#d93d06] font-medium">Edit</button>
        ) : (
          <div className="flex gap-2">
            <button onClick={onSave} disabled={saving} className="px-3 py-1 rounded-lg bg-[#F34707] hover:bg-[#d93d06] text-white text-xs font-semibold disabled:opacity-50">
              {saving ? 'Saving…' : 'Save'}
            </button>
            <button onClick={onCancel} className="px-3 py-1 rounded-lg border border-gray-200 text-gray-500 text-xs hover:bg-gray-50">Cancel</button>
          </div>
        )}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

// ─── Car Rental Tab ───────────────────────────────────────────────────────────
function CarRentalTab({ icao, getToken }: { icao: string; getToken: () => Promise<string> }) {
  const [records, setRecords] = useState<CarRentalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Record<string, string>>({});
  const [adding, setAdding] = useState(false);
  const blank = { companyName: '', phone: '', email: '', website: '', address: '', poc: '', whatsapp: '', remarks: '' };
  const [newData, setNewData] = useState<Record<string, string>>(blank);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const load = useCallback(async () => {
    const token = await getToken();
    const res = await fetch('/api/portal/services?col=carRental', { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    setRecords((data.docs || []) as CarRentalRecord[]);
    setLoading(false);
  }, [icao, getToken]);
  useEffect(() => { load(); }, [load]);

  const fields = [
    { name: 'companyName', label: 'Company Name' }, { name: 'phone', label: 'Phone' },
    { name: 'email', label: 'Email' }, { name: 'website', label: 'Website' },
    { name: 'address', label: 'Address' }, { name: 'poc', label: 'Contact Person' },
    { name: 'whatsapp', label: 'WhatsApp' }, { name: 'remarks', label: 'Remarks', multiline: true },
  ];

  const flash = (m: string) => { setMsg(m); setTimeout(() => setMsg(''), 3000); };

  const saveEdit = async () => {
    if (!editingId) return; setSaving(true);
    const token = await getToken();
    await fetch('/api/portal/services', { method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ col: 'carRental', docId: editingId, fields: editData }) });
    setEditingId(null); await load(); flash('Saved!'); setSaving(false);
  };
  const saveNew = async () => {
    if (!newData.companyName.trim()) return; setSaving(true);
    const token = await getToken();
    await fetch('/api/portal/services', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ col: 'carRental', fields: newData }) });
    setAdding(false); setNewData(blank); await load(); flash('Added!'); setSaving(false);
  };

  if (loading) return <div className="py-8 text-center text-gray-400 text-sm">Loading…</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">Car rental companies at <span className="font-mono text-[#F34707] font-bold">{icao}</span></p>
        <div className="flex items-center gap-3">
          {msg && <span className="text-sm text-green-600 font-medium">{msg}</span>}
          <button onClick={() => setAdding(true)} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#F34707] hover:bg-[#d93d06] text-white text-xs font-semibold">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Add
          </button>
        </div>
      </div>
      {records.length === 0 && !adding && (
        <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center text-gray-400 text-sm">No car rental companies yet. Click Add to create one.</div>
      )}
      {records.map((r) => (
        <ServiceCard key={r.id} title={r.companyName} titleIcon={<IhIcon name="limo" className="w-5 h-5 text-[#F34707]" />} editing={editingId === r.id}
          onEdit={() => { setEditingId(r.id); setEditData({ companyName: r.companyName, phone: r.phone || '', email: r.email || '', website: r.website || '', address: r.address || '', poc: r.poc || '', whatsapp: r.whatsapp || '', remarks: r.remarks || '' }); }}
          onSave={saveEdit} onCancel={() => setEditingId(null)} saving={saving}>
          {editingId === r.id ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {fields.map((f) => (<div key={f.name} className={f.multiline ? 'sm:col-span-2' : ''}><Field label={f.label} name={f.name} value={editData[f.name] || ''} onChange={(k, v) => setEditData((p) => ({ ...p, [k]: v }))} multiline={f.multiline} /></div>))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-1 text-sm">
              {r.phone && <p className="text-gray-600">📞 {r.phone}</p>}
              {r.email && <p className="text-gray-600">✉ {r.email}</p>}
              {r.website && <p className="text-gray-600">🌐 {r.website}</p>}
              {r.address && <p className="text-gray-600 sm:col-span-2">📍 {r.address}</p>}
              {r.poc && <p className="text-gray-500 text-xs">Contact: {r.poc}</p>}
              {r.remarks && <p className="text-gray-400 text-xs sm:col-span-3">Note: {r.remarks}</p>}
            </div>
          )}
        </ServiceCard>
      ))}
      {adding && (
        <div className="rounded-xl border-2 border-[#F34707]/30 bg-[#F34707]/5 p-5 space-y-4">
          <h4 className="text-sm font-semibold text-gray-800">New Car Rental Company</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {fields.map((f) => (<div key={f.name} className={f.multiline ? 'sm:col-span-2' : ''}><Field label={f.label} name={f.name} value={newData[f.name] || ''} onChange={(k, v) => setNewData((p) => ({ ...p, [k]: v }))} multiline={f.multiline} /></div>))}
          </div>
          <div className="flex gap-2">
            <button onClick={saveNew} disabled={saving || !newData.companyName.trim()} className="px-4 py-2 rounded-lg bg-[#F34707] text-white text-xs font-semibold disabled:opacity-50">{saving ? 'Adding…' : 'Add Company'}</button>
            <button onClick={() => setAdding(false)} className="px-4 py-2 rounded-lg border border-gray-200 text-gray-500 text-xs">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Catering Tab ─────────────────────────────────────────────────────────────
function CateringTab({ icao, getToken }: { icao: string; getToken: () => Promise<string> }) {
  const [records, setRecords] = useState<CateringRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Record<string, string>>({});
  const [adding, setAdding] = useState(false);
  const blank = { companyName: '', phone: '', email: '', website: '', address: '', poc: '', whatsapp: '', cuisineType: '', remarks: '' };
  const [newData, setNewData] = useState<Record<string, string>>(blank);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const load = useCallback(async () => {
    const token = await getToken();
    const res = await fetch('/api/portal/services?col=catering', { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    setRecords((data.docs || []) as CateringRecord[]);
    setLoading(false);
  }, [icao, getToken]);
  useEffect(() => { load(); }, [load]);

  const fields = [
    { name: 'companyName', label: 'Company Name' }, { name: 'cuisineType', label: 'Cuisine / Type' },
    { name: 'phone', label: 'Phone' }, { name: 'email', label: 'Email' },
    { name: 'website', label: 'Website' }, { name: 'address', label: 'Address' },
    { name: 'poc', label: 'Contact Person' }, { name: 'whatsapp', label: 'WhatsApp' },
    { name: 'remarks', label: 'Remarks', multiline: true },
  ];
  const flash = (m: string) => { setMsg(m); setTimeout(() => setMsg(''), 3000); };

  const saveEdit = async () => {
    if (!editingId) return; setSaving(true);
    const token = await getToken();
    await fetch('/api/portal/services', { method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ col: 'catering', docId: editingId, fields: editData }) });
    setEditingId(null); await load(); flash('Saved!'); setSaving(false);
  };
  const saveNew = async () => {
    if (!newData.companyName.trim()) return; setSaving(true);
    const token = await getToken();
    await fetch('/api/portal/services', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ col: 'catering', fields: newData }) });
    setAdding(false); setNewData(blank); await load(); flash('Added!'); setSaving(false);
  };

  if (loading) return <div className="py-8 text-center text-gray-400 text-sm">Loading…</div>;
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">Catering services at <span className="font-mono text-[#F34707] font-bold">{icao}</span></p>
        <div className="flex items-center gap-3">
          {msg && <span className="text-sm text-green-600 font-medium">{msg}</span>}
          <button onClick={() => setAdding(true)} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#F34707] hover:bg-[#d93d06] text-white text-xs font-semibold">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Add
          </button>
        </div>
      </div>
      {records.length === 0 && !adding && (
        <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center text-gray-400 text-sm">No catering services yet.</div>
      )}
      {records.map((r) => (
        <ServiceCard key={r.id} title={`${r.companyName}${r.cuisineType ? ` · ${r.cuisineType}` : ''}`} titleIcon={<IhIcon name="catering" className="w-5 h-5 text-[#F34707]" />} editing={editingId === r.id}
          onEdit={() => { setEditingId(r.id); setEditData({ companyName: r.companyName, phone: r.phone || '', email: r.email || '', website: r.website || '', address: r.address || '', poc: r.poc || '', whatsapp: r.whatsapp || '', cuisineType: r.cuisineType || '', remarks: r.remarks || '' }); }}
          onSave={saveEdit} onCancel={() => setEditingId(null)} saving={saving}>
          {editingId === r.id ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {fields.map((f) => (<div key={f.name} className={f.multiline ? 'sm:col-span-2' : ''}><Field label={f.label} name={f.name} value={editData[f.name] || ''} onChange={(k, v) => setEditData((p) => ({ ...p, [k]: v }))} multiline={f.multiline} /></div>))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-1 text-sm">
              {r.phone && <p className="text-gray-600">📞 {r.phone}</p>}
              {r.email && <p className="text-gray-600">✉ {r.email}</p>}
              {r.website && <p className="text-gray-600">🌐 {r.website}</p>}
              {r.address && <p className="text-gray-600 sm:col-span-2">📍 {r.address}</p>}
              {r.poc && <p className="text-gray-500 text-xs">Contact: {r.poc}</p>}
              {r.remarks && <p className="text-gray-400 text-xs sm:col-span-3">Note: {r.remarks}</p>}
            </div>
          )}
        </ServiceCard>
      ))}
      {adding && (
        <div className="rounded-xl border-2 border-[#F34707]/30 bg-[#F34707]/5 p-5 space-y-4">
          <h4 className="text-sm font-semibold text-gray-800">New Catering Service</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {fields.map((f) => (<div key={f.name} className={f.multiline ? 'sm:col-span-2' : ''}><Field label={f.label} name={f.name} value={newData[f.name] || ''} onChange={(k, v) => setNewData((p) => ({ ...p, [k]: v }))} multiline={f.multiline} /></div>))}
          </div>
          <div className="flex gap-2">
            <button onClick={saveNew} disabled={saving || !newData.companyName.trim()} className="px-4 py-2 rounded-lg bg-[#F34707] text-white text-xs font-semibold disabled:opacity-50">{saving ? 'Adding…' : 'Add'}</button>
            <button onClick={() => setAdding(false)} className="px-4 py-2 rounded-lg border border-gray-200 text-gray-500 text-xs">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Hotel Tab ────────────────────────────────────────────────────────────────
function HotelTab({ icao, getToken }: { icao: string; getToken: () => Promise<string> }) {
  const [records, setRecords] = useState<HotelRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Record<string, string>>({});
  const [adding, setAdding] = useState(false);
  const blank = { name: '', phone: '', email: '', website: '', address: '', stars: '', distanceFromAirport: '', shuttle: '', remarks: '' };
  const [newData, setNewData] = useState<Record<string, string>>(blank);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const load = useCallback(async () => {
    const token = await getToken();
    const res = await fetch('/api/portal/services?col=hotel', { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    setRecords((data.docs || []) as HotelRecord[]);
    setLoading(false);
  }, [icao, getToken]);
  useEffect(() => { load(); }, [load]);

  const fields = [
    { name: 'name', label: 'Hotel Name' }, { name: 'stars', label: 'Stars (1–5)' },
    { name: 'phone', label: 'Phone' }, { name: 'email', label: 'Email' },
    { name: 'website', label: 'Website' }, { name: 'address', label: 'Address' },
    { name: 'distanceFromAirport', label: 'Distance from Airport' },
    { name: 'shuttle', label: 'Shuttle (Yes / No / On Request)' },
    { name: 'remarks', label: 'Remarks', multiline: true },
  ];
  const flash = (m: string) => { setMsg(m); setTimeout(() => setMsg(''), 3000); };
  const starLabel = (s?: string) => s ? '⭐'.repeat(Math.min(parseInt(s) || 0, 5)) : '';

  const saveEdit = async () => {
    if (!editingId) return; setSaving(true);
    const token = await getToken();
    await fetch('/api/portal/services', { method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ col: 'hotel', docId: editingId, fields: editData }) });
    setEditingId(null); await load(); flash('Saved!'); setSaving(false);
  };
  const saveNew = async () => {
    if (!newData.name.trim()) return; setSaving(true);
    const token = await getToken();
    await fetch('/api/portal/services', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ col: 'hotel', fields: newData }) });
    setAdding(false); setNewData(blank); await load(); flash('Added!'); setSaving(false);
  };

  if (loading) return <div className="py-8 text-center text-gray-400 text-sm">Loading…</div>;
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">Hotels near <span className="font-mono text-[#F34707] font-bold">{icao}</span></p>
        <div className="flex items-center gap-3">
          {msg && <span className="text-sm text-green-600 font-medium">{msg}</span>}
          <button onClick={() => setAdding(true)} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#F34707] hover:bg-[#d93d06] text-white text-xs font-semibold">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Add
          </button>
        </div>
      </div>
      {records.length === 0 && !adding && (
        <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center text-gray-400 text-sm">No hotels yet.</div>
      )}
      {records.map((r) => (
        <ServiceCard key={r.id} title={`${r.name} ${starLabel(r.stars)}`} titleIcon={<IhIcon name="hotel" className="w-5 h-5 text-[#F34707]" />} editing={editingId === r.id}
          onEdit={() => { setEditingId(r.id); setEditData({ name: r.name, phone: r.phone || '', email: r.email || '', website: r.website || '', address: r.address || '', stars: r.stars || '', distanceFromAirport: r.distanceFromAirport || '', shuttle: r.shuttle || '', remarks: r.remarks || '' }); }}
          onSave={saveEdit} onCancel={() => setEditingId(null)} saving={saving}>
          {editingId === r.id ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {fields.map((f) => (<div key={f.name} className={f.multiline ? 'sm:col-span-2' : ''}><Field label={f.label} name={f.name} value={editData[f.name] || ''} onChange={(k, v) => setEditData((p) => ({ ...p, [k]: v }))} multiline={f.multiline} /></div>))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-1 text-sm">
              {r.distanceFromAirport && <p className="text-gray-600">📏 {r.distanceFromAirport}</p>}
              {r.shuttle && <p className="text-gray-600">🚌 Shuttle: {r.shuttle}</p>}
              {r.phone && <p className="text-gray-600">📞 {r.phone}</p>}
              {r.email && <p className="text-gray-600">✉ {r.email}</p>}
              {r.website && <p className="text-gray-600">🌐 {r.website}</p>}
              {r.address && <p className="text-gray-600 sm:col-span-3">📍 {r.address}</p>}
              {r.remarks && <p className="text-gray-400 text-xs sm:col-span-3">Note: {r.remarks}</p>}
            </div>
          )}
        </ServiceCard>
      ))}
      {adding && (
        <div className="rounded-xl border-2 border-[#F34707]/30 bg-[#F34707]/5 p-5 space-y-4">
          <h4 className="text-sm font-semibold text-gray-800">New Hotel</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {fields.map((f) => (<div key={f.name} className={f.multiline ? 'sm:col-span-2' : ''}><Field label={f.label} name={f.name} value={newData[f.name] || ''} onChange={(k, v) => setNewData((p) => ({ ...p, [k]: v }))} multiline={f.multiline} /></div>))}
          </div>
          <div className="flex gap-2">
            <button onClick={saveNew} disabled={saving || !newData.name.trim()} className="px-4 py-2 rounded-lg bg-[#F34707] text-white text-xs font-semibold disabled:opacity-50">{saving ? 'Adding…' : 'Add Hotel'}</button>
            <button onClick={() => setAdding(false)} className="px-4 py-2 rounded-lg border border-gray-200 text-gray-500 text-xs">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Portal ──────────────────────────────────────────────────────────────
export default function PortalPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [record, setRecord] = useState<HandlerRecord | FboRecord | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [activeTab, setActiveTab] = useState<Tab>('company');

  // Text fields
  const [formData, setFormData] = useState<Record<string, string>>({});
  // Array fields
  const [arrayData, setArrayData] = useState<Record<string, string[]>>({});

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;
    async function load() {
      try {
        const token = await user!.getIdToken();
        const res = await fetch('/api/portal/profile', {
          headers: { authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;
        const p = (await res.json()) as UserProfile;
        setProfile(p);
        const recRes = await fetch('/api/portal/record', {
          headers: { authorization: `Bearer ${token}` },
        });
        if (recRes.ok) {
          const r = (await recRes.json()) as HandlerRecord | FboRecord;
          setRecord(r);
          if (p.companyType === 'fbo') {
            const f = r as FboRecord;
            setFormData({
              fboPhne: f.fboPhne || '', fboEmail: f.fboEmail || '', fboWebsite: f.fboWebsite || '',
              fboAddress: f.fboAddress || '', fboPocName: f.fboPocName || '', fboPocTitle: f.fboPocTitle || '',
              fboPocMobile: f.fboPocMobile || '', fboWhatsapp: f.fboWhatsapp || '', fboRemarks: f.fboRemarks || '',
              fboAfterHoursPhone: f.fboAfterHoursPhone || '', fboTollFreePhone: f.fboTollFreePhone || '',
              fboFax: f.fboFax || '', fboAftn: f.fboAftn || '', fboSita: f.fboSita || '',
              fboFrecuency: f.fboFrecuency || '', fboMembership: f.fboMembership || '',
              fboLinkedin: f.fboLinkedin || '', fboFacebook: f.fboFacebook || '',
              fboLogo: f.fboLogo || '',
            });
            setArrayData({
              fboServiceCategories: f.fboServiceCategories || [],
              fboFuelServices: f.fboFuelServices || [],
              fboRampServices: f.fboRampServices || [],
              fboPassengerService: f.fboPassengerService || [],
              fboCargoServices: f.fboCargoServices || [],
              fboAdministrationOpsSvcs: f.fboAdministrationOpsSvcs || [],
              fboOtherServices: f.fboOtherServices || [],
              fboPaymentForms: f.fboPaymentForms || [],
              fboFuelCards: f.fboFuelCards || [],
              fboLanguageSpoken: f.fboLanguageSpoken || [],
              fboAccreditations: f.fboAccreditations || [],
            });
          } else {
            const h = r as HandlerRecord;
            setFormData({
              handlerPhone: h.handlerPhone || '', handlerEmail: h.handlerEmail || '',
              handlerWebsite: h.handlerWebsite || '', handlerAddress: h.handlerAddress || '',
              handlerPoc: h.handlerPoc || '', handlerPocTitle: h.handlerPocTitle || '',
              handlerPocMobile: h.handlerPocMobile || '', handlerWhatsapp: h.handlerWhatsapp || '',
              handlerRemarks: h.handlerRemarks || '', handlerAfterHoursPhone: h.handlerAfterHoursPhone || '',
              handlerTollFreePhone: h.handlerTollFreePhone || '', handlerFax: h.handlerFax || '',
              handlerAftn: h.handlerAftn || '', handlerSita: h.handlerSita || '',
              handlerFrecuency: h.handlerFrecuency || '', handlerLinkedin: h.handlerLinkedin || '',
              handlerFacebook: h.handlerFacebook || '', handlerLogoImage: h.handlerLogoImage || '',
            });
            setArrayData({
              handlerSvcsCategories: h.handlerSvcsCategories || [],
              handlerFuelServices: h.handlerFuelServices || [],
              handlerRampServices: h.handlerRampServices || [],
              handlerPassengersService: h.handlerPassengersService || [],
              handlerCargoServices: h.handlerCargoServices || [],
              handlerAdminOpsSvcs: h.handlerAdminOpsSvcs || [],
              handlerOtherServices: h.handlerOtherServices || [],
              handlerPaymentForms: h.handlerPaymentForms || [],
              handlerFuelCards: h.handlerFuelCards || [],
              handlerLanguageSpoken: h.handlerLanguageSpoken || [],
              handlerAccreditations: h.handlerAccreditations || [],
            });
          }
        }
      } catch (err) { console.error(err); }
      finally { setLoadingData(false); }
    }
    load();
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!record || !user) return;
    setSaving(true); setSaveMsg('');
    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/portal/record', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', authorization: `Bearer ${token}` },
        body: JSON.stringify({ recordId: record.id, fields: { ...formData, ...arrayData } }),
      });
      if (res.ok) {
        setSaveMsg('Changes saved!');
        setTimeout(() => setSaveMsg(''), 3000);
      } else {
        setSaveMsg('Error saving. Try again.');
      }
    } catch { setSaveMsg('Error saving. Try again.'); }
    finally { setSaving(false); }
  };

  if (authLoading || loadingData) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen pt-24 flex items-center justify-center bg-white">
          <div className="flex items-center gap-3 text-gray-400 text-sm">
            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            Loading your portal…
          </div>
        </main>
      </>
    );
  }

  if (!user || !profile) return null;

  const isFbo = profile.companyType === 'fbo';
  const logoKey = isFbo ? 'fboLogo' : 'handlerLogoImage';
  const svcCategories = isFbo ? FBO_SERVICE_CATEGORIES : HANDLER_SERVICE_CATEGORIES;
  const svcKey = isFbo ? 'fboServiceCategories' : 'handlerSvcsCategories';
  const fuelSvcKey = isFbo ? 'fboFuelServices' : 'handlerFuelServices';
  const rampKey = isFbo ? 'fboRampServices' : 'handlerRampServices';
  const paxKey = isFbo ? 'fboPassengerService' : 'handlerPassengersService';
  const cargoKey = isFbo ? 'fboCargoServices' : 'handlerCargoServices';
  const adminKey = isFbo ? 'fboAdministrationOpsSvcs' : 'handlerAdminOpsSvcs';
  const otherKey = isFbo ? 'fboOtherServices' : 'handlerOtherServices';
  const payKey = isFbo ? 'fboPaymentForms' : 'handlerPaymentForms';
  const fuelCardKey = isFbo ? 'fboFuelCards' : 'handlerFuelCards';
  const langKey = isFbo ? 'fboLanguageSpoken' : 'handlerLanguageSpoken';
  const accredKey = isFbo ? 'fboAccreditations' : 'handlerAccreditations';

  type IhIconName = 'fbo' | 'handler' | 'fuel' | 'limo' | 'catering' | 'hotel' | 'aircraft' | 'runway' | 'pilot';
  const tabs: { id: Tab; label: string; iconName: IhIconName }[] = [
    { id: 'company',   label: 'My Company',  iconName: isFbo ? 'fbo' : 'handler' },
    { id: 'services',  label: 'Services',     iconName: 'fuel' },
    { id: 'carRental', label: 'Car Rental',   iconName: 'limo' },
    { id: 'catering',  label: 'Catering',     iconName: 'catering' },
    { id: 'hotel',     label: 'Hotels',       iconName: 'hotel' },
  ];

  const setArr = (key: string, val: string[]) => setArrayData((p) => ({ ...p, [key]: val }));

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 pb-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto">

          {/* Header */}
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F34707]/10 text-[#F34707] text-xs font-semibold mb-3">
              <IhIcon name={isFbo ? 'fbo' : 'handler'} className="w-3.5 h-3.5" />
              {isFbo ? 'FBO' : 'Handler'} Portal
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">{profile.companyName}</h1>
            <p className="text-gray-400 text-sm">
              <span className="font-mono text-[#F34707] font-bold">{profile.icao}</span>
              {' · '}{isFbo ? 'Fixed Base Operator' : 'Ground Handler'}
              {' · '}{profile.email}
            </p>
          </div>

          {profile.status === 'pending' && (
            <div className="mb-6 px-4 py-3 rounded-xl bg-yellow-50 border border-yellow-200 text-yellow-700 text-sm">
              ⚠️ Your account is pending review. Once approved, changes will be visible in the directory.
            </div>
          )}

          {/* Tabs */}
          <div className="flex flex-wrap gap-1 mb-6 p-1 bg-gray-100 rounded-2xl w-fit">
            {tabs.map((t) => (
              <button key={t.id} onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === t.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                <IhIcon name={t.iconName} className="w-4 h-4" /> {t.label}
              </button>
            ))}
          </div>

          {/* ── Tab: My Company ── */}
          {activeTab === 'company' && (
            !record ? (
              <div className="rounded-2xl border border-gray-200 p-8 text-center shadow-sm">
                <p className="text-gray-500 text-sm mb-3">No listing found for your company name and ICAO.</p>
                <p className="text-gray-400 text-xs">Contact <a href="mailto:operations@i-handler.app" className="text-[#F34707]">operations@i-handler.app</a></p>
              </div>
            ) : (
              <form onSubmit={handleSave} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Contact Information</h2>
                  <div className="flex items-center gap-3">
                    {saveMsg && <span className={`text-sm font-medium ${saveMsg.includes('Error') ? 'text-red-500' : 'text-green-600'}`}>{saveMsg}</span>}
                    <button type="submit" disabled={saving}
                      className="px-5 py-2.5 rounded-xl bg-[#F34707] hover:bg-[#d93d06] text-white font-semibold text-sm disabled:opacity-50 shadow-md">
                      {saving ? 'Saving…' : 'Save Changes'}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Logo */}
                  <LogoUpload
                    currentUrl={formData[logoKey]}
                    getToken={() => user.getIdToken()}
                    onUploaded={(url) => setFormData((p) => ({ ...p, [logoKey]: url }))}
                  />

                  <SectionTitle>Primary Contact</SectionTitle>
                  {isFbo ? (
                    <>
                      <Field label="Phone" name="fboPhne" value={formData.fboPhne || ''} onChange={(k,v)=>setFormData(p=>({...p,[k]:v}))} />
                      <Field label="After Hours Phone" name="fboAfterHoursPhone" value={formData.fboAfterHoursPhone || ''} onChange={(k,v)=>setFormData(p=>({...p,[k]:v}))} />
                      <Field label="Toll-Free Phone" name="fboTollFreePhone" value={formData.fboTollFreePhone || ''} onChange={(k,v)=>setFormData(p=>({...p,[k]:v}))} />
                      <Field label="Fax" name="fboFax" value={formData.fboFax || ''} onChange={(k,v)=>setFormData(p=>({...p,[k]:v}))} />
                      <Field label="Email" name="fboEmail" value={formData.fboEmail || ''} onChange={(k,v)=>setFormData(p=>({...p,[k]:v}))} type="email" />
                      <Field label="Website" name="fboWebsite" value={formData.fboWebsite || ''} onChange={(k,v)=>setFormData(p=>({...p,[k]:v}))} />
                      <Field label="WhatsApp" name="fboWhatsapp" value={formData.fboWhatsapp || ''} onChange={(k,v)=>setFormData(p=>({...p,[k]:v}))} />
                      <div className="sm:col-span-2"><Field label="Address" name="fboAddress" value={formData.fboAddress || ''} onChange={(k,v)=>setFormData(p=>({...p,[k]:v}))} /></div>

                      <SectionTitle>Point of Contact</SectionTitle>
                      <Field label="Name" name="fboPocName" value={formData.fboPocName || ''} onChange={(k,v)=>setFormData(p=>({...p,[k]:v}))} />
                      <Field label="Title" name="fboPocTitle" value={formData.fboPocTitle || ''} onChange={(k,v)=>setFormData(p=>({...p,[k]:v}))} />
                      <Field label="Mobile" name="fboPocMobile" value={formData.fboPocMobile || ''} onChange={(k,v)=>setFormData(p=>({...p,[k]:v}))} />

                      <SectionTitle>Technical & Social</SectionTitle>
                      <Field label="AFTN" name="fboAftn" value={formData.fboAftn || ''} onChange={(k,v)=>setFormData(p=>({...p,[k]:v}))} hint="e.g. XXXXZFZX" />
                      <Field label="SITA" name="fboSita" value={formData.fboSita || ''} onChange={(k,v)=>setFormData(p=>({...p,[k]:v}))} />
                      <Field label="VHF Frequency" name="fboFrecuency" value={formData.fboFrecuency || ''} onChange={(k,v)=>setFormData(p=>({...p,[k]:v}))} hint="e.g. 130.250 MHz" />
                      <Field label="Membership" name="fboMembership" value={formData.fboMembership || ''} onChange={(k,v)=>setFormData(p=>({...p,[k]:v}))} hint="e.g. NATA, IS-BAH" />
                      <Field label="LinkedIn" name="fboLinkedin" value={formData.fboLinkedin || ''} onChange={(k,v)=>setFormData(p=>({...p,[k]:v}))} />
                      <Field label="Facebook" name="fboFacebook" value={formData.fboFacebook || ''} onChange={(k,v)=>setFormData(p=>({...p,[k]:v}))} />

                      <SectionTitle>General Remarks</SectionTitle>
                      <div className="sm:col-span-2"><Field label="Remarks" name="fboRemarks" value={formData.fboRemarks || ''} onChange={(k,v)=>setFormData(p=>({...p,[k]:v}))} multiline /></div>
                    </>
                  ) : (
                    <>
                      <Field label="Phone" name="handlerPhone" value={formData.handlerPhone || ''} onChange={(k,v)=>setFormData(p=>({...p,[k]:v}))} />
                      <Field label="After Hours Phone" name="handlerAfterHoursPhone" value={formData.handlerAfterHoursPhone || ''} onChange={(k,v)=>setFormData(p=>({...p,[k]:v}))} />
                      <Field label="Toll-Free Phone" name="handlerTollFreePhone" value={formData.handlerTollFreePhone || ''} onChange={(k,v)=>setFormData(p=>({...p,[k]:v}))} />
                      <Field label="Fax" name="handlerFax" value={formData.handlerFax || ''} onChange={(k,v)=>setFormData(p=>({...p,[k]:v}))} />
                      <Field label="Email" name="handlerEmail" value={formData.handlerEmail || ''} onChange={(k,v)=>setFormData(p=>({...p,[k]:v}))} type="email" />
                      <Field label="Website" name="handlerWebsite" value={formData.handlerWebsite || ''} onChange={(k,v)=>setFormData(p=>({...p,[k]:v}))} />
                      <Field label="WhatsApp" name="handlerWhatsapp" value={formData.handlerWhatsapp || ''} onChange={(k,v)=>setFormData(p=>({...p,[k]:v}))} />
                      <div className="sm:col-span-2"><Field label="Address" name="handlerAddress" value={formData.handlerAddress || ''} onChange={(k,v)=>setFormData(p=>({...p,[k]:v}))} /></div>

                      <SectionTitle>Point of Contact</SectionTitle>
                      <Field label="Name" name="handlerPoc" value={formData.handlerPoc || ''} onChange={(k,v)=>setFormData(p=>({...p,[k]:v}))} />
                      <Field label="Title" name="handlerPocTitle" value={formData.handlerPocTitle || ''} onChange={(k,v)=>setFormData(p=>({...p,[k]:v}))} />
                      <Field label="Mobile" name="handlerPocMobile" value={formData.handlerPocMobile || ''} onChange={(k,v)=>setFormData(p=>({...p,[k]:v}))} />

                      <SectionTitle>Technical & Social</SectionTitle>
                      <Field label="AFTN" name="handlerAftn" value={formData.handlerAftn || ''} onChange={(k,v)=>setFormData(p=>({...p,[k]:v}))} hint="e.g. XXXXZFZX" />
                      <Field label="SITA" name="handlerSita" value={formData.handlerSita || ''} onChange={(k,v)=>setFormData(p=>({...p,[k]:v}))} />
                      <Field label="VHF Frequency" name="handlerFrecuency" value={formData.handlerFrecuency || ''} onChange={(k,v)=>setFormData(p=>({...p,[k]:v}))} hint="e.g. 130.250 MHz" />
                      <Field label="LinkedIn" name="handlerLinkedin" value={formData.handlerLinkedin || ''} onChange={(k,v)=>setFormData(p=>({...p,[k]:v}))} />
                      <Field label="Facebook" name="handlerFacebook" value={formData.handlerFacebook || ''} onChange={(k,v)=>setFormData(p=>({...p,[k]:v}))} />

                      <SectionTitle>General Remarks</SectionTitle>
                      <div className="sm:col-span-2"><Field label="Remarks" name="handlerRemarks" value={formData.handlerRemarks || ''} onChange={(k,v)=>setFormData(p=>({...p,[k]:v}))} multiline /></div>
                    </>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <p className="text-xs text-gray-400">To update logos not accepted, contact <a href="mailto:operations@i-handler.app" className="text-[#F34707]">operations@i-handler.app</a></p>
                  <button type="submit" disabled={saving}
                    className="px-5 py-2.5 rounded-xl bg-[#F34707] hover:bg-[#d93d06] text-white font-semibold text-sm disabled:opacity-50 shadow-md">
                    {saving ? 'Saving…' : 'Save Changes'}
                  </button>
                </div>
              </form>
            )
          )}

          {/* ── Tab: Services ── */}
          {activeTab === 'services' && (
            <form onSubmit={handleSave} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Services & Capabilities</h2>
                <div className="flex items-center gap-3">
                  {saveMsg && <span className={`text-sm font-medium ${saveMsg.includes('Error') ? 'text-red-500' : 'text-green-600'}`}>{saveMsg}</span>}
                  <button type="submit" disabled={saving}
                    className="px-5 py-2.5 rounded-xl bg-[#F34707] hover:bg-[#d93d06] text-white font-semibold text-sm disabled:opacity-50 shadow-md">
                    {saving ? 'Saving…' : 'Save Changes'}
                  </button>
                </div>
              </div>

              <div className="space-y-6">
                <TagSelect label="Service Categories" options={svcCategories} selected={arrayData[svcKey] || []} onChange={(v) => setArr(svcKey, v)} />
                <TagSelect label="Fuel Services" options={FUEL_SERVICES} selected={arrayData[fuelSvcKey] || []} onChange={(v) => setArr(fuelSvcKey, v)} />
                <TagSelect label="Ramp Services" options={RAMP_SERVICES} selected={arrayData[rampKey] || []} onChange={(v) => setArr(rampKey, v)} />
                <TagSelect label="Passenger Services" options={PASSENGER_SERVICES} selected={arrayData[paxKey] || []} onChange={(v) => setArr(paxKey, v)} />
                <TagSelect label="Cargo Services" options={CARGO_SERVICES} selected={arrayData[cargoKey] || []} onChange={(v) => setArr(cargoKey, v)} />
                <TagSelect label="Admin & Operations" options={ADMIN_OPS_SERVICES} selected={arrayData[adminKey] || []} onChange={(v) => setArr(adminKey, v)} />
                <TagSelect label="Other Services" options={OTHER_SERVICES} selected={arrayData[otherKey] || []} onChange={(v) => setArr(otherKey, v)} />
                <TagSelect label="Languages Spoken" options={LANGUAGES} selected={arrayData[langKey] || []} onChange={(v) => setArr(langKey, v)} />
                <TagSelect label="Accreditations & Memberships" options={ACCREDITATIONS} selected={arrayData[accredKey] || []} onChange={(v) => setArr(accredKey, v)} />

                <div className="border-t border-gray-100 pt-6 space-y-6">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Payment & Fuel Cards</h3>
                  <CardSelect label="Accepted Payment Methods" cards={PAYMENT_CARDS} selected={arrayData[payKey] || []} onChange={(v) => setArr(payKey, v)} />
                  <CardSelect label="Accepted Fuel Cards" cards={FUEL_CARDS} selected={arrayData[fuelCardKey] || []} onChange={(v) => setArr(fuelCardKey, v)} />
                </div>
              </div>

              <div className="pt-2 border-t border-gray-100 flex justify-end">
                <button type="submit" disabled={saving}
                  className="px-5 py-2.5 rounded-xl bg-[#F34707] hover:bg-[#d93d06] text-white font-semibold text-sm disabled:opacity-50 shadow-md">
                  {saving ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </form>
          )}

          {activeTab === 'carRental' && <CarRentalTab icao={profile.icao} getToken={() => user.getIdToken()} />}
          {activeTab === 'catering'  && <CateringTab  icao={profile.icao} getToken={() => user.getIdToken()} />}
          {activeTab === 'hotel'     && <HotelTab     icao={profile.icao} getToken={() => user.getIdToken()} />}

        </div>
      </main>
      <Footer />
    </>
  );
}
