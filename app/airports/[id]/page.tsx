'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { AirportRecord, HandlerRecord, FboRecord } from '@/lib/types';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import LockedField from '@/components/LockedField';
import IhIcon from '@/components/IhIcon';

function InfoRow({ label, value }: { label: string; value?: string | number | null }) {
  if (value === undefined || value === null || value === '') return null;
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-1 py-3 border-b border-gray-100 last:border-0">
      <span className="text-gray-400 text-xs uppercase tracking-wider w-52 flex-shrink-0 pt-0.5">{label}</span>
      <span className="text-gray-800 text-sm">{String(value)}</span>
    </div>
  );
}

interface ContactDept {
  dept: string;
  phone?: string;
  fax?: string;
  email?: string;
  website?: string;
  frequency?: string;
}

function ContactTable({ contacts }: { contacts: ContactDept[] }) {
  const visible = contacts.filter(c => c.phone || c.fax || c.email || c.website || c.frequency);
  if (visible.length === 0) return null;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-2 pr-4 text-xs text-gray-400 uppercase tracking-wider font-medium">Department</th>
            <th className="text-left py-2 pr-4 text-xs text-gray-400 uppercase tracking-wider font-medium">Phone</th>
            <th className="text-left py-2 pr-4 text-xs text-gray-400 uppercase tracking-wider font-medium">Fax</th>
            <th className="text-left py-2 pr-4 text-xs text-gray-400 uppercase tracking-wider font-medium">Frequency</th>
            <th className="text-left py-2 text-xs text-gray-400 uppercase tracking-wider font-medium">Email / Website</th>
          </tr>
        </thead>
        <tbody>
          {visible.map((c) => (
            <tr key={c.dept} className="border-b border-gray-100 hover:bg-orange-50 transition-colors">
              <td className="py-2.5 pr-4 text-gray-800 font-medium whitespace-nowrap">{c.dept}</td>
              <td className="py-2.5 pr-4 text-gray-500 whitespace-nowrap">{c.phone || '—'}</td>
              <td className="py-2.5 pr-4 text-gray-500 whitespace-nowrap">{c.fax || '—'}</td>
              <td className="py-2.5 pr-4 text-gray-500 whitespace-nowrap">{c.frequency || '—'}</td>
              <td className="py-2.5 space-y-1">
                {c.email  && <LockedField type="email"   inline />}
                {c.website && <LockedField type="website" inline />}
                {!c.email && !c.website && <span className="text-gray-300">—</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── METAR / TAF box ───────────────────────────────────────────────────────────
function MetarBox({ icao }: { icao: string }) {
  const [metar, setMetar]       = useState<string>('');
  const [taf, setTaf]           = useState<string>('');
  const [wxLoading, setWxLoading] = useState(true);
  const [wxError, setWxError]   = useState('');
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!icao) return;
    setWxLoading(true);
    setWxError('');
    fetch(`/api/weather?icao=${icao}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) { setWxError(d.error); return; }
        setMetar(d.metar ?? '');
        setTaf(d.taf ?? '');
      })
      .catch(() => setWxError('Weather data unavailable'))
      .finally(() => setWxLoading(false));
  }, [icao]);

  if (wxLoading) {
    return (
      <div className="mb-6 rounded-2xl border-4 border-yellow-400 bg-yellow-400 px-5 py-4 flex items-center gap-3">
        <svg className="animate-spin w-5 h-5 text-black flex-shrink-0" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
        </svg>
        <span className="text-black font-bold text-sm">Loading live weather for {icao}…</span>
      </div>
    );
  }

  if (wxError || (!metar && !taf)) {
    return (
      <div className="mb-6 rounded-2xl border-4 border-yellow-400 bg-yellow-400 px-5 py-4">
        <p className="text-black font-bold text-sm">⚠ WEATHER UNAVAILABLE</p>
        <p className="text-black/70 text-xs mt-1">{wxError || `No METAR/TAF currently available for ${icao}`}</p>
      </div>
    );
  }

  return (
    <div className="mb-6 rounded-2xl overflow-hidden border-4 border-yellow-400 shadow-md">

      {/* ── Header bar — solid yellow ── */}
      <div className="bg-yellow-400 px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Cloud icon */}
          <svg className="w-5 h-5 text-black flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
          </svg>
          <span className="font-black text-black text-sm uppercase tracking-widest">Live Weather · {icao}</span>
        </div>
        {taf && (
          <button onClick={() => setExpanded((e) => !e)}
            className="flex items-center gap-1 text-xs font-bold text-black hover:opacity-70 transition-opacity">
            {expanded ? 'Hide TAF' : 'Show TAF'}
            <svg className={`w-3.5 h-3.5 transition-transform ${expanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        )}
      </div>

      {/* ── METAR ── */}
      <div className="bg-yellow-50 px-5 pt-4 pb-4">
        <p className="text-[10px] font-black text-black uppercase tracking-[0.2em] mb-2">
          METAR — Current Conditions
        </p>
        <p className="font-mono text-sm font-semibold text-black leading-relaxed break-words">
          {metar}
        </p>
      </div>

      {/* ── TAF collapsible ── */}
      {expanded && taf && (
        <div className="bg-yellow-100 px-5 pt-4 pb-5 border-t-2 border-yellow-400">
          <p className="text-[10px] font-black text-black uppercase tracking-[0.2em] mb-2">
            TAF — Forecast
          </p>
          <p className="font-mono text-sm font-semibold text-black leading-relaxed whitespace-pre-wrap break-words">
            {taf}
          </p>
        </div>
      )}

      {/* ── Footer ── */}
      <div className="bg-yellow-400 px-5 py-2 flex items-center justify-between">
        <p className="text-[10px] font-bold text-black/70 uppercase tracking-wide">
          Source: NOAA Aviation Weather Center · Refreshes every 20–30 min
        </p>
        {taf && !expanded && (
          <button onClick={() => setExpanded(true)}
            className="text-[10px] font-black text-black hover:opacity-70 transition-opacity">
            + TAF FORECAST ↓
          </button>
        )}
      </div>
    </div>
  );
}

export default function AirportDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [airport, setAirport] = useState<AirportRecord | null>(null);
  const [handlers, setHandlers] = useState<HandlerRecord[]>([]);
  const [fbos, setFbos] = useState<FboRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const snap = await getDoc(doc(db, 'airports', id));
        if (!snap.exists()) return;
        const airport = { id: snap.id, ...snap.data() } as AirportRecord;
        setAirport(airport);
        if (airport.icao) {
          const [hSnap, fSnap] = await Promise.all([
            getDocs(query(collection(db, 'handler'), where('handlerIcao', '==', airport.icao))),
            getDocs(query(collection(db, 'fbo'), where('fboIcao', '==', airport.icao))),
          ]);
          setHandlers(hSnap.docs.map((d) => ({ id: d.id, ...d.data() } as HandlerRecord)));
          setFbos(fSnap.docs.map((d) => ({ id: d.id, ...d.data() } as FboRecord)));
        }
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen pt-24 flex items-center justify-center bg-white">
          <div className="flex items-center gap-3 text-gray-400">
            <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            Loading airport data...
          </div>
        </main>
      </>
    );
  }

  if (!airport) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen pt-24 flex items-center justify-center bg-white">
          <div className="text-center">
            <p className="text-gray-400 mb-4">Airport not found.</p>
            <Link href="/airports" className="text-[#F34707] hover:underline text-sm">← Back to Search</Link>
          </div>
        </main>
      </>
    );
  }

  const ap = airport;
  const contactDepts: ContactDept[] = [
    { dept: 'Airport Admin',     phone: ap.airportAdminPhone,       fax: ap.airportAdminFax,       email: ap.airportAdminEmail,       website: ap.airportAdminWebsite,       frequency: ap.airportAdminFrequency },
    { dept: 'Airport Authority', phone: ap.airportAutorityPhone,    fax: ap.airportAuthorityFax,   email: ap.airportAuthorityEmail,   website: ap.airportAuthorityWebsite,   frequency: ap.airportAutorityFrequency },
    { dept: 'Airport Manager',   phone: ap.airportManagerPhone,     fax: ap.airportManagerFax,     email: ap.airportManagerEmail,     website: ap.airportManagerWebsite,     frequency: ap.airportManagerFrequency },
    { dept: 'Operations',        phone: ap.airportOperationsPhpne,  fax: ap.airportOperationsFax,  email: ap.airportOperationsEmail,  website: ap.airportOperationsWebsite,  frequency: ap.airportOperationsFrequency },
    { dept: 'Information',       phone: ap.airportInfoPhone,        fax: ap.airportInformationFax, email: ap.airportInfoEmail,        website: ap.airportInformationWebsite, frequency: ap.airportInformationFrequency },
    { dept: 'ATC',               phone: ap.atcPhone,                fax: ap.atcFax,                email: ap.atcEmail,                website: ap.atcWebsite,                frequency: ap.atcFrequency },
    { dept: 'ATIS',              phone: ap.atisPhone,               fax: ap.atisFax,               email: ap.atisEmail,               website: ap.atisWebsite,               frequency: ap.atisFrequency },
    { dept: 'ATS',               phone: ap.atsPhone,                fax: ap.atsFax,                email: ap.atsEmail,                website: ap.atsWebsite,                frequency: ap.atsFrequency },
    { dept: 'AIS',               phone: ap.aisPhone,                fax: ap.aisFax,                email: ap.aisEmail,                website: ap.aisWebsite,                frequency: ap.aisFrequency },
    { dept: 'ARO',               phone: ap.aroPhone,                fax: ap.aroFax,                email: ap.aroEmail,                website: ap.aroWebsite },
    { dept: 'Tower',             phone: ap.towerPhone,              fax: ap.towerFax,              email: ap.towerEmail,              website: ap.towerWebsite,              frequency: ap.towerFrequency },
    { dept: 'Customs',           phone: ap.customsPhone,            fax: ap.customsFax,            email: ap.customsEmail,            website: ap.customsWebsite },
    { dept: 'Immigration',       phone: ap.immigrationPhpne,        fax: ap.immigrationFax,        email: ap.immigrationEmail,        website: ap.immigrationWebsite },
    { dept: 'PPR',               phone: ap.pprPhone,                fax: ap.pprFax,                email: ap.pprEmail,                website: ap.pprWebsite,                frequency: ap.pprFrequency },
    { dept: 'Slot Request',      phone: ap.slotRequestPhpne,        fax: ap.slotRequestFax,        email: ap.slotRequestEmail,        website: ap.slotRequestWebsite,        frequency: ap.slotRequestFrequency },
    { dept: 'Flight Plan',       phone: ap.flightPlanPhone,                                        email: ap.flightPlanEmail,         website: ap.flightPlanWebsite,         frequency: ap.flightPlanFrequency },
    { dept: 'MET',               phone: ap.metPhone,                fax: ap.metFax,                email: ap.metEmail,                website: ap.metWebsite,                frequency: ap.metFrequcny },
    { dept: 'CAA',               phone: ap.caaPhone,                fax: ap.caaFax,                email: ap.caaEmail,                website: ap.caaWebsite },
    { dept: 'DSA',               phone: ap.dsaPhone,                fax: ap.dsaFax,                email: ap.dsaEmail,                website: ap.dsaWebsite },
    { dept: 'Military Base',     phone: ap.militaryBasePhone,       fax: ap.militaryBaseFax,       email: ap.militaryBaseEmail,       website: ap.militaryBaseWebsite },
    { dept: 'Austro Control',    phone: ap.austroControlPhone,      fax: ap.austroControlFax,      email: ap.austroControlEmail,      website: ap.austroControlWebsite },
  ];

  const airportDiagram = airport.airportDiagram;
  const hasAirportEmail   = !!(ap.airportEmail);
  const hasAirportWebsite = !!(ap.airportWebsite);
  const hasAipWeb         = !!(ap.aipWeb);

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 pb-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto">

          {/* Back */}
          <Link href="/airports" className="inline-flex items-center gap-2 text-gray-400 hover:text-gray-700 text-sm mb-8 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Search
          </Link>

          {/* Airport diagram */}
          {airportDiagram && (
            <div className="mb-4">
              <a href={airportDiagram} target="_blank" rel="noopener noreferrer">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={airportDiagram}
                  alt={`${airport.name} airport diagram`}
                  className="w-full rounded-2xl border border-gray-200 shadow-md object-contain max-h-[500px] hover:shadow-lg transition-shadow"
                />
              </a>
              <p className="text-gray-400 text-xs mt-2 text-center mb-4">Click to open full-size diagram</p>
            </div>
          )}

          {/* METAR / TAF live weather */}
          {airport.icao && <MetarBox icao={airport.icao} />}

          {/* Airport header */}
          <div className="mb-8">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              {airport.icao && (
                <span className="px-3 py-1 rounded-lg bg-[#F34707]/10 text-[#F34707] text-sm font-mono font-bold">{airport.icao}</span>
              )}
              {airport.iata && (
                <span className="px-3 py-1 rounded-lg bg-gray-100 text-gray-500 text-sm font-mono">{airport.iata}</span>
              )}
              {airport.faa && (
                <span className="px-3 py-1 rounded-lg bg-gray-100 text-gray-500 text-sm font-mono">FAA: {airport.faa}</span>
              )}
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-1">{airport.name}</h1>
            {airport.locatedIn && (
              <p className="text-gray-400 text-sm">{airport.locatedIn}</p>
            )}
          </div>

          {/* Operational Info */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 mb-6 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Operational Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
              <div>
                <InfoRow label="Latitude" value={airport.latitude} />
                <InfoRow label="Longitude" value={airport.longitud} />
                <InfoRow label="Elevation (ft)" value={airport.elevationFt} />
                <InfoRow label="Longest Hard Surface Rwy" value={airport.longestHardSurfaceRwy} />
                <InfoRow label="Runway Surface" value={airport.runwaySurface} />
                <InfoRow label="PCN" value={airport.pcn} />
                <InfoRow label="Approaches" value={airport.approaches} />
                <InfoRow label="Fuel Available" value={airport.fuelAvailable} />
                <InfoRow label="Slot Required" value={airport.slotRequired} />
                <InfoRow label="Airport Type" value={airport.aptType} />
              </div>
              <div>
                <InfoRow label="Airport of Entry" value={airport.airportOfEntry} />
                <InfoRow label="Fire Category" value={airport.fireCategory} />
                <InfoRow label="Customs" value={airport.customs} />
                <InfoRow label="Handling Mandatory" value={airport.handlingMandatory} />
                <InfoRow label="Light Intensity" value={airport.aptLightIntensity} />
                <InfoRow label="Open 24 Hours" value={airport.open24Hours} />
                <InfoRow label="Control Tower Hours" value={airport.controlTowerHours} />
                <InfoRow label="Airport Hours" value={airport.airportHours} />
                <InfoRow label="Sunrise" value={airport.sunrise} />
                <InfoRow label="Sunset" value={airport.sunset} />
              </div>
            </div>

            {/* Airport-level locked fields */}
            {(hasAirportEmail || hasAirportWebsite || hasAipWeb) && (
              <div className="mt-2 pt-2 border-t border-gray-100 space-y-0">
                {hasAirportEmail   && (
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 py-3 border-b border-gray-100">
                    <span className="text-gray-400 text-xs uppercase tracking-wider w-52 flex-shrink-0">Airport Email</span>
                    <LockedField type="email" />
                  </div>
                )}
                {hasAirportWebsite && (
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 py-3 border-b border-gray-100">
                    <span className="text-gray-400 text-xs uppercase tracking-wider w-52 flex-shrink-0">Airport Website</span>
                    <LockedField type="website" />
                  </div>
                )}
                {hasAipWeb && (
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 py-3">
                    <span className="text-gray-400 text-xs uppercase tracking-wider w-52 flex-shrink-0">AIP Web</span>
                    <LockedField type="website" />
                  </div>
                )}
              </div>
            )}

            {airport.airportGeneralRemarks && (
              <div className="pt-3 border-t border-gray-100 mt-2">
                <span className="text-gray-400 text-xs uppercase tracking-wider block mb-2">General Remarks</span>
                <p className="text-gray-700 text-sm leading-relaxed">{airport.airportGeneralRemarks}</p>
              </div>
            )}
          </div>

          {/* Contact Table */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 mb-6 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Contacts & Frequencies</h2>
            <ContactTable contacts={contactDepts} />
          </div>

          {/* Handlers */}
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Ground Handlers {handlers.length > 0 && <span className="text-gray-400 font-normal text-base ml-1">({handlers.length})</span>}
            </h2>
            {handlers.length === 0 ? (
              <div className="rounded-2xl border border-gray-200 p-6 text-center text-gray-400 text-sm">
                No handlers found for {airport.icao}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {handlers.map((h) => <HandlerCard key={h.id} handler={h} />)}
              </div>
            )}
          </div>

          {/* FBOs */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              FBOs {fbos.length > 0 && <span className="text-gray-400 font-normal text-base ml-1">({fbos.length})</span>}
            </h2>
            {fbos.length === 0 ? (
              <div className="rounded-2xl border border-gray-200 p-6 text-center text-gray-400 text-sm">
                No FBOs found for {airport.icao}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {fbos.map((f) => <FboCard key={f.id} fbo={f} />)}
              </div>
            )}
          </div>

        </div>
      </main>
      <Footer />
    </>
  );
}

function HandlerCard({ handler: h }: { handler: HandlerRecord }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 hover:border-[#F34707]/40 hover:shadow-md transition-all shadow-sm">
      <div className="flex items-start gap-3 mb-4">
        {h.handlerLogoImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={h.handlerLogoImage} alt={h.handlerName}
            className="w-12 h-12 rounded-lg object-contain bg-gray-100 p-1 flex-shrink-0" />
        ) : (
          <div className="w-12 h-12 rounded-lg bg-[#F34707]/10 flex items-center justify-center text-[#F34707] flex-shrink-0 p-2">
            <IhIcon name="handler" className="w-full h-full" />
          </div>
        )}
        <div>
          <h3 className="text-gray-900 font-semibold">{h.handlerName}</h3>
          <p className="text-gray-400 text-xs">{[h.handlerCity, h.handlerState, h.handlerCountry].filter(Boolean).join(', ')}</p>
        </div>
      </div>
      <div className="space-y-1.5 text-sm">
        {h.handlerPhone            && <p className="text-gray-600">📞 {h.handlerPhone}</p>}
        {h.handlerAfterHoursPhone  && <p className="text-gray-600">🌙 After hours: {h.handlerAfterHoursPhone}</p>}
        {h.handlerTollFreePhone    && <p className="text-gray-600">📞 Toll-free: {h.handlerTollFreePhone}</p>}
        {h.handlerEmail            && <LockedField type="email" />}
        {h.handlerWebsite          && <LockedField type="website" />}
        {h.handlerPoc              && <p className="text-gray-400 text-xs mt-2">Contact: {h.handlerPoc}{h.handlerPocTitle ? ` — ${h.handlerPocTitle}` : ''}</p>}
        {h.handlerWhatsapp         && <p className="text-gray-400 text-xs">WhatsApp: {h.handlerWhatsapp}</p>}
      </div>
      {h.handlerSvcsCategories && h.handlerSvcsCategories.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1">
          {h.handlerSvcsCategories.map((s) => (
            <span key={s} className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 text-xs">{s}</span>
          ))}
        </div>
      )}
    </div>
  );
}

function FboCard({ fbo: f }: { fbo: FboRecord }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 hover:border-[#F34707]/40 hover:shadow-md transition-all shadow-sm">
      <div className="flex items-start gap-3 mb-4">
        {f.fboLogo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={f.fboLogo} alt={f.fboName}
            className="w-12 h-12 rounded-lg object-contain bg-gray-100 p-1 flex-shrink-0" />
        ) : (
          <div className="w-12 h-12 rounded-lg bg-[#F34707]/10 flex items-center justify-center text-[#F34707] flex-shrink-0 p-2">
            <IhIcon name="fbo" className="w-full h-full" />
          </div>
        )}
        <div>
          <h3 className="text-gray-900 font-semibold">{f.fboName}</h3>
          <p className="text-gray-400 text-xs">{[f.fboCity, f.fboState, f.fboCountry].filter(Boolean).join(', ')}</p>
        </div>
      </div>
      <div className="space-y-1.5 text-sm">
        {f.fboPhne             && <p className="text-gray-600">📞 {f.fboPhne}</p>}
        {f.fboAfterHoursPhone  && <p className="text-gray-600">🌙 After hours: {f.fboAfterHoursPhone}</p>}
        {f.fboTollFreePhone    && <p className="text-gray-600">📞 Toll-free: {f.fboTollFreePhone}</p>}
        {f.fboEmail            && <LockedField type="email" />}
        {f.fboWebsite          && <LockedField type="website" />}
        {f.fboPocName          && <p className="text-gray-400 text-xs mt-2">Contact: {f.fboPocName}{f.fboPocTitle ? ` — ${f.fboPocTitle}` : ''}</p>}
        {f.fboWhatsapp         && <p className="text-gray-400 text-xs">WhatsApp: {f.fboWhatsapp}</p>}
      </div>
      {f.fboServiceCategories && f.fboServiceCategories.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1">
          {f.fboServiceCategories.map((s) => (
            <span key={s} className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 text-xs">{s}</span>
          ))}
        </div>
      )}
    </div>
  );
}
