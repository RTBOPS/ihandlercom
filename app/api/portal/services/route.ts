import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

const ALLOWED_COLS = ['carRental', 'catering', 'hotel'] as const;
type Tab = typeof ALLOWED_COLS[number];

const COL_MAP = {
  carRental: { col: 'car',      icaoField: 'carIcao' },
  catering:  { col: 'catering', icaoField: 'icao'    },
  hotel:     { col: 'hotel',    icaoField: 'hotelIcao' },
} as const;

function normalizeDoc(tab: Tab, id: string, data: Record<string, unknown>) {
  if (tab === 'carRental') {
    return { id, companyName: data.carName ?? '', phone: data.carPhone ?? '', email: data.carEmail ?? '',
      website: data.carWebsite ?? '', address: data.carAddress ?? '', poc: data.carPocName ?? '',
      whatsapp: data.carPocMobile ?? '', remarks: data.carRemarks ?? '', icao: data.carIcao ?? '' };
  }
  if (tab === 'hotel') {
    return { id, name: data.hotelName ?? '', phone: data.hotelPhone ?? '', email: data.hotelEmail ?? '',
      website: data.hotelWebsite ?? '', address: data.hotelAddress ?? '', stars: String(data.hotelStars ?? ''),
      distanceFromAirport: data.hotelDistanceFromApt ?? '', shuttle: data.hotelShuttle ?? '',
      remarks: data.remarks ?? '', icao: data.hotelIcao ?? '' };
  }
  return { id, ...data };
}

function denormalizeFields(tab: Tab, fields: Record<string, unknown>) {
  if (tab === 'carRental') {
    return { carName: fields.companyName ?? '', carPhone: fields.phone ?? '', carEmail: fields.email ?? '',
      carWebsite: fields.website ?? '', carAddress: fields.address ?? '', carPocName: fields.poc ?? '',
      carPocMobile: fields.whatsapp ?? '', carRemarks: fields.remarks ?? '' };
  }
  if (tab === 'hotel') {
    return { hotelName: fields.name ?? '', hotelPhone: fields.phone ?? '', hotelEmail: fields.email ?? '',
      hotelWebsite: fields.website ?? '', hotelAddress: fields.address ?? '', hotelStars: fields.stars ?? '',
      hotelDistanceFromApt: fields.distanceFromAirport ?? '', hotelShuttle: fields.shuttle ?? '',
      remarks: fields.remarks ?? '' };
  }
  return fields;
}

async function getPortalIcao(uid: string): Promise<string | null> {
  const db = getAdminDb();
  for (const [colName, icaoField] of [['handler', 'handlerIcao'], ['fbo', 'fboIcao']]) {
    const snap = await db.collection(colName).where('accountUid', '==', uid).limit(1).get();
    if (!snap.empty) return snap.docs[0].data()[icaoField] as string;
  }
  return null;
}

export async function GET(req: NextRequest) {
  try {
    const tab = req.nextUrl.searchParams.get('col') as Tab;
    if (!ALLOWED_COLS.includes(tab)) return NextResponse.json({ error: 'Invalid collection' }, { status: 400 });

    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const decoded = await getAdminAuth().verifyIdToken(token);

    const icao = await getPortalIcao(decoded.uid);
    if (!icao) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    const { col, icaoField } = COL_MAP[tab];
    const db = getAdminDb();
    const snap = await db.collection(col).where(icaoField, '==', icao).get();
    const docs = snap.docs.map(d => normalizeDoc(tab, d.id, d.data() as Record<string, unknown>));
    return NextResponse.json({ docs });
  } catch (err) {
    console.error('services GET error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const decoded = await getAdminAuth().verifyIdToken(token);

    const icao = await getPortalIcao(decoded.uid);
    if (!icao) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    const { col: tab, fields } = await req.json() as { col: Tab; fields: Record<string, unknown> };
    if (!ALLOWED_COLS.includes(tab)) return NextResponse.json({ error: 'Invalid collection' }, { status: 400 });

    const { col, icaoField } = COL_MAP[tab];
    const db = getAdminDb();
    const ref = await db.collection(col).add({
      ...denormalizeFields(tab, fields),
      [icaoField]: icao,
      updatedAt: FieldValue.serverTimestamp(),
    });
    return NextResponse.json({ id: ref.id });
  } catch (err) {
    console.error('services POST error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const decoded = await getAdminAuth().verifyIdToken(token);

    const icao = await getPortalIcao(decoded.uid);
    if (!icao) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    const { col: tab, docId, fields } = await req.json() as { col: Tab; docId: string; fields: Record<string, unknown> };
    if (!ALLOWED_COLS.includes(tab)) return NextResponse.json({ error: 'Invalid collection' }, { status: 400 });

    const { col, icaoField } = COL_MAP[tab];
    const db = getAdminDb();
    const existing = await db.collection(col).doc(docId).get();
    if (!existing.exists || existing.data()![icaoField] !== icao) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    await db.collection(col).doc(docId).update({
      ...denormalizeFields(tab, fields),
      updatedAt: FieldValue.serverTimestamp(),
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('services PATCH error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
