import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

function generatePassword(length = 12): string {
  const chars = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789!@#';
  let pw = '';
  for (let i = 0; i < length; i++) {
    pw += chars[Math.floor(Math.random() * chars.length)];
  }
  return pw;
}

export async function POST(req: NextRequest) {
  try {
    const { adminSecret, email, companyName, companyType, icao, emailType, contactName, existingDocId } =
      await req.json();

    // Verify admin secret (server-side env var — never exposed to browser)
    if (!adminSecret || adminSecret !== process.env.ADMIN_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const adminAuth = getAdminAuth();
    const adminDb = getAdminDb();

    // Check if user already exists
    let uid: string;
    let isExisting = false;
    let tempPassword: string | null = null;

    try {
      const existing = await adminAuth.getUserByEmail(email);
      uid = existing.uid;
      isExisting = true;
    } catch {
      // User does not exist — create them
      tempPassword = generatePassword();
      const newUser = await adminAuth.createUser({
        email,
        password: tempPassword,
        displayName: companyName,
      });
      uid = newUser.uid;

      // Create users/{uid} doc (approved immediately — admin invited them)
      const usersDoc: Record<string, unknown> = {
        email,
        companyName,
        companyType,
        icao: icao.toUpperCase(),
        role: 'owner',
        status: 'approved',
        createdAt: FieldValue.serverTimestamp(),
      };
      // Link to existing handler/fbo record so portal edits the right doc
      if (existingDocId) {
        const docIdKey = companyType === 'fbo' ? 'fboDocId' : 'handlerDocId';
        usersDoc[docIdKey] = existingDocId;
      }
      await adminDb.collection('users').doc(uid).set(usersDoc);
    }

    // For existing Firebase Auth users, update the docId link if provided
    if (isExisting && existingDocId) {
      const docIdKey = companyType === 'fbo' ? 'fboDocId' : 'handlerDocId';
      await adminDb.collection('users').doc(uid).set(
        { [docIdKey]: existingDocId },
        { merge: true }
      );
    }

    // Store/update invitation record
    const invitationData: Record<string, unknown> = {
      email,
      companyName,
      companyType,
      icao: icao.toUpperCase(),
      emailType, // 'new' | 'annual'
      contactName: contactName || '',
      status: 'sent',
      uid,
      isExisting,
      sentAt: FieldValue.serverTimestamp(),
    };
    // Persist temp password so admin can retrieve it later (new users only)
    if (tempPassword) invitationData.tempPassword = tempPassword;

    await adminDb.collection('invitations').doc(email).set(invitationData, { merge: true });

    return NextResponse.json({
      success: true,
      uid,
      isExisting,
      tempPassword, // null if existing user
    });
  } catch (err: unknown) {
    console.error('create-invitation error:', err);
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
