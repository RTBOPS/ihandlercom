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
    const { adminSecret, email, companyName, companyType, icao, emailType, contactName, existingDocId } =
      await req.json();

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

    await adminDb.collection('portalLinks').doc(uid).set({
      companyType,
      [docIdKey]: linkedDocId,
      icao: icao.toUpperCase(),
    }, { merge: true });

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
