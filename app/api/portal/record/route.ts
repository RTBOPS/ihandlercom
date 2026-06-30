import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminDb } from '@/lib/firebase-admin';

export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const adminAuth = getAdminAuth();
    const decoded = await adminAuth.verifyIdToken(token);
    const uid = decoded.uid;

    const adminDb = getAdminDb();

    // Get user profile first to know companyType, icao, companyName
    const userSnap = await adminDb.collection('users').doc(uid).get();
    if (!userSnap.exists) return NextResponse.json({ error: 'Profile not found' }, { status: 404 });

    const profile = userSnap.data()!;
    const colName   = profile.companyType === 'fbo' ? 'fbo' : 'handler';
    const icaoField = profile.companyType === 'fbo' ? 'fboIcao' : 'handlerIcao';
    const nameField = profile.companyType === 'fbo' ? 'fboName'  : 'handlerName';

    const snap = await adminDb.collection(colName)
      .where(icaoField, '==', profile.icao)
      .where(nameField, '==', profile.companyName)
      .limit(1)
      .get();

    if (snap.empty) return NextResponse.json({ error: 'Record not found' }, { status: 404 });

    const doc = snap.docs[0];
    return NextResponse.json({ id: doc.id, ...doc.data() });
  } catch (err) {
    console.error('portal/record error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const adminAuth = getAdminAuth();
    const decoded = await adminAuth.verifyIdToken(token);
    const uid = decoded.uid;

    const adminDb = getAdminDb();
    const userSnap = await adminDb.collection('users').doc(uid).get();
    if (!userSnap.exists) return NextResponse.json({ error: 'Profile not found' }, { status: 404 });

    const profile = userSnap.data()!;
    const colName = profile.companyType === 'fbo' ? 'fbo' : 'handler';

    const { recordId, fields } = await req.json() as { recordId: string; fields: Record<string, unknown> };

    // Safety: only allow known safe field prefixes, never ownerUid/createdBy/accountUid
    const BLOCKED = ['ownerUid', 'createdBy', 'accountUid', '_createdBy', 'uid'];
    const safe = Object.fromEntries(
      Object.entries(fields).filter(([k]) => !BLOCKED.includes(k))
    );

    await adminDb.collection(colName).doc(recordId).update(safe);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('portal/record POST error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
