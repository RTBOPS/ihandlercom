import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';

// SendGrid Event Webhook receiver.
// Configure in SendGrid → Settings → Mail Settings → Event Webhook with URL:
//   https://www.i-handler.com/api/webhooks/sendgrid?token=<SENDGRID_WEBHOOK_TOKEN>
// Events land on the invitations doc keyed by recipient email, under emailEvents.

type SgEvent = {
  email?: string;
  event?: string;
  timestamp?: number;
  reason?: string;
  type?: string;
};

const TRACKED = new Set(['processed', 'delivered', 'open', 'click', 'bounce', 'dropped', 'spamreport', 'deferred']);

export async function POST(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token');
  if (!process.env.SENDGRID_WEBHOOK_TOKEN || token !== process.env.SENDGRID_WEBHOOK_TOKEN) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let events: SgEvent[];
  try {
    events = await req.json();
    if (!Array.isArray(events)) throw new Error('not an array');
  } catch {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  try {
    const db = getAdminDb();

    // Collapse to one update per email: keep the latest timestamp per event type
    const byEmail = new Map<string, { events: Record<string, string>; bounceReason?: string }>();
    for (const ev of events) {
      const email = ev.email?.trim().toLowerCase();
      const kind = ev.event;
      if (!email || !kind || !TRACKED.has(kind)) continue;
      const ts = new Date((ev.timestamp || Math.floor(Date.now() / 1000)) * 1000).toISOString();
      const entry = byEmail.get(email) ?? { events: {} };
      if (!entry.events[kind] || entry.events[kind] < ts) entry.events[kind] = ts;
      if ((kind === 'bounce' || kind === 'dropped') && ev.reason) entry.bounceReason = ev.reason;
      byEmail.set(email, entry);
    }

    let updated = 0;
    for (const [email, entry] of byEmail) {
      // Only annotate existing invitation records — ignore unrelated traffic
      const ref = db.collection('invitations').doc(email);
      const snap = await ref.get();
      if (!snap.exists) continue;
      const payload: Record<string, unknown> = {};
      for (const [kind, ts] of Object.entries(entry.events)) {
        payload[`emailEvents.${kind}`] = ts;
      }
      if (entry.bounceReason) payload['emailBounceReason'] = entry.bounceReason;
      await ref.update(payload);
      updated++;
    }

    return NextResponse.json({ received: events.length, updated });
  } catch (err) {
    console.error('sendgrid webhook error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
