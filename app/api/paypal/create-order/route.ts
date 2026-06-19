import { NextResponse } from 'next/server';

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
    const { name, email, company, country } = await req.json();

    const token = await getAccessToken();

    const res = await fetch(`${PAYPAL_API}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [
          {
            amount: {
              currency_code: 'USD',
              value: '290.00',
            },
            description: 'i-Handler Pro — Annual Subscription (Full database access)',
            custom_id: JSON.stringify({ name, email, company, country }),
          },
        ],
        application_context: {
          brand_name: 'i-Handler',
          landing_page: 'NO_PREFERENCE',
          user_action: 'PAY_NOW',
          return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/pricing/success`,
          cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/pricing`,
        },
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      return NextResponse.json({ error: err.message || 'PayPal order creation failed' }, { status: 500 });
    }

    const order = await res.json();
    return NextResponse.json({ orderID: order.id });
  } catch (err) {
    console.error('PayPal create-order error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
