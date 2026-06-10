import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';

function auth(req: NextRequest) {
  const s = req.headers.get('x-admin-secret');
  return s && s === process.env.ADMIN_SECRET;
}

// GET /api/admin/permits?country=UNITED+STATES+OF+AMERICA
export async function GET(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const country = searchParams.get('country')?.toUpperCase().trim();

  if (!country) return NextResponse.json({ docs: [] });

  try {
    const db = getAdminDb();
    const seen = new Set<string>();
    const docs: Record<string, unknown>[] = [];

    const addSnap = (snap: FirebaseFirestore.QuerySnapshot) =>
      snap.docs.forEach((d) => {
        if (!seen.has(d.id)) { seen.add(d.id); docs.push({ id: d.id, ...d.data() }); }
      });

    // Try exact match first, then partial contains via >= / <=
    const [exact, startsWith] = await Promise.all([
      db.collection('permits').where('country_one', '==', country).limit(10).get(),
      db.collection('permits')
        .orderBy('country_one')
        .startAt(country)
        .endAt(country + '')
        .limit(10)
        .get(),
    ]);

    addSnap(exact);
    addSnap(startsWith);

    return NextResponse.json({ docs });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
