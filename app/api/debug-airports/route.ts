import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q') || 'KJFK';

  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'NOT SET';

  try {
    const upper = q.trim().toUpperCase();
    const hi = '';

    const adminDb = getAdminDb();

    // Try a simple collection read first
    const countSnap = await adminDb.collection('airports').limit(3).get();
    const sampleDocs = countSnap.docs.map(d => ({ id: d.id, ...d.data() }));

    // Try prefix query on icao
    let icaoResults: object[] = [];
    try {
      const icaoSnap = await adminDb
        .collection('airports')
        .orderBy('icao')
        .startAt(upper)
        .endAt(upper + hi)
        .limit(5)
        .get();
      icaoResults = icaoSnap.docs.map(d => ({ id: d.id, icao: d.get('icao'), name: d.get('name') }));
    } catch (e) {
      icaoResults = [{ error: String(e) }];
    }

    return NextResponse.json({
      projectId,
      sampleCount: countSnap.size,
      sampleDocs,
      query: upper,
      icaoResults,
    });
  } catch (err) {
    return NextResponse.json({
      projectId,
      error: String(err),
      stack: err instanceof Error ? err.stack : undefined,
    }, { status: 500 });
  }
}
