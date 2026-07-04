import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

function generatePassword(length = 12): string {
  const chars = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789!@#';
  let pw = '';
  for (let i = 0; i < length; i++) pw += chars[Math.floor(Math.random() * chars.length)];
  return pw;
}

export async function POST(req: NextRequest) {
  try {
    const { adminSecret, email, companyName, companyType, icao, emailType, contactName, existingDocId, additionalIcaos } =
      await req.json() as {
        adminSecret: string; email: string; companyName: string; companyType: 'fbo' | 'handler';
        icao: string; emailType: string; contactName?: string; existingDocId?: string;
        additionalIcaos?: string[];
      };

    if (!adminSecret || adminSecret !== process.env.ADMIN_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const adminAuth = getAdminAuth();
    const adminDb = getAdminDb();

    let uid: string;
    let isExisting = false;
    let tempPassword: string | null = null;

    try {
      const existing = await adminAuth.getUserByEmail(email);
      uid = existing.uid;
      isExisting = true;
    } catch {
      tempPassword = generatePassword();
      const newUser = await adminAuth.createUser({ email, password: tempPassword, displayName: companyName });
      uid = newUser.uid;
      // Note: Firebase trigger may auto-create a user doc — we don't use that collection for portal
    }

    // Save link in portalLinks — never touches existing handler/fbo doc schema
    const colName = companyType === 'fbo' ? 'fbo' : 'handler';
    const docIdKey = companyType === 'fbo' ? 'fboDocId' : 'handlerDocId';
    let linkedDocId = existingDocId;

    if (!linkedDocId) {
      // No existing doc — create a minimal record so the portal has something to load
      const nameKey = companyType === 'fbo' ? 'fboName' : 'handlerName';
      const emailKey = companyType === 'fbo' ? 'fboEmail' : 'handlerEmail';
      const icaoKey = companyType === 'fbo' ? 'fboIcao' : 'handlerIcao';
      // Pre-generate the ref so the minimal doc is born app-compatible:
      // `uid` = document id, plus the _createdBy/_updatedBy maps the app expects.
      const newRef = adminDb.collection(colName).doc();
      await newRef.set({
        [nameKey]: companyName,
        [emailKey]: email,
        [icaoKey]: icao.toUpperCase(),
        uid: newRef.id,
        createdAt: FieldValue.serverTimestamp(),
        createdByPortalInvite: true,
        _createdBy: { uid, timestamp: new Date().toISOString() },
        _updatedBy: { uid, timestamp: new Date().toISOString() },
      });
      linkedDocId = newRef.id;
    }

    const stationEntry = {
      [docIdKey]: linkedDocId,
      icao: icao.toUpperCase(),
    };

    // set+merge works for both new and existing docs; arrayUnion adds without duplicating
    await adminDb.collection('portalLinks').doc(uid).set({
      companyType,
      stations: FieldValue.arrayUnion(stationEntry),
    }, { merge: true });

    // Add additional ICAO stations to the same account
    if (additionalIcaos && additionalIcaos.length > 0) {
      const nameKey = companyType === 'fbo' ? 'fboName' : 'handlerName';
      const emailKey = companyType === 'fbo' ? 'fboEmail' : 'handlerEmail';
      const icaoKey = companyType === 'fbo' ? 'fboIcao' : 'handlerIcao';

      for (const extraIcao of additionalIcaos) {
        // Try to find existing doc for this ICAO
        const snap = await adminDb.collection(colName)
          .where(icaoKey, '==', extraIcao.toUpperCase())
          .where(emailKey, '==', email)
          .limit(1).get();

        let extraDocId: string;
        if (!snap.empty) {
          extraDocId = snap.docs[0].id;
        } else {
          // Create minimal doc for this station
          const newRef = await adminDb.collection(colName).add({
            [nameKey]: companyName,
            [emailKey]: email,
            [icaoKey]: extraIcao.toUpperCase(),
            createdAt: FieldValue.serverTimestamp(),
            createdByPortalInvite: true,
          });
          extraDocId = newRef.id;
        }

        const extraStation = { [docIdKey]: extraDocId, icao: extraIcao.toUpperCase() };
        await adminDb.collection('portalLinks').doc(uid).update({
          stations: FieldValue.arrayUnion(extraStation),
        });
      }
    }

    // Store invitation record for audit trail
    await adminDb.collection('invitations').doc(email).set({
      email, companyName, companyType, icao: icao.toUpperCase(),
      emailType, contactName: contactName || '',
      status: 'sent', uid, isExisting,
      existingDocId: linkedDocId || null,
      sentAt: FieldValue.serverTimestamp(),
      ...(tempPassword ? { tempPassword } : {}),
    }, { merge: true });

    return NextResponse.json({ success: true, uid, isExisting, tempPassword, linkedDocId });
  } catch (err: unknown) {
    console.error('create-invitation error:', err);
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Internal server error' }, { status: 500 });
  }
}
