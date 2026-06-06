'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { AirportRecord, HandlerRecord, FboRecord } from '@/lib/types';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

function InfoRow({ label, value }: { label: string; value?: string | number | null }) {
  if (value === undefined || value === null || value === '') return null;
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-1 py-3 border-b border-white/5 last:border-0">
      <span className="text-white/40 text-xs uppercase tracking-wider w-52 flex-shrink-0 pt-0.5">{label}</span>
      <span className="text-white/90 text-sm">{String(value)}</span>
    </div>
  );
}

function LinkRow({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-1 py-3 border-b border-white/5 last:border-0">
      <span className="text-white/40 text-xs uppercase tracking-wider w-52 flex-shrink-0 pt-0.5">{label}</span>
      <a href={value.startsWith('http') ? value : `https://${value}`} target="_blank" rel="noopener noreferrer"
        className="text-[#F34707] hover:text-[#FC8C00] text-sm transition-colors truncate">{value}</a>
    </div>
  );
}

function EmailRow({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-1 py-3 border-b border-white/5 last:border-0">
      <span className="text-white/40 text-xs uppercase tracking-wider w-52 flex-shrink-0 pt-0.5">{label}</span>
      <a href={`mailto:${value}`} className="text-[#F34707] hover:text-[#FC8C00] text-sm transition-colors">{value}</a>
    </div>
  );
}

// Phone contact table row
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
          <tr className="border-b border-white/10">
            <th className="text-left py-2 pr-4 text-xs text-white/40 uppercase tracking-wider font-medium">Department</th>
            <th className="text-left py-2 pr-4 text-xs text-white/40 uppercase tracking-wider font-medium">Phone</th>
            <th className="text-left py-2 pr-4 text-xs text-white/40 uppercase tracking-wider font-medium">Fax</th>
            <th className="text-left py-2 pr-4 text-xs text-white/40 uppercase tracking-wider font-medium">Frequency</th>
            <th className="text-left py-2 text-xs text-white/40 uppercase tracking-wider font-medium">Email / Website</th>
          </tr>
        </thead>
        <tbody>
          {visible.map((c) => (
            <tr key={c.dept} className="border-b border-white/5 hover:bg-white/[0.02]">
              <td className="py-2.5 pr-4 text-white/80 font-medium whitespace-nowrap">{c.dept}</td>
              <td className="py-2.5 pr-4 text-white/60 whitespace-nowrap">{c.phone || '—'}</td>
              <td className="py-2.5 pr-4 text-white/60 whitespace-nowrap">{c.fax || '—'}</td>
              <td className="py-2.5 pr-4 text-white/60 whitespace-nowrap">{c.frequency || '—'}</td>
              <td className="py-2.5">
                {c.email && <a href={`mailto:${c.email}`} className="text-[#F34707] hover:text-[#FC8C00] block text-xs transition-colors">{c.email}</a>}
                {c.website && <a href={c.website.startsWith('http') ? c.website : `https://${c.website}`} target="_blank" rel="noopener noreferrer" className="text-[#F34707]/70 hover:text-[#FC8C00] block text-xs transition-colors truncate max-w-[160px]">{c.website}</a>}
                {!c.email && !c.website && <span className="text-white/30">—</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
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
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen pt-24 flex items-center justify-center">
          <div className="flex items-center gap-3 text-white/40">
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
        <main className="min-h-screen pt-24 flex items-center justify-center">
          <div className="text-center">
            <p className="text-white/40 mb-4">Airport not found.</p>
            <Link href="/airports" className="text-[#F34707] hover:underline text-sm">← Back to Search</Link>
          </div>
        </main>
      </>
    );
  }

  // Build contact departments table
  const a = airport as AirportRecord & Record<string, string>;
  const contactDepts: ContactDept[] = [
    { dept: 'Airport Admin',    phone: a.airportAdminPhone,    fax: a.airportAdminFax,    email: a.airportAdminEmail,    website: a.airportAdminWebsite },
    { dept: 'Airport Authority',phone: a.airportAutorityPhone || (a as Record<string,string>).airportAuthorityPhone, fax: a.airportAuthorityFax, email: a.airportAuthorityEmail, website: a.airportAuthorityWebsite, frequency: (a as Record<string,string>).airportAutorityFrequency },
    { dept: 'Airport Manager',  phone: a.airportManagerPhone,  fax: a.airportManagerFax,  email: a.airportManagerEmail,  website: a.airportManagerWebsite, frequency: (a as Record<string,string>).airportManagerFrequency },
    { dept: 'Operations',       phone: a.airportOperationsPhpne, fax: a.airportOperationsFax, email: a.airportOperationsEmail, website: a.airportOperationsWebsite, frequency: (a as Record<string,string>).airportOperationsFrequency },
    { dept: 'Information',      phone: a.airportInfoPhone,     fax: a.airportInformationFax, email: a.airportInfoEmail, website: a.airportInformationWebsite, frequency: (a as Record<string,string>).airportInformationFrequency },
    { dept: 'ATC',              phone: a.atcPhone,             fax: a.atcFax,             email: a.atcEmail,             website: a.atcWebsite,    frequency: (a as Record<string,string>).atcFrequency },
    { dept: 'ATIS',             phone: a.atisPhone,            fax: a.atisFax,            email: a.atisEmail,            website: a.atisWebsite,   frequency: (a as Record<string,string>).atisFrequency },
    { dept: 'ATS',              phone: a.atsPhone,             fax: a.atsFax,             email: a.atsEmail,             website: a.atsWebsite,    frequency: (a as Record<string,string>).atsFrequency },
    { dept: 'AIS',              phone: a.aisPhone,             fax: a.aisFax,             email: a.aisEmail,             website: a.aisWebsite,    frequency: (a as Record<string,string>).aisFrequency },
    { dept: 'ARO',              phone: a.aroPhone,             fax: a.aroFax,             email: a.aroEmail,             website: a.aroWebsite },
    { dept: 'Tower',            phone: (a as Record<string,string>).towerPhone, fax: (a as Record<string,string>).towerFax, email: (a as Record<string,string>).towerEmail, website: (a as Record<string,string>).towerWebsite, frequency: (a as Record<string,string>).towerFrequency },
    { dept: 'Customs',          phone: (a as Record<string,string>).customsPhone, fax: (a as Record<string,string>).customsFax, email: (a as Record<string,string>).customsEmail, website: (a as Record<string,string>).customsWebsite },
    { dept: 'Immigration',      phone: (a as Record<string,string>).immigrationPhpne, fax: (a as Record<string,string>).immigrationFax, email: (a as Record<string,string>).immigrationEmail, website: (a as Record<string,string>).immigrationWebsite },
    { dept: 'PPR',              phone: (a as Record<string,string>).pprPhone, fax: (a as Record<string,string>).pprFax, email: (a as Record<string,string>).pprEmail, website: (a as Record<string,string>).pprWebsite, frequency: (a as Record<string,string>).pprFrequency },
    { dept: 'Slot Request',     phone: (a as Record<string,string>).slotRequestPhpne, fax: (a as Record<string,string>).slotRequestFax, email: (a as Record<string,string>).slotRequestEmail, website: (a as Record<string,string>).slotRequestWebsite, frequency: (a as Record<string,string>).slotRequestFrequency },
    { dept: 'Flight Plan',      phone: (a as Record<string,string>).flightPlanPhone, email: (a as Record<string,string>).flightPlanEmail, website: (a as Record<string,string>).flightPlanWebsite, frequency: (a as Record<string,string>).flightPlanFrequency },
    { dept: 'MET',              phone: (a as Record<string,string>).metPhone, fax: (a as Record<string,string>).metFax, email: (a as Record<string,string>).metEmail, website: (a as Record<string,string>).metWebsite, frequency: (a as Record<string,string>).metFrequcny },
    { dept: 'CAA',              phone: (a as Record<string,string>).caaPhone, fax: (a as Record<string,string>).caaFax, email: (a as Record<string,string>).caaEmail, website: (a as Record<string,string>).caaWebsite },
    { dept: 'DSA',              phone: (a as Record<string,string>).dsaPhone, fax: (a as Record<string,string>).dsaFax, email: (a as Record<string,string>).dsaEmail, website: (a as Record<string,string>).dsaWebsite },
    { dept: 'Military Base',    phone: (a as Record<string,string>).militaryBasePhone, fax: (a as Record<string,string>).militaryBaseFax, email: (a as Record<string,string>).militaryBaseEmail, website: (a as Record<string,string>).militaryBaseWebsite },
    { dept: 'Austro Control',   phone: a.austroControlPhone,   fax: (a as Record<string,string>).austroControlFax, email: (a as Record<string,string>).austroControlEmail, website: (a as Record<string,string>).austroControlWebsite },
  ];

  const airportDiagram = (airport as Record<string, string>).airportDiagram;

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 pb-20 px-4">
        <div className="max-w-5xl mx-auto">

          {/* Back */}
          <Link href="/airports" className="inline-flex items-center gap-2 text-white/40 hover:text-white text-sm mb-8 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Search
          </Link>

          {/* Airport header */}
          <div className="mb-8 flex flex-col lg:flex-row lg:items-start gap-6">
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                {airport.icao && (
                  <span className="px-3 py-1 rounded-lg bg-[#F34707]/20 text-[#F34707] text-sm font-mono font-bold">{airport.icao}</span>
                )}
                {airport.iata && (
                  <span className="px-3 py-1 rounded-lg bg-white/10 text-white/60 text-sm font-mono">{airport.iata}</span>
                )}
                {(airport as Record<string,string>).faa && (
                  <span className="px-3 py-1 rounded-lg bg-white/10 text-white/60 text-sm font-mono">FAA: {(airport as Record<string,string>).faa}</span>
                )}
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-1">{airport.name}</h1>
              {(airport as Record<string,string>).locatedIn && (
                <p className="text-white/40 text-sm">{(airport as Record<string,string>).locatedIn}</p>
              )}
            </div>

            {/* Airport diagram / image */}
            {airportDiagram && (
              <div className="lg:w-72 flex-shrink-0">
                <a href={airportDiagram} target="_blank" rel="noopener noreferrer">
                  <Image
                    src={airportDiagram}
                    alt={`${airport.name} diagram`}
                    width={288}
                    height={200}
                    className="w-full h-48 object-cover rounded-2xl border border-white/10 hover:border-[#F34707]/50 transition-colors"
                  />
                </a>
                <p className="text-white/30 text-xs mt-1 text-center">Click to enlarge</p>
              </div>
            )}
          </div>

          {/* Operational Info */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 mb-6">
            <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-4">Operational Information</h2>
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
            <EmailRow label="Airport Email" value={airport.airportEmail} />
            <LinkRow label="Airport Website" value={airport.airportWebsite} />
            <LinkRow label="AIP Web" value={airport.aipWeb} />
            {airport.airportGeneralRemarks && (
              <div className="pt-3">
                <span className="text-white/40 text-xs uppercase tracking-wider block mb-2">General Remarks</span>
                <p className="text-white/80 text-sm leading-relaxed">{airport.airportGeneralRemarks}</p>
              </div>
            )}
          </div>

          {/* Phone / Contact Table */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 mb-6">
            <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-4">Contacts & Frequencies</h2>
            <ContactTable contacts={contactDepts} />
          </div>

          {/* Handlers */}
          <div className="mb-6">
            <h2 className="text-xl font-bold text-white mb-4">
              Ground Handlers {handlers.length > 0 && <span className="text-white/40 font-normal text-base ml-1">({handlers.length})</span>}
            </h2>
            {handlers.length === 0 ? (
              <div className="rounded-2xl border border-white/10 p-6 text-center text-white/30 text-sm">
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
            <h2 className="text-xl font-bold text-white mb-4">
              FBOs {fbos.length > 0 && <span className="text-white/40 font-normal text-base ml-1">({fbos.length})</span>}
            </h2>
            {fbos.length === 0 ? (
              <div className="rounded-2xl border border-white/10 p-6 text-center text-white/30 text-sm">
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
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 hover:border-[#F34707]/40 transition-colors">
      <div className="flex items-start gap-3 mb-4">
        {h.handlerLogoImage ? (
          <Image src={h.handlerLogoImage} alt={h.handlerName} width={48} height={48}
            className="w-12 h-12 rounded-lg object-contain bg-white/10 p-1 flex-shrink-0" />
        ) : (
          <div className="w-12 h-12 rounded-lg bg-[#F34707]/10 flex items-center justify-center text-[#F34707] text-xl flex-shrink-0">✈</div>
        )}
        <div>
          <h3 className="text-white font-semibold">{h.handlerName}</h3>
          <p className="text-white/40 text-xs">{[h.handlerCity, h.handlerState, h.handlerCountry].filter(Boolean).join(', ')}</p>
        </div>
      </div>

      <div className="space-y-1.5 text-sm">
        {h.handlerPhone && <p className="text-white/60">📞 {h.handlerPhone}</p>}
        {h.handlerAfterHoursPhone && <p className="text-white/60">🌙 After hours: {h.handlerAfterHoursPhone}</p>}
        {h.handlerTollFreePhone && <p className="text-white/60">📞 Toll-free: {h.handlerTollFreePhone}</p>}
        {h.handlerEmail && <a href={`mailto:${h.handlerEmail}`} className="text-[#F34707] hover:text-[#FC8C00] transition-colors block">✉ {h.handlerEmail}</a>}
        {h.handlerWebsite && <a href={h.handlerWebsite.startsWith('http') ? h.handlerWebsite : `https://${h.handlerWebsite}`} target="_blank" rel="noopener noreferrer" className="text-[#F34707]/70 hover:text-[#FC8C00] transition-colors block text-xs">🌐 {h.handlerWebsite}</a>}
        {h.handlerPoc && <p className="text-white/50 text-xs mt-2">Contact: {h.handlerPoc}{h.handlerPocTitle ? ` — ${h.handlerPocTitle}` : ''}</p>}
        {h.handlerWhatsapp && <p className="text-white/50 text-xs">WhatsApp: {h.handlerWhatsapp}</p>}
      </div>

      {h.handlerSvcsCategories && h.handlerSvcsCategories.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1">
          {h.handlerSvcsCategories.map((s) => (
            <span key={s} className="px-2 py-0.5 rounded-full bg-white/10 text-white/50 text-xs">{s}</span>
          ))}
        </div>
      )}
    </div>
  );
}

function FboCard({ fbo: f }: { fbo: FboRecord }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 hover:border-[#F34707]/40 transition-colors">
      <div className="flex items-start gap-3 mb-4">
        {f.fboLogo ? (
          <Image src={f.fboLogo} alt={f.fboName} width={48} height={48}
            className="w-12 h-12 rounded-lg object-contain bg-white/10 p-1 flex-shrink-0" />
        ) : (
          <div className="w-12 h-12 rounded-lg bg-[#F34707]/10 flex items-center justify-center text-[#F34707] text-xl flex-shrink-0">🏢</div>
        )}
        <div>
          <h3 className="text-white font-semibold">{f.fboName}</h3>
          <p className="text-white/40 text-xs">{[f.fboCity, f.fboState, f.fboCountry].filter(Boolean).join(', ')}</p>
        </div>
      </div>

      <div className="space-y-1.5 text-sm">
        {f.fboPhne && <p className="text-white/60">📞 {f.fboPhne}</p>}
        {f.fboAfterHoursPhone && <p className="text-white/60">🌙 After hours: {f.fboAfterHoursPhone}</p>}
        {f.fboEmail && <a href={`mailto:${f.fboEmail}`} className="text-[#F34707] hover:text-[#FC8C00] transition-colors block">✉ {f.fboEmail}</a>}
        {f.fboWebsite && <a href={f.fboWebsite.startsWith('http') ? f.fboWebsite : `https://${f.fboWebsite}`} target="_blank" rel="noopener noreferrer" className="text-[#F34707]/70 hover:text-[#FC8C00] transition-colors block text-xs">🌐 {f.fboWebsite}</a>}
        {f.fboPocName && <p className="text-white/50 text-xs mt-2">Contact: {f.fboPocName}{f.fboPocTitle ? ` — ${f.fboPocTitle}` : ''}</p>}
        {f.fboWhatsapp && <p className="text-white/50 text-xs">WhatsApp: {f.fboWhatsapp}</p>}
      </div>

      {f.fboServiceCategories && f.fboServiceCategories.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1">
          {f.fboServiceCategories.map((s) => (
            <span key={s} className="px-2 py-0.5 rounded-full bg-white/10 text-white/50 text-xs">{s}</span>
          ))}
        </div>
      )}
    </div>
  );
}
