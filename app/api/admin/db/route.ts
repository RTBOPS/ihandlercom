import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';

function auth(req: NextRequest) {
  const s = req.headers.get('x-admin-secret');
  return s && s === process.env.ADMIN_SECRET;
}

// Exact Firestore collection names → real ICAO field names (from db-peek)
const COL_CONFIG: Record<string, { icaoFields: string[]; byDocId?: boolean }> = {
  airports: { icaoFields: ['icao'],        byDocId: false }, // random doc IDs, search by field
  permits:  { icaoFields: ['icao'] },                        // country permits — may return 0 for ICAO search
  fbo:      { icaoFields: ['fboIcao'] },
  handler:  { icaoFields: ['handlerIcao'] },
  hotel:    { icaoFields: ['hotelIcao'] },
  fuel:     { icaoFields: ['fuelIcao'] },
  car:      { icaoFields: ['carIcao'] },
};

export async function GET(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const col = searchParams.get('collection');
  const icao = searchParams.get('icao')?.toUpperCase().trim();
  const id = searchParams.get('id');

  if (!col || !COL_CONFIG[col]) {
    return NextResponse.json({ error: 'Invalid collection' }, { status: 400 });
  }

  try {
    const db = getAdminDb();
    const seen = new Set<string>();
    const docs: Record<string, unknown>[] = [];

    const addDoc = (docId: string, data: Record<string, unknown>) => {
      if (!seen.has(docId)) {
        seen.add(docId);
        docs.push({ id: docId, ...data });
      }
    };

    if (id) {
      const snap = await db.collection(col).doc(id).get();
      if (snap.exists) addDoc(snap.id, snap.data() as Record<string, unknown>);
    } else if (icao) {
      // Query by all known ICAO field names, trying both UPPER and lower case
      const { icaoFields } = COL_CONFIG[col];
      const variants = Array.from(new Set([icao, icao.toLowerCase()]));

      await Promise.all(
        icaoFields.flatMap((field) =>
          variants.map(async (val) => {
            try {
              const snap = await db.collection(col).where(field, '==', val).limit(50).get();
              snap.docs.forEach((d) => addDoc(d.id, d.data() as Record<string, unknown>));
            } catch {
              // composite index may not exist — ignore silently
            }
          })
        )
      );
    } else {
      // No ICAO — return first 100 docs
      const snap = await db.collection(col).limit(100).get();
      snap.docs.forEach((d) => addDoc(d.id, d.data() as Record<string, unknown>));
    }

    return NextResponse.json({ docs });
  } catch (err) {
    console.error('DB GET error:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

// POST — create
export async function POST(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const { collection: col, data } = await req.json() as { collection: string; data: Record<string, unknown> };
    if (!col || !COL_CONFIG[col]) return NextResponse.json({ error: 'Invalid collection' }, { status: 400 });

    const db = getAdminDb();
    let docRef;
    if (col === 'airports' && data.icao) {
      const key = String(data.icao).toUpperCase();
      docRef = db.collection(col).doc(key);
      await docRef.set({ ...data, updatedAt: new Date() });
    } else {
      docRef = await db.collection(col).add({ ...data, updatedAt: new Date() });
    }
    return NextResponse.json({ id: docRef.id });
  } catch (err) {
    console.error('DB POST error:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

// PUT — update
export async function PUT(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const { collection: col, id, data } = await req.json() as { collection: string; id: string; data: Record<string, unknown> };
    if (!col || !id) return NextResponse.json({ error: 'Missing params' }, { status: 400 });

    const db = getAdminDb();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id: _id, ...cleanData } = data;
    await db.collection(col).doc(id).update({ ...cleanData, updatedAt: new Date() });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('DB PUT error:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

// DELETE
export async function DELETE(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const col = searchParams.get('collection');
  const id = searchParams.get('id');
  if (!col || !id) return NextResponse.json({ error: 'Missing params' }, { status: 400 });

  try {
    const db = getAdminDb();
    await db.collection(col).doc(id).delete();
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('DB DELETE error:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
