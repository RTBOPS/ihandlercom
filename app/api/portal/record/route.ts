import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

async function findCompanyDoc(uid: string) {
  const db = getAdminDb();
  const linkSnap = await db.collection('portalLinks').doc(uid).get();
  if (!linkSnap.exists) return null;

  const link = linkSnap.data()!;
  const colName = link.companyType === 'fbo' ? 'fbo' : 'handler';
  const docId = link.handlerDocId || link.fboDocId;
  const doc = await db.collection(colName).doc(docId).get();
  if (!doc.exists) return null;

  return { db, colName, companyType: link.companyType as string, docId, doc };
}

export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = await getAdminAuth().verifyIdToken(token);
    const found = await findCompanyDoc(decoded.uid);

    if (!found) return NextResponse.json({ id: null, _new: true });

    return NextResponse.json({ id: found.docId, ...found.doc.data() });
  } catch (err) {
    console.error('portal/record GET error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = await getAdminAuth().verifyIdToken(token);
    const uid = decoded.uid;
    const db = getAdminDb();

    const { recordId, fields } = await req.json() as { recordId: string | null; fields: Record<string, unknown> };

    const BLOCKED = ['accountUid', 'ownerUid', 'createdBy', '_createdBy', '_updatedBy', 'uid', '_new', '_companyType'];
    const safe = Object.fromEntries(
      Object.entries(fields).filter(([k]) => !BLOCKED.includes(k))
    );

    let finalId = recordId;

    if (!recordId) {
      // Brand new company — create doc and save link in portalLinks
      const companyType = fields._companyType as string;
      const colName = companyType === 'fbo' ? 'fbo' : 'handler';
      const icaoField = companyType === 'fbo' ? 'fboIcao' : 'handlerIcao';
      const nameField = companyType === 'fbo' ? 'fboName' : 'handlerName';

      const ref = await db.collection(colName).add({
        ...safe,
        [icaoField]: fields[icaoField] || '',
        [nameField]: fields[nameField] || '',
        _createdBy: { uid, timestamp: new Date().toISOString() },
        _updatedBy: { uid, timestamp: new Date().toISOString() },
      });
      finalId = ref.id;

      // Save link in portalLinks — never touches handler/fbo doc
      await db.collection('portalLinks').doc(uid).set({
        companyType,
        [colName === 'fbo' ? 'fboDocId' : 'handlerDocId']: finalId,
        icao: (fields[icaoField] as string || '').toUpperCase(),
      });
    } else {
      const found = await findCompanyDoc(uid);
      const colName = found?.colName ?? 'handler';

      // Read existing doc to preserve original field types (string vs array)
      const existing = await db.collection(colName).doc(recordId).get();
      const existingData = existing.data() || {};

      const merged: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(safe)) {
        const orig = existingData[k];
        if (typeof orig === 'string' && Array.isArray(v)) {
          merged[k] = (v as string[]).join(', ');
        } else {
          merged[k] = v;
        }
      }

      await db.collection(colName).doc(recordId).update(merged);
    }

    return NextResponse.json({ ok: true, id: finalId });
  } catch (err) {
    console.error('portal/record POST error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
