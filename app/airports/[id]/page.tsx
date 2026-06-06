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
  if (!value) return null;
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-1 py-3 border-b border-white/5">
      <span className="text-white/40 text-xs uppercase tracking-wider w-48 flex-shrink-0 pt-0.5">{label}</span>
      <span className="text-white/90 text-sm">{String(value)}</span>
    </div>
  );
}

function LinkRow({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-1 py-3 border-b border-white/5">
      <span className="text-white/40 text-xs uppercase tracking-wider w-48 flex-shrink-0 pt-0.5">{label}</span>
      <a href={value.startsWith('http') ? value : `https://${value}`} target="_blank" rel="noopener noreferrer"
        className="text-[#F34707] hover:text-[#FC8C00] text-sm transition-colors truncate">
        {value}
      </a>
    </div>
  );
}

function EmailRow({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-1 py-3 border-b border-white/5">
      <span className="text-white/40 text-xs uppercase tracking-wider w-48 flex-shrink-0 pt-0.5">{label}</span>
      <a href={`mailto:${value}`} className="text-[#F34707] hover:text-[#FC8C00] text-sm transition-colors">{value}</a>
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
        if (snap.exists()) {
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
          <div className="text-white/40">Loading airport data...</div>
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

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 pb-20 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Back */}
          <Link href="/airports" className="inline-flex items-center gap-2 text-white/40 hover:text-white text-sm mb-8 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Search
          </Link>

          {/* Airport header */}
          <div className="mb-8">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              {airport.icao && (
                <span className="px-3 py-1 rounded-lg bg-[#F34707]/20 text-[#F34707] text-sm font-mono font-bold">
                  {airport.icao}
                </span>
              )}
              {airport.iata && (
                <span className="px-3 py-1 rounded-lg bg-white/10 text-white/60 text-sm font-mono">
                  {airport.iata}
                </span>
              )}
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white">{airport.name}</h1>
          </div>

          {/* Operational Info */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 mb-6">
            <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-4">Operational Information</h2>
            <InfoRow label="Located In" value={airport.airportDistanceFromCity} />
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
            <EmailRow label="Airport Email" value={airport.airportEmail} />
            <LinkRow label="Airport Website" value={airport.airportWebsite} />
            <LinkRow label="AIP Web" value={airport.aipWeb} />
            {airport.airportGeneralRemarks && (
              <div className="py-3 border-b border-white/5">
                <span className="text-white/40 text-xs uppercase tracking-wider block mb-2">General Remarks</span>
                <p className="text-white/80 text-sm leading-relaxed">{airport.airportGeneralRemarks}</p>
              </div>
            )}
          </div>

          {/* Contact Info */}
          {(airport.airportAdminEmail || airport.airportAuthorityEmail || airport.atcEmail || airport.atisEmail) && (
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 mb-6">
              <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-4">Contact Information</h2>
              <EmailRow label="Admin Email" value={airport.airportAdminEmail} />
              <InfoRow label="Admin Phone" value={airport.airportAdminPhone} />
              <InfoRow label="Admin Fax" value={airport.airportAdminFax} />
              <EmailRow label="Authority Email" value={airport.airportAuthorityEmail} />
              <InfoRow label="Authority Phone" value={airport.airportAuthorityPhone} />
              <EmailRow label="Manager Email" value={airport.airportManagerEmail} />
              <InfoRow label="Manager Phone" value={airport.airportManagerPhone} />
              <EmailRow label="Operations Email" value={airport.airportOperationsEmail} />
              <InfoRow label="Operations Phone" value={airport.airportOperationsPhpne} />
              <EmailRow label="Info Email" value={airport.airportInfoEmail} />
              <InfoRow label="Info Phone" value={airport.airportInfoPhone} />
              <EmailRow label="ATC Email" value={airport.atcEmail} />
              <InfoRow label="ATC Phone" value={airport.atcPhone} />
              <EmailRow label="ATIS Email" value={airport.atisEmail} />
              <InfoRow label="ATIS Phone" value={airport.atisPhone} />
              <EmailRow label="ATS Email" value={airport.atsEmail} />
              <InfoRow label="ATS Phone" value={airport.atsPhone} />
              <EmailRow label="AIS Email" value={airport.aisEmail} />
              <InfoRow label="AIS Phone" value={airport.aisPhone} />
              <InfoRow label="AFTN" value={airport.asfAftn} />
            </div>
          )}

          {/* Handlers */}
          {handlers.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xl font-bold text-white mb-4">
                Ground Handlers ({handlers.length})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {handlers.map((h) => (
                  <div key={h.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 hover:border-[#F34707]/40 transition-colors">
                    <div className="flex items-start gap-3 mb-3">
                      {h.handlerLogoImage ? (
                        <Image src={h.handlerLogoImage} alt={h.handlerName} width={48} height={48}
                          className="w-12 h-12 rounded-lg object-contain bg-white/10 p-1" />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center text-white/30 text-xl">✈</div>
                      )}
                      <div>
                        <h3 className="text-white font-semibold text-sm">{h.handlerName}</h3>
                        <p className="text-white/40 text-xs">{[h.handlerCity, h.handlerCountry].filter(Boolean).join(', ')}</p>
                      </div>
                    </div>
                    {h.handlerPhone && <p className="text-xs text-white/50 mb-1">📞 {h.handlerPhone}</p>}
                    {h.handlerEmail && (
                      <a href={`mailto:${h.handlerEmail}`} className="text-xs text-[#F34707] hover:text-[#FC8C00] transition-colors">
                        ✉ {h.handlerEmail}
                      </a>
                    )}
                    {h.handlerSvcsCategories && h.handlerSvcsCategories.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1">
                        {h.handlerSvcsCategories.slice(0, 3).map((s) => (
                          <span key={s} className="px-2 py-0.5 rounded-full bg-white/10 text-white/50 text-xs">{s}</span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* FBOs */}
          {fbos.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xl font-bold text-white mb-4">FBOs ({fbos.length})</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {fbos.map((f) => (
                  <div key={f.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 hover:border-[#F34707]/40 transition-colors">
                    <div className="flex items-start gap-3 mb-3">
                      {f.fboLogo ? (
                        <Image src={f.fboLogo} alt={f.fboName} width={48} height={48}
                          className="w-12 h-12 rounded-lg object-contain bg-white/10 p-1" />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center text-white/30 text-xl">🏢</div>
                      )}
                      <div>
                        <h3 className="text-white font-semibold text-sm">{f.fboName}</h3>
                        <p className="text-white/40 text-xs">{[f.fboCity, f.fboCountry].filter(Boolean).join(', ')}</p>
                      </div>
                    </div>
                    {f.fboPhne && <p className="text-xs text-white/50 mb-1">📞 {f.fboPhne}</p>}
                    {f.fboEmail && (
                      <a href={`mailto:${f.fboEmail}`} className="text-xs text-[#F34707] hover:text-[#FC8C00] transition-colors">
                        ✉ {f.fboEmail}
                      </a>
                    )}
                    {f.fboServiceCategories && f.fboServiceCategories.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1">
                        {f.fboServiceCategories.slice(0, 3).map((s) => (
                          <span key={s} className="px-2 py-0.5 rounded-full bg-white/10 text-white/50 text-xs">{s}</span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {handlers.length === 0 && fbos.length === 0 && (
            <div className="rounded-2xl border border-white/10 p-8 text-center text-white/30 text-sm">
              No handlers or FBOs found for this airport yet.
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
