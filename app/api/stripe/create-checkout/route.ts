import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

function getStripe() { return new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-05-27.dahlia' }); }

export async function POST(req: NextRequest) {
  try {
    const { name, email, company, country } = await req.json();

    if (!name || !email || !company || !country) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ihandler-landing.vercel.app';

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID!,
          quantity: 1,
        },
      ],
      customer_email: email,
      metadata: {
        name,
        company,
        country,
        email,
      },
      subscription_data: {
        metadata: {
          name,
          company,
          country,
          email,
        },
      },
      success_url: `${baseUrl}/subscribe/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/subscribe/cancel`,
      allow_promotion_codes: true,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error('Stripe checkout error:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
