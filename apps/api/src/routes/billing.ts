import express from 'express';
import Stripe from 'stripe';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

// Global pricing plans
const PLANS = [
  {
    id: 'premium-monthly-gbp',
    name: 'Premium Monthly',
    price: 799, // Price in cents (£7.99)
    currency: 'gbp',
    interval: 'month' as const,
    features: [
      'Unlimited RAWG API calls',
      'Advanced analytics dashboard',
      'AI-powered recommendations',
      'Custom themes & profiles',
      'Cloud sync & backup',
      'Priority support',
      'Early access to features'
    ]
  },
  {
    id: 'premium-yearly-gbp',
    name: 'Premium Yearly',
    price: 7999, // Price in cents (£79.99)
    currency: 'gbp',
    interval: 'year' as const,
    features: [
      'Everything in monthly',
      '2 months free',
      'Exclusive yearly badges',
      'Beta feature access'
    ]
  }
];

// Create Stripe checkout session
router.post('/create-checkout-session', authMiddleware, async (req, res) => {
  try {
    const { planId } = req.body;
    const userId = req.user.id;

    const plan = PLANS.find(p => p.id === planId);
    if (!plan) {
      return res.status(400).json({ error: 'Invalid plan ID' });
    }

    // Create or retrieve Stripe customer
    let customer = await stripe.customers.list({ email: req.user.email, limit: 1 });
    
    if (customer.data.length === 0) {
      customer = await stripe.customers.create({
        email: req.user.email,
        metadata: {
          userId: userId
        }
      });
    } else {
      customer = { data: [customer.data[0]] };
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customer.data[0].id,
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: plan.currency,
            product_data: {
              name: plan.name,
              description: plan.features.join(', '),
              images: ['https://your-domain.com/premium-icon.png']
            },
            unit_amount: plan.price,
            recurring: {
              interval: plan.interval,
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.FRONTEND_URL}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/billing/cancel`,
      metadata: {
        userId: userId,
        planId: planId
      }
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('Stripe session creation error:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

// Get subscription status
router.get('/subscription-status', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get customer by user metadata
    const customers = await stripe.customers.list({ 
      email: req.user.email, 
      limit: 1,
      expand: ['data.subscriptions']
    });

    if (customers.data.length === 0) {
      return res.json({
        tier: 'free',
        status: 'active'
      });
    }

    const customer = customers.data[0];
    const subscriptions = customer.subscriptions?.data || [];

    if (subscriptions.length === 0) {
      return res.json({
        tier: 'free',
        status: 'active'
      });
    }

    const subscription = subscriptions[0]; // Get most recent subscription

    res.json({
      tier: 'premium',
      planId: subscription.metadata?.planId,
      status: subscription.status,
      currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : undefined
    });
  } catch (error) {
    console.error('Subscription status error:', error);
    res.status(500).json({ error: 'Failed to get subscription status' });
  }
});

// Cancel subscription
router.post('/cancel-subscription', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get customer by user metadata
    const customers = await stripe.customers.list({ 
      email: req.user.email, 
      limit: 1,
      expand: ['data.subscriptions']
    });

    if (customers.data.length === 0) {
      return res.status(404).json({ error: 'No subscription found' });
    }

    const customer = customers.data[0];
    const subscriptions = customer.subscriptions?.data || [];

    if (subscriptions.length === 0) {
      return res.status(404).json({ error: 'No subscription found' });
    }

    const subscription = subscriptions[0];

    // Cancel subscription at period end
    const updatedSubscription = await stripe.subscriptions.update(subscription.id, {
      cancel_at_period_end: true
    });

    res.json({
      success: true,
      cancelAtPeriodEnd: updatedSubscription.cancel_at_period_end,
      currentPeriodEnd: new Date(updatedSubscription.current_period_end * 1000).toISOString()
    });
  } catch (error) {
    console.error('Subscription cancellation error:', error);
    res.status(500).json({ error: 'Failed to cancel subscription' });
  }
});

// Webhook handler for Stripe events
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.log(`Webhook signature verification failed.`, err);
    return res.sendStatus(400);
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object as Stripe.Checkout.Session;
      console.log('Checkout session completed:', session.id);
      // Here you would update user's subscription status in your database
      break;

    case 'invoice.payment_succeeded':
      const invoice = event.data.object as Stripe.Invoice;
      console.log('Payment succeeded:', invoice.id);
      // Update subscription status to active
      break;

    case 'invoice.payment_failed':
      const failedInvoice = event.data.object as Stripe.Invoice;
      console.log('Payment failed:', failedInvoice.id);
      // Update subscription status to past_due
      break;

    case 'customer.subscription.deleted':
      const subscription = event.data.object as Stripe.Subscription;
      console.log('Subscription deleted:', subscription.id);
      // Update user's subscription status to free
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  // Return a 200 response to acknowledge receipt of the event
  res.send({ received: true });
});

export default router;
