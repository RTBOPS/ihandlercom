import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

// Maps portal tab name → { collection, icaoField }
const COL_MAP = {
  carRental: { col: 'car',      icaoField: 'carIcao' },
  catering:  { col: 'catering', icaoField: 'icao'    },
  hotel:     { col: 'hotel',    icaoField: 'hotelIcao' },
} as const;

type TabName = keyof typeof COL_MAP;

// Normalize old-schema car fields to portal display fields
function normalizeDoc(tab: TabName, id: string, data: Record<string, unknown>) {
  if (tab === 'carRental') {
    return {
      id,
      companyName: data.carName ?? '',
      phone: data.carPhone ?? '',
      email: data.carEmail ?? '',
      website: data.carWebsite ?? '',
      address: data.carAddress ?? '',
      poc: data.carPocName ?? '',
      whatsapp: data.carPocMobile ?? '',
      remarks: data.carRemarks ?? '',
      icao: data.carIcao ?? '',
      _raw: data,
    };
  }
  if (tab === 'hotel') {
    return {
      id,
      name: data.hotelName ?? '',
      phone: data.hotelPhone ?? '',
      email: data.hotelEmail ?? '',
      website: data.hotelWebsite ?? '',
      address: data.hotelAddress ?? '',
      stars: String(data.hotelStars ?? ''),
      distanceFromAirport: data.hotelDistanceFromApt ?? '',
      shuttle: data.hotelShuttle ?? '',
      remarks: data.remarks ?? '',
      icao: data.hotelIcao ?? '',
      _raw: data,
    };
  }
  // catering uses new schema already
  return { id, ...data };
}

// Denormalize portal fields back to collection schema for updates
function denormalizeFields(tab: TabName, fields: Record<string, unknown>) {
  if (tab === 'carRental') {
    return {
      carName: fields.companyName ?? '',
      carPhone: fields.phone ?? '',
      carEmail: fields.email ?? '',
      carWebsite: fields.website ?? '',
      carAddress: fields.address ?? '',
      carPocName: fields.poc ?? '',
      carPocMobile: fields.whatsapp ?? '',
      carRemarks: fields.remarks ?? '',
    };
  }
  if (tab === 'hotel') {
    return {
      hotelName: fields.name ?? '',
      hotelPhone: fields.phone ?? '',
      hotelEmail: fields.email ?? '',
      hotelWebsite: fields.website ?? '',
      hotelAddress: fields.address ?? '',
      hotelStars: fields.stars ?? '',
      hotelDistanceFromApt: fields.distanceFromAirport ?? '',
      hotelShuttle: fields.shuttle ?? '',
      remarks: fields.remarks ?? '',
    };
  }
  return fields;
}

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
    const tab = req.nextUrl.searchParams.get('col') as TabName;
    if (!COL_MAP[tab]) return NextResponse.json({ error: 'Invalid collection' }, { status: 400 });

    const ctx = await verifyAndGetIcao(req);
    if (!ctx) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { col, icaoField } = COL_MAP[tab];
    const db = getAdminDb();
    const snap = await db.collection(col).where(icaoField, '==', ctx.icao).get();
    const docs = snap.docs.map(d => normalizeDoc(tab, d.id, d.data() as Record<string, unknown>));
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

    const { col: tab, fields } = await req.json() as { col: TabName; fields: Record<string, unknown> };
    if (!COL_MAP[tab]) return NextResponse.json({ error: 'Invalid collection' }, { status: 400 });

    const { col, icaoField } = COL_MAP[tab];
    const db = getAdminDb();
    const ref = await db.collection(col).add({
      ...denormalizeFields(tab, fields),
      [icaoField]: ctx.icao,
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

    const { col: tab, docId, fields } = await req.json() as { col: TabName; docId: string; fields: Record<string, unknown> };
    if (!COL_MAP[tab]) return NextResponse.json({ error: 'Invalid collection' }, { status: 400 });

    const { col, icaoField } = COL_MAP[tab];
    const db = getAdminDb();
    const existing = await db.collection(col).doc(docId).get();
    if (!existing.exists || existing.data()![icaoField] !== ctx.icao) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    await db.collection(col).doc(docId).update({
      ...denormalizeFields(tab, fields),
      updatedBy: ctx.uid,
      updatedAt: FieldValue.serverTimestamp(),
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('services PATCH error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
