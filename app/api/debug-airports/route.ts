import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q') || 'KJFK';

  const clientConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? '✓ set' : '✗ MISSING',
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '✗ MISSING',
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '✗ MISSING',
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '✗ MISSING',
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '✗ MISSING',
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ? '✓ set' : '✗ MISSING',
  };
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'NOT SET';

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
      clientConfig,
      adminProjectId: projectId,
      sampleCount: countSnap.size,
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
