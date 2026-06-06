import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';

export async function GET(req: NextRequest) {
  const adminSecret = req.headers.get('x-admin-secret');
  if (!adminSecret || adminSecret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const db = getAdminDb();
    const snap = await db.collection('invitations').orderBy('sentAt', 'desc').limit(100).get();
    const invitations = snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
      sentAt: d.data().sentAt?.toDate?.()?.toISOString() ?? null,
    }));
    return NextResponse.json({ invitations });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to load invitations' }, { status: 500 });
  }
}
