'use client';

import { useState } from 'react';
import { collection, query, getDocs, orderBy, startAt, endAt } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { AirportRecord } from '@/lib/types';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function AirportsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<AirportRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const upper = searchTerm.trim().toUpperCase();
      const nameRaw = searchTerm.trim();
      const hi = '';
      const [icaoSnap, iataSnap, nameSnap] = await Promise.all([
        getDocs(query(collection(db, 'airports'), orderBy('icao'), startAt(upper), endAt(upper + hi))),
        getDocs(query(collection(db, 'airports'), orderBy('iata'), startAt(upper), endAt(upper + hi))),
        getDocs(query(collection(db, 'airports'), orderBy('name'), startAt(nameRaw), endAt(nameRaw + hi))),
      ]);
      const seen = new Set<string>();
      const merged: AirportRecord[] = [];
      for (const snap of [icaoSnap, iataSnap, nameSnap]) {
        for (const d of snap.docs) {
          if (!seen.has(d.id)) { seen.add(d.id); merged.push({ id: d.id, ...d.data() } as AirportRecord); }
        }
      }
      setResults(merged);
    } catch (err) { console.error('Search error:', err); }
    finally { setLoading(false); }
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 pb-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Worldwide Gateway for{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F34707] to-[#FC8C00]">
                Aviation Services
              </span>
            </h1>
            <p className="text-gray-500 text-lg">Search by ICAO code, IATA code, or airport name</p>
          </div>

          <form onSubmit={handleSearch} className="flex gap-3 mb-10">
            <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Enter ICAO, IATA or Airport name (e.g. KJFK, JFK, Kennedy)"
              className="flex-1 px-4 py-3 rounded-xl bg-white border border-gray-300 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#F34707] focus:ring-2 focus:ring-[#F34707]/20 transition-all text-sm" />
            <button type="submit" disabled={loading}
              className="px-6 py-3 rounded-xl bg-[#F34707] hover:bg-[#d93d06] text-white font-semibold text-sm transition-colors flex items-center gap-2 disabled:opacity-50 shadow-md">
              {loading ? (
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                </svg>
              )}
              Search
            </button>
          </form>

          {searched && (
            <div className="rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
              {results.length === 0 ? (
                <div className="p-12 text-center text-gray-400">No results found for &quot;{searchTerm}&quot;</div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">ICAO</th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">IATA</th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((airport, i) => (
                      <tr key={airport.id} className={`border-b border-gray-100 hover:bg-orange-50 transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                        <td className="px-6 py-4 text-sm font-mono text-[#F34707] font-bold">{airport.icao || '—'}</td>
                        <td className="px-6 py-4 text-sm font-mono text-gray-500">{airport.iata || '—'}</td>
                        <td className="px-6 py-4 text-sm text-gray-900 font-medium">{airport.name}</td>
                        <td className="px-6 py-4 text-right">
                          <Link href={`/airports/${airport.id}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F34707] hover:bg-[#d93d06] text-white text-xs font-semibold transition-colors">
                            View
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {!searched && (
            <div className="text-center py-16 text-gray-300">
              <svg className="w-16 h-16 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
              </svg>
              <p className="text-gray-400">Enter a search term above to find airports</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
