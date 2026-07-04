import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminDb } from '@/lib/firebase-admin';

export type StatusEntry = {
  email: string;
  companyName: string;
  companyType: 'handler' | 'fbo';
  icao: string;
  contactName: string;
  sentAt: string | null;
  lastSignIn: string | null;
  lastUpdated: string | null;
  status: 'never_logged_in' | 'logged_in' | 'updated';
  existingDocId: string | null;
};

export async function GET(req: NextRequest) {
  const adminSecret = req.headers.get('x-admin-secret');
  if (!adminSecret || adminSecret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const db = getAdminDb();
    const auth = getAdminAuth();

    const snap = await db.collection('invitations').get();

    // De-duplicate: keep the latest sentAt per email
    const byEmail = new Map<string, FirebaseFirestore.DocumentData>();
    for (const doc of snap.docs) {
      const d = doc.data();
      const email = (d.email as string || '').toLowerCase();
      if (!email) continue;
      const existing = byEmail.get(email);
      if (!existing) {
        byEmail.set(email, d);
      } else {
        // Keep the one with the most recent sentAt
        const existingTs = existing.sentAt?.toMillis?.() ?? 0;
        const newTs = d.sentAt?.toMillis?.() ?? 0;
        if (newTs > existingTs) byEmail.set(email, d);
      }
    }

    const entries: StatusEntry[] = await Promise.all(
      Array.from(byEmail.entries()).map(async ([email, inv]) => {
        const companyType: 'handler' | 'fbo' = inv.companyType === 'fbo' ? 'fbo' : 'handler';
        const sentAt: string | null = inv.sentAt?.toDate?.()?.toISOString() ?? null;

        // Get lastSignIn from Firebase Auth
        let lastSignIn: string | null = null;
        try {
          const userRecord = await auth.getUserByEmail(email);
          lastSignIn = userRecord.metadata.lastSignInTime ?? null;
        } catch {
          // User hasn't created an account yet
        }

        // Get _lastUpdatedAt from handler/fbo doc
        let lastUpdated: string | null = null;
        let existingDocId: string | null = null;
        try {
          const colName = companyType === 'fbo' ? 'fbo' : 'handler';
          const icaoField = companyType === 'fbo' ? 'fboIcao' : 'handlerIcao';
          const icaoVal = (inv.icao as string || '').toUpperCase();

          // Try to find via portalLinks first (more reliable)
          // We query the collection by icao field
          const docsSnap = await db
            .collection(colName)
            .where(icaoField, '==', icaoVal)
            .limit(5)
            .get();

          // Find the matching doc by checking _lastUpdatedAt presence
          for (const d of docsSnap.docs) {
            const data = d.data();
            if (data._lastUpdatedAt) {
              lastUpdated = data._lastUpdatedAt?.toDate?.()?.toISOString() ?? null;
              existingDocId = d.id;
              break;
            }
            // Doc exists even without _lastUpdatedAt — record its id
            if (!existingDocId) existingDocId = d.id;
          }
        } catch {
          // Ignore lookup errors
        }

        // Status logic
        let status: StatusEntry['status'];
        if (lastUpdated) {
          status = 'updated';
        } else if (lastSignIn) {
          status = 'logged_in';
        } else {
          status = 'never_logged_in';
        }

        return {
          email,
          companyName: (inv.companyName as string) || '',
          companyType,
          icao: (inv.icao as string || '').toUpperCase(),
          contactName: (inv.contactName as string) || '',
          sentAt,
          lastSignIn,
          lastUpdated,
          status,
          existingDocId,
        };
      })
    );

    // Sort: never_logged_in first, then logged_in, then updated
    const order: Record<string, number> = { never_logged_in: 0, logged_in: 1, updated: 2 };
    entries.sort((a, b) => order[a.status] - order[b.status]);

    return NextResponse.json({ entries });
  } catch (err) {
    console.error('admin/status GET error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
