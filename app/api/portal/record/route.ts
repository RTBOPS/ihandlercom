import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

async function findCompanyDoc(uid: string) {
  const db = getAdminDb();
  for (const [colName, companyType] of [['handler', 'handler'], ['fbo', 'fbo']] as const) {
    const snap = await db.collection(colName).where('accountUid', '==', uid).limit(1).get();
    if (!snap.empty) {
      return { db, colName, companyType, docId: snap.docs[0].id, doc: snap.docs[0] };
    }
  }
  return null;
}

export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = await getAdminAuth().verifyIdToken(token);
    const found = await findCompanyDoc(decoded.uid);

    if (!found) {
      // No linked doc yet — return empty so portal shows blank form
      return NextResponse.json({ id: null, _new: true });
    }

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

    const BLOCKED = ['accountUid', 'ownerUid', 'createdBy', '_createdBy', 'uid', '_new'];
    const safe = Object.fromEntries(
      Object.entries(fields).filter(([k]) => !BLOCKED.includes(k))
    );

    let finalId = recordId;

    if (!recordId) {
      // New company — need companyType from fields to know which collection
      const companyType = fields._companyType as string;
      const colName = companyType === 'fbo' ? 'fbo' : 'handler';
      const icaoField = companyType === 'fbo' ? 'fboIcao' : 'handlerIcao';
      const nameField = companyType === 'fbo' ? 'fboName' : 'handlerName';

      const ref = await db.collection(colName).add({
        ...safe,
        [icaoField]: fields[icaoField] || '',
        [nameField]: fields[nameField] || '',
        accountUid: uid,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
      finalId = ref.id;
    } else {
      await db.collection(
        // Determine collection from existing doc
        (await findCompanyDoc(uid))?.colName ?? 'handler'
      ).doc(recordId).update({
        ...safe,
        updatedAt: FieldValue.serverTimestamp(),
      });
    }

    return NextResponse.json({ ok: true, id: finalId });
  } catch (err) {
    console.error('portal/record POST error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
