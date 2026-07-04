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
  completeness: number | null;
  deliveryStatus: 'bounced' | 'spam' | 'clicked' | 'opened' | 'delivered' | null;
  remindedAt: string | null;
};

// Key profile fields that define a "complete" listing
const KEY_FIELDS: Record<'handler' | 'fbo', string[]> = {
  handler: ['handlerPhone', 'handlerAddress', 'handlerCity', 'handlerCountry', 'handlerWebsite',
    'handlerPoc', 'handlerPocMobile', 'handlerFrecuency', 'handlerRampServices', 'handlerFuelServices'],
  fbo: ['fboPhne', 'fboAddress', 'fboCity', 'fboCountry', 'fboWebsite',
    'fboPocName', 'fboPocMobile', 'fboFrecuency', 'fboRampServices', 'fboFuelServices'],
};

function computeCompleteness(data: FirebaseFirestore.DocumentData, type: 'handler' | 'fbo'): number {
  const fields = KEY_FIELDS[type];
  const filled = fields.filter((f) => {
    const v = data[f];
    if (v == null) return false;
    if (typeof v === 'string') return v.trim().length > 0;
    if (Array.isArray(v)) return v.length > 0;
    return true;
  }).length;
  return Math.round((filled / fields.length) * 100);
}

function deriveDelivery(ev?: Record<string, string>): StatusEntry['deliveryStatus'] {
  if (!ev) return null;
  if (ev.bounce || ev.dropped) return 'bounced';
  if (ev.spamreport) return 'spam';
  if (ev.click) return 'clicked';
  if (ev.open) return 'opened';
  if (ev.delivered) return 'delivered';
  return null;
}

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

        // Get _lastUpdatedAt and profile completeness from handler/fbo doc
        let lastUpdated: string | null = null;
        let existingDocId: string | null = null;
        let completeness: number | null = null;
        try {
          const colName = companyType === 'fbo' ? 'fbo' : 'handler';
          const icaoField = companyType === 'fbo' ? 'fboIcao' : 'handlerIcao';
          const emailField = companyType === 'fbo' ? 'fboEmail' : 'handlerEmail';
          const icaoVal = (inv.icao as string || '').toUpperCase();

          const docsSnap = await db
            .collection(colName)
            .where(icaoField, '==', icaoVal)
            .limit(5)
            .get();

          // Pick the best matching doc: email match first, then _lastUpdatedAt, then any
          let chosen: FirebaseFirestore.QueryDocumentSnapshot | null = null;
          for (const d of docsSnap.docs) {
            const data = d.data();
            const docEmail = (data[emailField] as string | undefined)?.trim().toLowerCase();
            if (docEmail === email) { chosen = d; break; }
            if (!chosen && data._lastUpdatedAt) chosen = d;
          }
          if (!chosen && !docsSnap.empty) chosen = docsSnap.docs[0];

          if (chosen) {
            const data = chosen.data();
            existingDocId = chosen.id;
            lastUpdated = data._lastUpdatedAt?.toDate?.()?.toISOString() ?? null;
            completeness = computeCompleteness(data, companyType);
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
          contactName: (inv.contactName as string) || (inv.pocName as string) || '',
          sentAt,
          lastSignIn,
          lastUpdated,
          status,
          existingDocId,
          completeness,
          deliveryStatus: deriveDelivery(inv.emailEvents as Record<string, string> | undefined),
          remindedAt: inv.remindedAt?.toDate?.()?.toISOString() ?? null,
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
