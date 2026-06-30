import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = getAdminDb();

    const snap = await db.collection('airports').doc(id).get();
    if (!snap.exists) return NextResponse.json({ error: 'Airport not found' }, { status: 404 });

    const airport = { id: snap.id, ...snap.data() };
    const icao = (airport as { icao?: string }).icao;

    let handlers: object[] = [];
    let fbos: object[] = [];

    if (icao) {
      const [hSnap, fSnap] = await Promise.all([
        db.collection('handler').where('handlerIcao', '==', icao).get(),
        db.collection('fbo').where('fboIcao', '==', icao).get(),
      ]);
      handlers = hSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      fbos     = fSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    }

    return NextResponse.json({ airport, handlers, fbos });
  } catch (err) {
    console.error('airports/[id] error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
