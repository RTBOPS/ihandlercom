import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

// Admin station manager for portal accounts.
// GET  ?email=            → account's stations (normalizes legacy flat links)
// POST { action:'remove', email, docId }  → unlink station; deletes the
//        directory doc only if it was created by a portal invite
// POST { action:'add', email, icao }      → link station at ICAO, reusing an
//        existing directory doc for this email or creating a minimal one

type StationInfo = {
  docId: string;
  icao: string;
  companyName: string;
  createdByPortalInvite: boolean;
  missing?: boolean;
};

async function loadAccount(email: string) {
  const auth = getAdminAuth();
  const db = getAdminDb();

  const user = await auth.getUserByEmail(email);
  const linkRef = db.collection('portalLinks').doc(user.uid);
  const linkSnap = await linkRef.get();
  if (!linkSnap.exists) return { user, linkRef, link: null };
  return { user, linkRef, link: linkSnap.data()! };
}

function normalizeStations(link: FirebaseFirestore.DocumentData, isFbo: boolean): { docId: string; icao: string }[] {
  const docIdKey = isFbo ? 'fboDocId' : 'handlerDocId';
  const out: { docId: string; icao: string }[] = [];
  if (Array.isArray(link.stations)) {
    for (const s of link.stations) {
      if (s && s[docIdKey]) out.push({ docId: s[docIdKey], icao: (s.icao || '').toUpperCase() });
    }
  }
  // Legacy flat link — include if not already in the array
  const legacyId = link[docIdKey];
  if (legacyId && !out.some((s) => s.docId === legacyId)) {
    out.push({ docId: legacyId, icao: (link.icao || '').toUpperCase() });
  }
  return out;
}

export async function GET(req: NextRequest) {
  const adminSecret = req.headers.get('x-admin-secret');
  if (!adminSecret || adminSecret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const email = req.nextUrl.searchParams.get('email')?.trim().toLowerCase();
  if (!email) return NextResponse.json({ error: 'email required' }, { status: 400 });

  try {
    const db = getAdminDb();
    let account;
    try {
      account = await loadAccount(email);
    } catch {
      return NextResponse.json({ error: 'No Firebase Auth account for this email' }, { status: 404 });
    }
    const { user, link } = account;
    if (!link) return NextResponse.json({ error: 'This account has no portal link (never invited via portal)' }, { status: 404 });

    const isFbo = link.companyType === 'fbo';
    const colName = isFbo ? 'fbo' : 'handler';
    const nameKey = isFbo ? 'fboName' : 'handlerName';
    const icaoKey = isFbo ? 'fboIcao' : 'handlerIcao';

    const raw = normalizeStations(link, isFbo);
    const stations: StationInfo[] = await Promise.all(raw.map(async (s) => {
      const snap = await db.collection(colName).doc(s.docId).get();
      if (!snap.exists) {
        return { docId: s.docId, icao: s.icao, companyName: '(deleted document)', createdByPortalInvite: false, missing: true };
      }
      const d = snap.data()!;
      return {
        docId: s.docId,
        icao: ((d[icaoKey] as string) || s.icao || '').toUpperCase(),
        companyName: (d[nameKey] as string) || '',
        createdByPortalInvite: d.createdByPortalInvite === true,
      };
    }));

    return NextResponse.json({ uid: user.uid, email, companyType: isFbo ? 'fbo' : 'handler', stations });
  } catch (err) {
    console.error('stations GET error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { adminSecret, action, email, docId, icao } = await req.json() as {
      adminSecret: string; action: 'remove' | 'add'; email: string; docId?: string; icao?: string;
    };

    if (!adminSecret || adminSecret !== process.env.ADMIN_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const normalized = (email || '').trim().toLowerCase();
    if (!normalized) return NextResponse.json({ error: 'email required' }, { status: 400 });

    const db = getAdminDb();
    let account;
    try {
      account = await loadAccount(normalized);
    } catch {
      return NextResponse.json({ error: 'No Firebase Auth account for this email' }, { status: 404 });
    }
    const { user, linkRef, link } = account;
    if (!link) return NextResponse.json({ error: 'This account has no portal link' }, { status: 404 });

    const isFbo = link.companyType === 'fbo';
    const colName = isFbo ? 'fbo' : 'handler';
    const docIdKey = isFbo ? 'fboDocId' : 'handlerDocId';
    const nameKey = isFbo ? 'fboName' : 'handlerName';
    const emailKey = isFbo ? 'fboEmail' : 'handlerEmail';
    const icaoKey = isFbo ? 'fboIcao' : 'handlerIcao';

    const current = normalizeStations(link, isFbo);

    if (action === 'remove') {
      if (!docId) return NextResponse.json({ error: 'docId required' }, { status: 400 });
      if (!current.some((s) => s.docId === docId)) {
        return NextResponse.json({ error: 'Station not linked to this account' }, { status: 404 });
      }

      const remaining = current.filter((s) => s.docId !== docId);
      // Rewrite the link in the new array shape and clear legacy flat fields
      await linkRef.set({
        companyType: isFbo ? 'fbo' : 'handler',
        stations: remaining.map((s) => ({ [docIdKey]: s.docId, icao: s.icao })),
        [docIdKey]: FieldValue.delete(),
        icao: FieldValue.delete(),
      }, { merge: true });

      // Delete the directory doc only if the portal invite created it
      let docDeleted = false;
      const docRef = db.collection(colName).doc(docId);
      const docSnap = await docRef.get();
      if (docSnap.exists && docSnap.data()?.createdByPortalInvite === true) {
        await docRef.delete();
        docDeleted = true;
      }

      return NextResponse.json({ success: true, removed: docId, docDeleted, remaining: remaining.length });
    }

    if (action === 'add') {
      const icaoUp = (icao || '').trim().toUpperCase();
      if (icaoUp.length < 3) return NextResponse.json({ error: 'Valid ICAO required' }, { status: 400 });

      // Reuse an existing directory doc for this email at that ICAO, else create minimal
      let linkedDocId: string;
      let reused = false;
      const snap = await db.collection(colName)
        .where(icaoKey, '==', icaoUp)
        .where(emailKey, '==', normalized)
        .limit(1).get();

      if (!snap.empty) {
        linkedDocId = snap.docs[0].id;
        reused = true;
      } else {
        // Inherit the company name from the first linked station
        let companyName = user.displayName || '';
        if (current.length > 0) {
          const firstSnap = await db.collection(colName).doc(current[0].docId).get();
          const n = firstSnap.data()?.[nameKey];
          if (typeof n === 'string' && n.trim()) companyName = n;
        }
        const newRef = db.collection(colName).doc();
        await newRef.set({
          [nameKey]: companyName,
          [emailKey]: normalized,
          [icaoKey]: icaoUp,
          uid: newRef.id,
          createdAt: FieldValue.serverTimestamp(),
          createdByPortalInvite: true,
          _createdBy: { uid: user.uid, timestamp: new Date().toISOString() },
          _updatedBy: { uid: user.uid, timestamp: new Date().toISOString() },
        });
        linkedDocId = newRef.id;
      }

      if (current.some((s) => s.docId === linkedDocId)) {
        return NextResponse.json({ error: 'Station already linked to this account' }, { status: 409 });
      }

      // Rewrite in array shape (migrates legacy flat links too)
      const next = [...current, { docId: linkedDocId, icao: icaoUp }];
      await linkRef.set({
        companyType: isFbo ? 'fbo' : 'handler',
        stations: next.map((s) => ({ [docIdKey]: s.docId, icao: s.icao })),
        [docIdKey]: FieldValue.delete(),
        icao: FieldValue.delete(),
      }, { merge: true });

      return NextResponse.json({ success: true, added: linkedDocId, icao: icaoUp, reusedExistingDoc: reused });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (err) {
    console.error('stations POST error:', err);
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Internal server error' }, { status: 500 });
  }
}
