import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';

function auth(req: NextRequest) {
  const s = req.headers.get('x-admin-secret');
  return s && s === process.env.ADMIN_SECRET;
}

function serializeSub(id: string, data: FirebaseFirestore.DocumentData) {
  return {
    id,
    email:               data.email   || '',
    name:                data.name    || '',
    company:             data.company || '',
    country:             data.country || '',
    plan:                data.plan    || 'pro',
    status:              data.status  || 'unknown',
    currentPeriodEnd:    data.currentPeriodEnd?.toDate?.()?.toISOString() ?? null,
    cancelAtPeriodEnd:   data.cancelAtPeriodEnd ?? false,
    createdAt:           data.createdAt?.toDate?.()?.toISOString() ?? null,
    stripeCustomerId:    data.stripeCustomerId    || '',
    stripeSubscriptionId: data.stripeSubscriptionId || '',
  };
}

export async function GET(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const db = getAdminDb();
    const snap = await db.collection('subscriptions').orderBy('createdAt', 'desc').get();

    const subscriptions = snap.docs.map((d) => serializeSub(d.id, d.data()));

    // Build stats
    const now = Date.now();
    const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
    const active    = subscriptions.filter((s) => s.status === 'active').length;
    const cancelled = subscriptions.filter((s) => s.status === 'cancelled').length;
    const past_due  = subscriptions.filter((s) => s.status === 'past_due').length;
    const recentCount = subscriptions.filter((s) =>
      s.createdAt && new Date(s.createdAt).getTime() > thirtyDaysAgo
    ).length;

    // Revenue — $290/year per active sub
    const arr = active * 290;
    const mrr = Math.round(arr / 12);

    // Countries (active only)
    const countries: Record<string, number> = {};
    subscriptions
      .filter((s) => s.status === 'active' && s.country)
      .forEach((s) => {
        countries[s.country] = (countries[s.country] || 0) + 1;
      });

    const stats = {
      total: subscriptions.length,
      active,
      cancelled,
      past_due,
      arr,
      mrr,
      countries,
      recentCount,
    };

    return NextResponse.json({ subscriptions, stats });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
