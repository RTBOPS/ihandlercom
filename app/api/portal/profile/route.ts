import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminDb } from '@/lib/firebase-admin';

export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = await getAdminAuth().verifyIdToken(token);
    const uid = decoded.uid;
    const db = getAdminDb();

    // Look up portal link (separate collection — never touched by the app)
    const linkSnap = await db.collection('portalLinks').doc(uid).get();
    if (!linkSnap.exists) return NextResponse.json({ error: 'No portal access linked to this account' }, { status: 403 });

    const link = linkSnap.data()!;
    const isFbo = link.companyType === 'fbo';
    const colName = isFbo ? 'fbo' : 'handler';

    // Helper: fetch one station's data from Firestore
    async function fetchStation(docId: string) {
      const snap = await db.collection(colName).doc(docId).get();
      if (!snap.exists) return null;
      const d = snap.data()!;
      return {
        docId: snap.id,
        companyName: isFbo ? d.fboName  : d.handlerName,
        email:       isFbo ? d.fboEmail : d.handlerEmail,
        icao:        isFbo ? d.fboIcao  : d.handlerIcao,
      };
    }

    // New schema: stations array
    if (Array.isArray(link.stations) && link.stations.length > 0) {
      const stationData = await Promise.all(
        link.stations.map((s: Record<string, string>) => {
          const docId = isFbo ? s.fboDocId : s.handlerDocId;
          return fetchStation(docId);
        })
      );
      const validStations = stationData.filter(Boolean) as NonNullable<Awaited<ReturnType<typeof fetchStation>>>[];
      if (validStations.length === 0) return NextResponse.json({ error: 'Company record not found' }, { status: 404 });

      const primary = validStations[0];
      return NextResponse.json({
        uid,
        companyType: link.companyType,
        // Primary station fields (backwards compat)
        docId: primary.docId,
        companyName: primary.companyName,
        email: primary.email,
        icao: primary.icao,
        // All stations (for multi-station selector)
        ...(validStations.length > 1 ? { stations: validStations } : {}),
      });
    }

    // Legacy schema: flat handlerDocId / fboDocId
    const legacyDocId = link.handlerDocId || link.fboDocId;
    if (!legacyDocId) return NextResponse.json({ error: 'Company record not found' }, { status: 404 });
    const station = await fetchStation(legacyDocId);
    if (!station) return NextResponse.json({ error: 'Company record not found' }, { status: 404 });

    return NextResponse.json({
      uid,
      companyType: link.companyType,
      docId: station.docId,
      companyName: station.companyName,
      email: station.email,
      icao: station.icao,
    });
  } catch (err) {
    console.error('portal/profile error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
