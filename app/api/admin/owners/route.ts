import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';

function auth(req: NextRequest) {
  const s = req.headers.get('x-admin-secret');
  return s && s === process.env.ADMIN_SECRET;
}

export async function GET(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = getAdminDb();

  // 1. Load all owner users (fbo + handler)
  const usersSnap = await db.collection('users')
    .where('role', '==', 'owner')
    .get();

  if (usersSnap.empty) return NextResponse.json({ owners: [] });

  // 2. Load invitations to retrieve stored temp passwords (keyed by email)
  const invSnap = await db.collection('invitations').get();
  const invByEmail: Record<string, string> = {};
  invSnap.docs.forEach((d) => {
    const data = d.data();
    if (data.email && data.tempPassword) invByEmail[data.email] = data.tempPassword;
  });

  // 3. For each owner, check if they have updated their fbo/handler record
  //    A record is considered "updated" when its uid field matches the owner uid.
  const uids = usersSnap.docs.map((d) => d.id);

  // Batch-query fbo and handler for uid matches (Firestore 'in' supports up to 30)
  const chunks = <T>(arr: T[], size: number): T[][] =>
    Array.from({ length: Math.ceil(arr.length / size) }, (_, i) => arr.slice(i * size, i * size + size));

  const updatedUids = new Set<string>();
  const uidChunks = chunks(uids, 30);

  await Promise.all(
    uidChunks.flatMap((chunk) => [
      db.collection('fbo').where('uid', 'in', chunk).get().then((s) =>
        s.docs.forEach((d) => { if (d.data().uid) updatedUids.add(d.data().uid as string); })
      ),
      db.collection('handler').where('uid', 'in', chunk).get().then((s) =>
        s.docs.forEach((d) => { if (d.data().uid) updatedUids.add(d.data().uid as string); })
      ),
    ])
  );

  const owners = usersSnap.docs.map((d) => {
    const data = d.data();
    return {
      uid:         d.id,
      email:       data.email       || '',
      companyName: data.companyName || '',
      companyType: data.companyType || '',
      icao:        data.icao        || '',
      status:      data.status      || '',
      tempPassword: invByEmail[data.email] || null,
      hasUpdated:  updatedUids.has(d.id),
      createdAt:   data.createdAt?.toDate?.()?.toISOString() ?? null,
    };
  });

  // Sort: updated first, then by company name
  owners.sort((a, b) => {
    if (a.hasUpdated !== b.hasUpdated) return a.hasUpdated ? -1 : 1;
    return a.companyName.localeCompare(b.companyName);
  });

  return NextResponse.json({ owners });
}
