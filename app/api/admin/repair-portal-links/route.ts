import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

// POST /api/admin/repair-portal-links
// Scans all invitations, finds users with missing or broken portalLinks, and repairs them.
export async function POST(req: NextRequest) {
  try {
    const { adminSecret } = await req.json();
    if (!adminSecret || adminSecret !== process.env.ADMIN_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = getAdminDb();
    const auth = getAdminAuth();

    const invitationsSnap = await db.collection('invitations').get();
    const results: { email: string; status: string; detail?: string }[] = [];

    for (const doc of invitationsSnap.docs) {
      const inv = doc.data();
      const email = inv.email as string;
      const companyType = inv.companyType as 'handler' | 'fbo';
      const icao = (inv.icao as string | undefined)?.toUpperCase();
      const existingDocId = inv.existingDocId as string | undefined;

      if (!email || !companyType || !icao) {
        results.push({ email: email || doc.id, status: 'skipped', detail: 'missing required fields' });
        continue;
      }

      // Find the Firebase Auth user
      let uid: string;
      try {
        const fbUser = await auth.getUserByEmail(email);
        uid = fbUser.uid;
      } catch {
        results.push({ email, status: 'skipped', detail: 'no Firebase Auth user found' });
        continue;
      }

      // Check current portalLinks doc
      const linkDoc = await db.collection('portalLinks').doc(uid).get();
      const linkData = linkDoc.exists ? linkDoc.data()! : null;

      // Already has valid stations array — check if this ICAO is in it
      if (linkData?.stations && Array.isArray(linkData.stations) && linkData.stations.length > 0) {
        const hasIcao = linkData.stations.some((s: Record<string, string>) => s.icao === icao);
        if (hasIcao) {
          results.push({ email, status: 'ok', detail: `already linked (${icao})` });
          continue;
        }
      }

      // Find the handler/fbo doc
      const colName = companyType === 'fbo' ? 'fbo' : 'handler';
      const icaoKey = companyType === 'fbo' ? 'fboIcao' : 'handlerIcao';
      const docIdKey = companyType === 'fbo' ? 'fboDocId' : 'handlerDocId';
      const nameKey = companyType === 'fbo' ? 'fboName' : 'handlerName';
      const emailKey = companyType === 'fbo' ? 'fboEmail' : 'handlerEmail';

      let linkedDocId = existingDocId;

      // Try to find by existingDocId first
      if (linkedDocId) {
        const docSnap = await db.collection(colName).doc(linkedDocId).get();
        if (!docSnap.exists) linkedDocId = undefined;
      }

      // Try to find by ICAO + email
      if (!linkedDocId) {
        const snap = await db.collection(colName)
          .where(icaoKey, '==', icao)
          .where(emailKey, '==', email)
          .limit(1).get();
        if (!snap.empty) linkedDocId = snap.docs[0].id;
      }

      // Try to find by ICAO alone
      if (!linkedDocId) {
        const snap = await db.collection(colName).where(icaoKey, '==', icao).limit(1).get();
        if (!snap.empty) linkedDocId = snap.docs[0].id;
      }

      // Create minimal doc if still not found
      if (!linkedDocId) {
        const companyName = inv.companyName as string || email;
        const newRef = await db.collection(colName).add({
          [nameKey]: companyName,
          [emailKey]: email,
          [icaoKey]: icao,
          createdAt: FieldValue.serverTimestamp(),
          createdByPortalRepair: true,
        });
        linkedDocId = newRef.id;
      }

      // Write the station entry
      const stationEntry = { [docIdKey]: linkedDocId, icao };
      await db.collection('portalLinks').doc(uid).set({
        companyType,
        stations: FieldValue.arrayUnion(stationEntry),
      }, { merge: true });

      results.push({ email, status: 'repaired', detail: `linked to ${colName}/${linkedDocId} (${icao})` });
    }

    const repaired = results.filter(r => r.status === 'repaired').length;
    const ok = results.filter(r => r.status === 'ok').length;
    const skipped = results.filter(r => r.status === 'skipped').length;

    return NextResponse.json({ repaired, ok, skipped, results });
  } catch (err) {
    console.error('repair-portal-links error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
