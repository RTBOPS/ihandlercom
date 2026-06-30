import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

function colConfig(companyType: string) {
  const isFbo = companyType === 'fbo';
  return {
    colName:   isFbo ? 'fbo'     : 'handler',
    icaoField: isFbo ? 'fboIcao' : 'handlerIcao',
    nameField: isFbo ? 'fboName' : 'handlerName',
    docIdKey:  isFbo ? 'fboDocId': 'handlerDocId',
  };
}

export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = await getAdminAuth().verifyIdToken(token);
    const uid = decoded.uid;
    const adminDb = getAdminDb();

    const userSnap = await adminDb.collection('users').doc(uid).get();
    if (!userSnap.exists) return NextResponse.json({ error: 'Profile not found' }, { status: 404 });

    const profile = userSnap.data()!;
    const { colName, icaoField, nameField, docIdKey } = colConfig(profile.companyType);

    // 1. Use stored docId if available
    const storedId = profile[docIdKey] as string | undefined;
    let docSnap;
    if (storedId) {
      const d = await adminDb.collection(colName).doc(storedId).get();
      if (d.exists) docSnap = d;
    }

    // 2. Fallback: query by icao + name
    if (!docSnap) {
      const byName = await adminDb.collection(colName)
        .where(icaoField, '==', profile.icao)
        .where(nameField, '==', profile.companyName)
        .limit(1).get();
      if (!byName.empty) docSnap = byName.docs[0];
    }

    // 3. Fallback: query by icao only (picks first match)
    if (!docSnap) {
      const byIcao = await adminDb.collection(colName)
        .where(icaoField, '==', profile.icao)
        .limit(1).get();
      if (!byIcao.empty) docSnap = byIcao.docs[0];
    }

    // 4. No existing record → return empty so portal renders a blank form
    if (!docSnap) {
      return NextResponse.json({ id: null, [icaoField]: profile.icao, [nameField]: profile.companyName, _new: true });
    }

    // Save docId for fast future lookups
    if (!storedId || storedId !== docSnap.id) {
      await adminDb.collection('users').doc(uid).update({ [docIdKey]: docSnap.id });
    }

    return NextResponse.json({ id: docSnap.id, ...docSnap.data() });
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
    const adminDb = getAdminDb();

    const userSnap = await adminDb.collection('users').doc(uid).get();
    if (!userSnap.exists) return NextResponse.json({ error: 'Profile not found' }, { status: 404 });

    const profile = userSnap.data()!;
    const { colName, icaoField, nameField, docIdKey } = colConfig(profile.companyType);

    const { recordId, fields } = await req.json() as { recordId: string | null; fields: Record<string, unknown> };

    const BLOCKED = ['ownerUid', 'createdBy', 'accountUid', '_createdBy', 'uid', '_new'];
    const safe = Object.fromEntries(
      Object.entries(fields).filter(([k]) => !BLOCKED.includes(k))
    );

    let finalId = recordId;

    if (!recordId) {
      // CREATE new record in handler/fbo collection
      const ref = await adminDb.collection(colName).add({
        ...safe,
        [icaoField]: profile.icao,
        [nameField]: profile.companyName,
        accountUid: uid,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
      finalId = ref.id;
      // Save docId so portal always edits this record
      await adminDb.collection('users').doc(uid).update({ [docIdKey]: finalId });
    } else {
      await adminDb.collection(colName).doc(recordId).update({
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
