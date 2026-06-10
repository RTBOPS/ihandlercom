import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';

// GET /api/stripe/subscription-status?email=...
// Returns the latest active subscription for an email
export async function GET(req: NextRequest) {
  const email = new URL(req.url).searchParams.get('email')?.toLowerCase().trim();
  if (!email) return NextResponse.json({ active: false });

  try {
    const db = getAdminDb();
    const snap = await db.collection('subscriptions')
      .where('email', '==', email)
      .orderBy('createdAt', 'desc')
      .limit(1)
      .get();

    if (snap.empty) return NextResponse.json({ active: false });

    const data = snap.docs[0].data();
    const active = data.status === 'active';

    return NextResponse.json({
      active,
      status:         data.status,
      plan:           data.plan,
      company:        data.company,
      name:           data.name,
      country:        data.country,
      expiresAt:      data.currentPeriodEnd?.toDate?.()?.toISOString() ?? null,
      cancelAtEnd:    data.cancelAtPeriodEnd,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ active: false, error: String(err) });
  }
}
