import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminDb } from '@/lib/firebase-admin';

export async function GET(req: NextRequest) {
  const adminSecret = req.headers.get('x-admin-secret');
  if (!adminSecret || adminSecret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const db = getAdminDb();
    const auth = getAdminAuth();
    const snap = await db.collection('invitations').orderBy('sentAt', 'desc').limit(100).get();

    // Batch-look up Auth accounts to report access status per invitation
    const emails = [...new Set(snap.docs.map((d) => d.id))];
    const authInfo = new Map<string, { accountExists: boolean; lastSignIn: string | null }>();
    for (let i = 0; i < emails.length; i += 100) {
      const chunk = emails.slice(i, i + 100);
      try {
        const result = await auth.getUsers(chunk.map((email) => ({ email })));
        for (const u of result.users) {
          if (u.email) {
            authInfo.set(u.email.toLowerCase(), {
              accountExists: true,
              lastSignIn: u.metadata.lastSignInTime || null,
            });
          }
        }
      } catch (err) {
        console.error('invitations: getUsers chunk failed', err);
      }
    }

    const invitations = snap.docs.map((d) => {
      const info = authInfo.get(d.id.toLowerCase());
      return {
        id: d.id,
        ...d.data(),
        sentAt: d.data().sentAt?.toDate?.()?.toISOString() ?? null,
        accountExists: info?.accountExists ?? false,
        lastSignIn: info?.lastSignIn ?? null,
      };
    });
    return NextResponse.json({ invitations });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to load invitations' }, { status: 500 });
  }
}
