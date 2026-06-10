import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q')?.trim();
  if (!q) return NextResponse.json({ results: [] });

  const upper = q.toUpperCase();
  const hi = '';
  const adminDb = getAdminDb();

  try {
    const [icaoSnap, iataSnap, nameSnap] = await Promise.all([
      adminDb.collection('airports').orderBy('icao').startAt(upper).endAt(upper + hi).limit(20).get(),
      adminDb.collection('airports').orderBy('iata').startAt(upper).endAt(upper + hi).limit(20).get(),
      adminDb.collection('airports').orderBy('name').startAt(upper).endAt(upper + hi).limit(20).get(),
    ]);

    const seen = new Set<string>();
    const results: object[] = [];
    for (const snap of [icaoSnap, iataSnap, nameSnap]) {
      for (const d of snap.docs) {
        if (!seen.has(d.id)) {
          seen.add(d.id);
          const data = d.data();
          results.push({
            id: d.id,
            icao: data.icao || '',
            iata: data.iata || '',
            name: data.name || '',
            country: data.country || '',
            locatedIn: data.locatedIn || '',
          });
        }
      }
    }

    return NextResponse.json({ results });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
