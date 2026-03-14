import { Response, NextFunction } from 'express';
import Stripe from 'stripe';
import { prisma } from '../index';
import { AuthRequest } from '../middleware/auth.middleware';

// Initialize Stripe only if API key is provided
const stripe = process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY !== 'sk_test_placeholder_key_for_testing'
  ? new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-02-25.clover' })
  : null;

export const createPaymentIntent = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!stripe) {
      return res.status(503).json({ error: 'Payment service not configured' });
    }

    const { amount, subscriptionId } = req.body;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Convert to cents
      currency: 'usd',
      metadata: { subscriptionId, userId: req.userId! },
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    next(error);
  }
};

export const getPayments = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const payments = await prisma.payment.findMany({
      include: { subscription: true },
    });
    res.json(payments);
  } catch (error) {
    next(error);
  }
};

export const processWebhook = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!stripe) {
      return res.status(503).json({ error: 'Payment service not configured' });
    }

    const buf = Buffer.from(JSON.stringify(req.body));
    const sig = req.headers.get('stripe-signature')!;

    const event = stripe.webhooks.constructEvent(
      buf,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        console.log('PaymentIntent was successful!', paymentIntent.id);
        break;
      case 'customer.subscription.deleted':
        const subscription = event.data.object;
        await prisma.subscription.updateMany({
          where: { stripeSubscriptionId: subscription.id },
          data: { status: 'CANCELLED' },
        });
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    next(error);
  }
};

export const cancelSubscription = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { subscriptionId } = req.body;

    if (subscriptionId && stripe) {
      await stripe.subscriptions.cancel(subscriptionId);
    }

    await prisma.subscription.update({
      where: { id: subscriptionId },
      data: { status: 'CANCELLED', cancelAtPeriodEnd: true },
    });

    res.json({ message: 'Subscription cancelled' });
  } catch (error) {
    next(error);
  }
};

export const updateSubscription = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!stripe) {
      return res.status(503).json({ error: 'Payment service not configured' });
    }

    const { subscriptionId, planId } = req.body;

    const updated = await stripe.subscriptions.update(subscriptionId, {
      items: [{ price: planId }],
    });

    res.json(updated);
  } catch (error) {
    next(error);
  }
};
