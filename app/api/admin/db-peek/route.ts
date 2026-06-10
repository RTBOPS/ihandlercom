// Diagnostic: peek first 3 docs of any collection to see real field names & values
import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';

export async function GET(req: NextRequest) {
  const s = req.headers.get('x-admin-secret');
  if (!s || s !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const col = searchParams.get('collection') ?? 'airports';

  try {
    const db = getAdminDb();
    const snap = await db.collection(col).limit(3).get();
    const docs = snap.docs.map((d) => ({
      docId: d.id,
      fields: Object.fromEntries(
        Object.entries(d.data()).map(([k, v]) => [
          k,
          Array.isArray(v) ? `[array:${(v as unknown[]).length}]`
            : typeof v === 'object' && v !== null ? `[object]`
            : String(v).slice(0, 80),
        ])
      ),
    }));
    return NextResponse.json({ collection: col, count: snap.size, docs });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
