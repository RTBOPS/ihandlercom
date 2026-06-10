import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getAdminAuth, getAdminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

function generatePassword(length = 12): string {
  const chars = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789!@#';
  let pw = '';
  for (let i = 0; i < length; i++) pw += chars[Math.floor(Math.random() * chars.length)];
  return pw;
}

function getStripe() { return new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-05-27.dahlia' }); }

// Stripe requires the raw body for webhook signature verification
export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature');

  if (!sig) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  const stripe = getStripe();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const db = getAdminDb();

  // Helper: get period from subscription items (current_period moved to items in v22)
  function getPeriod(sub: Stripe.Subscription) {
    const item = sub.items?.data?.[0];
    return {
      start: item ? new Date(item.current_period_start * 1000) : new Date(),
      end:   item ? new Date(item.current_period_end   * 1000) : new Date(),
    };
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode !== 'subscription') break;

        const sub = await getStripe().subscriptions.retrieve(session.subscription as string, {
          expand: ['items'],
        });
        const { start, end } = getPeriod(sub);
        const meta = session.metadata || {};
        const email = meta.email || session.customer_email || '';
        const name  = meta.name  || '';

        // Create or fetch Firebase Auth account for this subscriber
        let uid = '';
        let tempPassword: string | null = null;
        if (email) {
          const adminAuth = getAdminAuth();
          try {
            const existing = await adminAuth.getUserByEmail(email);
            uid = existing.uid;
          } catch {
            tempPassword = generatePassword();
            const newUser = await adminAuth.createUser({
              email,
              password: tempPassword,
              displayName: name || email,
            });
            uid = newUser.uid;
            await db.collection('users').doc(uid).set({
              email,
              name,
              company:   meta.company || '',
              country:   meta.country || '',
              role:      'subscriber',
              status:    'active',
              plan:      'pro',
              createdAt: FieldValue.serverTimestamp(),
            });
          }
        }

        await db.collection('subscriptions').doc(sub.id).set({
          stripeCustomerId:     session.customer as string,
          stripeSubscriptionId: sub.id,
          uid,
          email,
          name,
          company:              meta.company  || '',
          country:              meta.country  || '',
          plan:                 'pro',
          status:               'active',
          currentPeriodStart:   start,
          currentPeriodEnd:     end,
          cancelAtPeriodEnd:    sub.cancel_at_period_end,
          ...(tempPassword ? { tempPassword } : {}),
          createdAt:            FieldValue.serverTimestamp(),
          updatedAt:            FieldValue.serverTimestamp(),
        });
        break;
      }

      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription;
        const { start, end } = getPeriod(sub);
        const status = sub.status === 'active'   ? 'active'
                     : sub.status === 'canceled' ? 'cancelled'
                     : sub.status;

        await db.collection('subscriptions').doc(sub.id).update({
          status,
          currentPeriodStart: start,
          currentPeriodEnd:   end,
          cancelAtPeriodEnd:  sub.cancel_at_period_end,
          updatedAt:          FieldValue.serverTimestamp(),
        });
        break;
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        await db.collection('subscriptions').doc(sub.id).update({
          status:    'cancelled',
          updatedAt: FieldValue.serverTimestamp(),
        });
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        // In Stripe v22, subscription is inside invoice.parent
        const subId = (invoice as unknown as { parent?: { subscription_details?: { subscription?: string } } })
          ?.parent?.subscription_details?.subscription;
        if (subId) {
          await db.collection('subscriptions').doc(subId).update({
            status:    'past_due',
            updatedAt: FieldValue.serverTimestamp(),
          });
        }
        break;
      }
    }
  } catch (err) {
    console.error('Webhook handler error:', err);
    return NextResponse.json({ error: 'Handler error' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
