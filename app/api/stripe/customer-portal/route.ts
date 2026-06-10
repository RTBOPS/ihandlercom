import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getAdminDb } from '@/lib/firebase-admin';

function getStripe() { return new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-05-27.dahlia' }); }

// POST /api/stripe/customer-portal  body: { email: string }
// Returns a Stripe Billing Portal URL so the subscriber can manage their plan
export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) return NextResponse.json({ error: 'Missing email' }, { status: 400 });

    // Find subscription by email
    const db = getAdminDb();
    const snap = await db.collection('subscriptions')
      .where('email', '==', email)
      .where('status', '==', 'active')
      .limit(1)
      .get();

    if (snap.empty) {
      return NextResponse.json({ error: 'No active subscription found for this email' }, { status: 404 });
    }

    const customerId = snap.docs[0].data().stripeCustomerId as string;
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ihandler-landing.vercel.app';

    const stripe = getStripe();
    const session = await stripe.billingPortal.sessions.create({
      customer:   customerId,
      return_url: `${baseUrl}/pricing`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error('Customer portal error:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
