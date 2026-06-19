import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';

const PAYPAL_API = 'https://api-m.paypal.com';

async function getAccessToken(): Promise<string> {
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!;
  const secret = process.env.PAYPAL_CLIENT_SECRET!;
  const credentials = Buffer.from(`${clientId}:${secret}`).toString('base64');

  const res = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  if (!res.ok) throw new Error('Failed to get PayPal access token');
  const data = await res.json();
  return data.access_token;
}

export async function POST(req: Request) {
  try {
    const { orderID } = await req.json();

    const token = await getAccessToken();

    const res = await fetch(`${PAYPAL_API}/v2/checkout/orders/${orderID}/capture`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      const err = await res.json();
      return NextResponse.json({ error: err.message || 'Capture failed' }, { status: 500 });
    }

    const capture = await res.json();
    const unit = capture.purchase_units?.[0];
    const payment = unit?.payments?.captures?.[0];

    if (capture.status !== 'COMPLETED' || payment?.status !== 'COMPLETED') {
      return NextResponse.json({ error: 'Payment not completed' }, { status: 400 });
    }

    // Parse subscriber info stored in custom_id
    let subscriberData: Record<string, string> = {};
    try {
      subscriberData = JSON.parse(unit?.custom_id || '{}');
    } catch {
      subscriberData = {};
    }

    // Save subscription record to Firestore
    const db = getAdminDb();
    await db.collection('subscriptions').add({
      email: subscriberData.email || '',
      name: subscriberData.name || '',
      company: subscriberData.company || '',
      country: subscriberData.country || '',
      plan: 'pro_annual',
      amount: payment.amount?.value || '290.00',
      currency: payment.amount?.currency_code || 'USD',
      paypalOrderId: orderID,
      paypalCaptureId: payment.id,
      paypalPayerId: capture.payer?.payer_id || '',
      paypalEmail: capture.payer?.email_address || '',
      status: 'active',
      provider: 'paypal',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    });

    return NextResponse.json({ success: true, captureId: payment.id });
  } catch (err) {
    console.error('PayPal capture-order error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
