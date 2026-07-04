import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';

function auth(req: NextRequest) {
  const s = req.headers.get('x-admin-secret');
  return s && s === process.env.ADMIN_SECRET;
}

// Owners = every portal account. Sourced from the invitations collection
// (the registry created by the invite flows) merged with legacy self-registered
// users (users collection, role == 'owner').

export async function GET(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const db = getAdminDb();

    type OwnerRow = {
      uid: string;
      email: string;
      companyName: string;
      companyType: string;
      icao: string;
      status: string;
      tempPassword: string | null;
      hasUpdated: boolean;
      createdAt: string | null;
    };

    const byEmail = new Map<string, OwnerRow>();

    // 1. Legacy self-registered owners
    const usersSnap = await db.collection('users').where('role', '==', 'owner').get();
    usersSnap.docs.forEach((d) => {
      const data = d.data();
      const email = ((data.email as string) || '').toLowerCase();
      if (!email) return;
      byEmail.set(email, {
        uid: d.id,
        email,
        companyName: data.companyName || '',
        companyType: data.companyType || 'handler',
        icao: (data.icao || '').toUpperCase(),
        status: data.status || 'registered',
        tempPassword: null,
        hasUpdated: false,
        createdAt: data.createdAt?.toDate?.()?.toISOString() ?? null,
      });
    });

    // 2. Invited portal accounts (the main registry)
    const invSnap = await db.collection('invitations').get();
    invSnap.docs.forEach((d) => {
      const data = d.data();
      const email = ((data.email as string) || d.id || '').toLowerCase();
      if (!email) return;
      const existing = byEmail.get(email);
      byEmail.set(email, {
        uid: (data.uid as string) || existing?.uid || email,
        email,
        companyName: data.companyName || existing?.companyName || '',
        companyType: data.companyType || existing?.companyType || 'handler',
        icao: ((data.icao as string) || existing?.icao || '').toUpperCase(),
        status: data.status || existing?.status || 'invited',
        tempPassword: (data.tempPassword as string) || null,
        hasUpdated: false,
        createdAt: data.sentAt?.toDate?.()?.toISOString() ?? existing?.createdAt ?? null,
      });
    });

    // 3. Which emails actually updated their listing — two cheap queries:
    //    docs that carry _lastUpdatedAt were saved through the portal.
    const updatedEmails = new Set<string>();
    const [updHandlers, updFbos] = await Promise.all([
      db.collection('handler').where('_lastUpdatedAt', '!=', null).select('handlerEmail').get(),
      db.collection('fbo').where('_lastUpdatedAt', '!=', null).select('fboEmail').get(),
    ]);
    updHandlers.docs.forEach((d) => {
      const e = (d.data().handlerEmail as string | undefined)?.trim().toLowerCase();
      if (e) updatedEmails.add(e);
    });
    updFbos.docs.forEach((d) => {
      const e = (d.data().fboEmail as string | undefined)?.trim().toLowerCase();
      if (e) updatedEmails.add(e);
    });

    const owners = [...byEmail.values()].map((o) => ({
      ...o,
      hasUpdated: updatedEmails.has(o.email),
    }));

    // Sort: updated first, then by company name
    owners.sort((a, b) => {
      if (a.hasUpdated !== b.hasUpdated) return a.hasUpdated ? -1 : 1;
      return a.companyName.localeCompare(b.companyName);
    });

    return NextResponse.json({ owners });
  } catch (err) {
    console.error('admin/owners error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
