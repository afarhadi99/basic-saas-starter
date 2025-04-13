// src/app/api/webhooks/stripe/route.ts
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe/client';
import {
  upsertProductRecord,
  upsertPriceRecord,
  manageSubscriptionStatusChange,
} from '@/lib/supabase/admin';

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature') as string;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!signature || !webhookSecret) {
      return new NextResponse('Webhook secret not configured', { status: 400 });
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error(`Webhook Error: ${err.message}`);
      return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
    }

    // Define the events we specifically handle
    const relevantEvents = new Set([
      'product.created',
      'product.updated',
      'price.created',
      'price.updated',
      'customer.subscription.created',
      'customer.subscription.updated',
      'customer.subscription.deleted',
      'checkout.session.completed',
      'invoice.paid',
      'invoice.payment_succeeded',
    ]);

    // For subscription-related events
    if (relevantEvents.has(event.type)) {
      try {
        switch (event.type) {
          case 'product.created':
          case 'product.updated':
            await upsertProductRecord(event.data.object as Stripe.Product);
            break;
          case 'price.created':
          case 'price.updated':
            await upsertPriceRecord(event.data.object as Stripe.Price);
            break;
          case 'customer.subscription.created':
          case 'customer.subscription.updated':
          case 'customer.subscription.deleted':
            const subscription = event.data.object as Stripe.Subscription;
            await manageSubscriptionStatusChange(
              subscription.id,
              subscription.customer as string,
              event.type === 'customer.subscription.created'
            );
            break;
          case 'checkout.session.completed':
            const checkoutSession = event.data.object as Stripe.Checkout.Session;
            if (checkoutSession.mode === 'subscription' && checkoutSession.subscription) {
              const subscriptionId = typeof checkoutSession.subscription === 'string' 
                ? checkoutSession.subscription 
                : checkoutSession.subscription.id;
              const customerId = typeof checkoutSession.customer === 'string'
                ? checkoutSession.customer
                : checkoutSession.customer?.id;
              
              console.log(`Checkout completed for subscription ${subscriptionId} and customer ${customerId}`);
              
              if (subscriptionId && customerId) {
                await manageSubscriptionStatusChange(subscriptionId, customerId, true);
              }
            }
            break;
          case 'invoice.paid':
          case 'invoice.payment_succeeded':
            // Fix: Use proper type casting for invoice objects
            const invoice = event.data.object as any;
            if (invoice && invoice.customer && invoice.subscription) {
              await manageSubscriptionStatusChange(
                invoice.subscription as string,
                invoice.customer as string,
                false
              );
            }
            break;
        }
      } catch (error) {
        console.error('Webhook handler error:', error);
        return new NextResponse('Webhook handler failed', { status: 400 });
      }
    } else {
      // Just log unhandled events but don't treat them as errors
      console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('General webhook error:', error);
    return new NextResponse('Webhook processing failed', { status: 500 });
  }
}
