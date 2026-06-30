import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';

export async function GET(req: NextRequest) {
  const adminSecret = req.headers.get('x-admin-secret');
  if (!adminSecret || adminSecret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const icao = req.nextUrl.searchParams.get('icao')?.toUpperCase();
  const type = req.nextUrl.searchParams.get('type'); // 'handler' | 'fbo'

  if (!icao || !type || !['handler', 'fbo'].includes(type)) {
    return NextResponse.json({ error: 'icao and type required' }, { status: 400 });
  }

  const db = getAdminDb();
  const isFbo = type === 'fbo';
  const colName   = isFbo ? 'fbo'     : 'handler';
  const icaoField = isFbo ? 'fboIcao' : 'handlerIcao';
  const nameField = isFbo ? 'fboName' : 'handlerName';
  const emailField = isFbo ? 'fboEmail' : 'handlerEmail';
  const pocField  = isFbo ? 'fboPocName' : 'handlerPoc';

  const snap = await db.collection(colName).where(icaoField, '==', icao).get();

  // Also check if any already have a users doc (already invited)
  const companies = await Promise.all(snap.docs.map(async (d) => {
    const data = d.data();
    const email = data[emailField] || '';
    let alreadyInvited = false;
    if (email) {
      const invSnap = await db.collection('invitations').doc(email).get();
      alreadyInvited = invSnap.exists;
    }
    return {
      id: d.id,
      name: data[nameField] || '',
      email,
      poc: data[pocField] || '',
      alreadyInvited,
    };
  }));

  return NextResponse.json({ companies });
}
