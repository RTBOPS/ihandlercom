import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminDb } from '@/lib/firebase-admin';

export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = await getAdminAuth().verifyIdToken(token);
    const uid = decoded.uid;
    const db = getAdminDb();

    // Look up portal link (separate collection — never touched by the app)
    const linkSnap = await db.collection('portalLinks').doc(uid).get();
    if (!linkSnap.exists) return NextResponse.json({ error: 'No portal access linked to this account' }, { status: 403 });

    const link = linkSnap.data()!;
    const colName = link.companyType === 'fbo' ? 'fbo' : 'handler';
    const docSnap = await db.collection(colName).doc(link.handlerDocId || link.fboDocId).get();
    if (!docSnap.exists) return NextResponse.json({ error: 'Company record not found' }, { status: 404 });

    const d = docSnap.data()!;
    const isFbo = link.companyType === 'fbo';
    return NextResponse.json({
      uid,
      companyType: link.companyType,
      docId: docSnap.id,
      companyName: isFbo ? d.fboName    : d.handlerName,
      email:       isFbo ? d.fboEmail   : d.handlerEmail,
      icao:        isFbo ? d.fboIcao    : d.handlerIcao,
    });
  } catch (err) {
    console.error('portal/profile error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
