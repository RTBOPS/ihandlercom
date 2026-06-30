import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

const ALLOWED_COLS = ['carRental', 'catering', 'hotel'] as const;
type Col = typeof ALLOWED_COLS[number];

async function verifyAndGetIcao(req: NextRequest): Promise<{ uid: string; icao: string } | null> {
  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) return null;
  const decoded = await getAdminAuth().verifyIdToken(token);
  const uid = decoded.uid;
  const db = getAdminDb();
  const snap = await db.collection('users').doc(uid).get();
  if (!snap.exists) return null;
  return { uid, icao: snap.data()!.icao as string };
}

// GET /api/portal/services?col=carRental
export async function GET(req: NextRequest) {
  try {
    const col = req.nextUrl.searchParams.get('col') as Col;
    if (!ALLOWED_COLS.includes(col)) return NextResponse.json({ error: 'Invalid collection' }, { status: 400 });

    const ctx = await verifyAndGetIcao(req);
    if (!ctx) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const db = getAdminDb();
    const snap = await db.collection(col).where('icao', '==', ctx.icao).get();
    const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    return NextResponse.json({ docs });
  } catch (err) {
    console.error('services GET error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/portal/services  — create new record
export async function POST(req: NextRequest) {
  try {
    const ctx = await verifyAndGetIcao(req);
    if (!ctx) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { col, fields } = await req.json() as { col: Col; fields: Record<string, unknown> };
    if (!ALLOWED_COLS.includes(col)) return NextResponse.json({ error: 'Invalid collection' }, { status: 400 });

    const db = getAdminDb();
    const ref = await db.collection(col).add({
      ...fields,
      icao: ctx.icao,
      updatedBy: ctx.uid,
      updatedAt: FieldValue.serverTimestamp(),
    });
    return NextResponse.json({ id: ref.id });
  } catch (err) {
    console.error('services POST error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/portal/services  — update existing record
export async function PATCH(req: NextRequest) {
  try {
    const ctx = await verifyAndGetIcao(req);
    if (!ctx) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { col, docId, fields } = await req.json() as { col: Col; docId: string; fields: Record<string, unknown> };
    if (!ALLOWED_COLS.includes(col)) return NextResponse.json({ error: 'Invalid collection' }, { status: 400 });

    const db = getAdminDb();
    // Verify the doc belongs to this icao before updating
    const existing = await db.collection(col).doc(docId).get();
    if (!existing.exists || existing.data()!.icao !== ctx.icao) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    await db.collection(col).doc(docId).update({
      ...fields,
      updatedBy: ctx.uid,
      updatedAt: FieldValue.serverTimestamp(),
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('services PATCH error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
