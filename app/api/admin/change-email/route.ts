import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminDb } from '@/lib/firebase-admin';

export async function POST(req: NextRequest) {
  try {
    const { adminSecret, oldEmail, newEmail, companyType, icao } = await req.json();

    if (!adminSecret || adminSecret !== process.env.ADMIN_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (!oldEmail || !newEmail || !companyType) {
      return NextResponse.json({ error: 'oldEmail, newEmail, and companyType are required' }, { status: 400 });
    }

    const adminAuth = getAdminAuth();
    const db = getAdminDb();

    // 1. Find Firebase Auth user by old email
    const user = await adminAuth.getUserByEmail(oldEmail);
    const uid = user.uid;

    // 2. Update Firebase Auth email
    await adminAuth.updateUser(uid, { email: newEmail });

    // 3. Find and update handler/fbo doc
    const colName = companyType === 'fbo' ? 'fbo' : 'handler';
    const emailField = companyType === 'fbo' ? 'fboEmail' : 'handlerEmail';
    const icaoField = companyType === 'fbo' ? 'fboIcao' : 'handlerIcao';

    let docId: string | null = null;

    // Try to find by ICAO first if provided, then fall back to old email
    if (icao) {
      const snap = await db.collection(colName)
        .where(icaoField, '==', icao.toUpperCase())
        .get();
      if (!snap.empty) {
        // If multiple docs at ICAO, pick the one with the old email
        const match = snap.docs.find(d => d.data()[emailField] === oldEmail) ?? snap.docs[0];
        docId = match.id;
        await match.ref.update({ [emailField]: newEmail });
      }
    }

    // Fallback: query by old email field
    if (!docId) {
      const snap = await db.collection(colName)
        .where(emailField, '==', oldEmail)
        .get();
      if (!snap.empty) {
        const doc = snap.docs[0];
        docId = doc.id;
        await doc.ref.update({ [emailField]: newEmail });
      }
    }

    // 4. Update invitations collection (keyed by email)
    const oldInvSnap = await db.collection('invitations').doc(oldEmail).get();
    if (oldInvSnap.exists) {
      const invData = oldInvSnap.data()!;
      await db.collection('invitations').doc(newEmail).set({
        ...invData,
        email: newEmail,
      });
      await db.collection('invitations').doc(oldEmail).delete();
    }

    return NextResponse.json({ success: true, uid, docId });
  } catch (err: unknown) {
    console.error('change-email error:', err);
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
