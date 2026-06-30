import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminDb } from '@/lib/firebase-admin';

export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = await getAdminAuth().verifyIdToken(token);
    const uid = decoded.uid;
    const db = getAdminDb();

    // Find linked handler or fbo doc by accountUid
    for (const [colName, companyType] of [['handler', 'handler'], ['fbo', 'fbo']] as const) {
      const snap = await db.collection(colName).where('accountUid', '==', uid).limit(1).get();
      if (!snap.empty) {
        const d = snap.docs[0].data();
        const isFbo = companyType === 'fbo';
        return NextResponse.json({
          uid,
          companyType,
          docId:       snap.docs[0].id,
          companyName: isFbo ? d.fboName    : d.handlerName,
          email:       isFbo ? d.fboEmail   : d.handlerEmail,
          icao:        isFbo ? d.fboIcao    : d.handlerIcao,
        });
      }
    }

    return NextResponse.json({ error: 'No handler or FBO linked to this account' }, { status: 403 });
  } catch (err) {
    console.error('portal/profile error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
