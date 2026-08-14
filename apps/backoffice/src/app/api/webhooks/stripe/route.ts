import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@payload-config';
import Stripe from 'stripe';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('STRIPE_SECRET_KEY is not set');
  return new Stripe(key, {
    apiVersion: '2026-07-29.dahlia',
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature')!;

    let event: Stripe.Event;

    try {
      event = getStripe().webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const payload = await getPayload({ config });

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(payload, session);
        break;
      }
      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaid(payload, invoice);
        break;
      }
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentFailed(payload, invoice);
        break;
      }
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(payload, subscription);
        break;
      }
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(payload, subscription);
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Stripe webhook error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}

async function handleCheckoutCompleted(payload: any, session: Stripe.Checkout.Session) {
  const { docs } = await payload.find({
    collection: 'subscriptions',
    where: { stripeCustomerId: { equals: session.customer as string } },
  });

  if (docs.length) {
    await payload.update({
      collection: 'subscriptions',
      id: docs[0].id,
      data: {
        status: 'active',
        stripeSubscriptionId: session.subscription as string,
        stripePriceId: session.metadata?.priceId,
      },
    });
  }
}

async function handleInvoicePaid(payload: any, invoice: Stripe.Invoice) {
  const { docs } = await payload.find({
    collection: 'subscriptions',
    where: { stripeCustomerId: { equals: invoice.customer as string } },
  });

  if (docs.length && invoice.lines.data[0]) {
    await payload.update({
      collection: 'subscriptions',
      id: docs[0].id,
      data: {
        status: 'active',
        currentPeriodEnd: new Date(invoice.lines.data[0].period.end * 1000),
      },
    });
  }
}

async function handlePaymentFailed(payload: any, invoice: Stripe.Invoice) {
  const { docs } = await payload.find({
    collection: 'subscriptions',
    where: { stripeCustomerId: { equals: invoice.customer as string } },
  });

  if (docs.length) {
    await payload.update({
      collection: 'subscriptions',
      id: docs[0].id,
      data: { status: 'past_due' },
    });
  }
}

async function handleSubscriptionUpdated(payload: any, subscription: Stripe.Subscription) {
  const { docs } = await payload.find({
    collection: 'subscriptions',
    where: { stripeSubscriptionId: { equals: subscription.id } },
  });

  if (docs.length) {
    await payload.update({
      collection: 'subscriptions',
      id: docs[0].id,
      data: {
        status: subscription.status === 'active' ? 'active' : 'past_due',
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        currentPeriodEnd: new Date((subscription.items.data[0]?.current_period_end ?? 0) * 1000),
      },
    });
  }
}

async function handleSubscriptionDeleted(payload: any, subscription: Stripe.Subscription) {
  const { docs } = await payload.find({
    collection: 'subscriptions',
    where: { stripeSubscriptionId: { equals: subscription.id } },
  });

  if (docs.length) {
    await payload.update({
      collection: 'subscriptions',
      id: docs[0].id,
      data: { status: 'canceled' },
    });
  }
}
