import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { toAppSchema, toPortalSchema, type CompanyKind } from '@/lib/handler-schema';

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

    const data = found.doc.data() || {};
    const view = toPortalSchema(data, found.colName as CompanyKind);
    return NextResponse.json({ id: found.docId, ...view });
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

      // Store in the app's canonical shape (strings/numbers + app field names).
      const base = toAppSchema(safe, colName as CompanyKind);

      // Pre-generate the doc ref so we can stamp `uid` = document id (the app
      // reads a `uid` field that must equal the document id).
      const ref = db.collection(colName).doc();
      await ref.set({
        ...base,
        [icaoField]: fields[icaoField] || '',
        [nameField]: fields[nameField] || '',
        uid: ref.id,
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

      // Convert to the app's canonical shape (strings/numbers + app field names).
      const merged = toAppSchema(safe, colName as CompanyKind);

      merged.uid = recordId;
      merged._updatedBy = { uid, timestamp: new Date().toISOString() };
      await db.collection(colName).doc(recordId).update(merged);
    }

    return NextResponse.json({ ok: true, id: finalId });
  } catch (err) {
    console.error('portal/record POST error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
