import Stripe from "stripe";

// Initialize Stripe (will need STRIPE_SECRET_KEY in environment)
export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-09-30.clover",
    })
  : null;

/**
 * Credit pack pricing
 */
export const CREDIT_PACKS = {
  starter: {
    id: "starter",
    name: "Starter Pack",
    credits: 10,
    price: 499, // $4.99 in cents
    priceDisplay: "$4.99",
    perAnalysis: "$0.50",
  },
  value: {
    id: "value",
    name: "Value Pack",
    credits: 25,
    price: 999, // $9.99 in cents
    priceDisplay: "$9.99",
    perAnalysis: "$0.40",
    badge: "BEST VALUE",
  },
  power: {
    id: "power",
    name: "Power Pack",
    credits: 60,
    price: 1999, // $19.99 in cents
    priceDisplay: "$19.99",
    perAnalysis: "$0.33",
  },
} as const;

export type CreditPackId = keyof typeof CREDIT_PACKS;

/**
 * Subscription plans
 */
export const SUBSCRIPTION_PLANS = {
  essential: {
    id: "essential",
    name: "Essential",
    price: 999, // $9.99/month in cents
    priceDisplay: "$9.99",
    interval: "month" as const,
    features: [
      "15 analyses per month",
      "Breed identification",
      "Reminders & notifications",
      "Email support",
      "Pet timeline",
    ],
    analysisLimit: 15,
  },
  premium: {
    id: "premium",
    name: "Premium",
    price: 1999, // $19.99/month in cents
    priceDisplay: "$19.99",
    interval: "month" as const,
    features: [
      "Unlimited analyses",
      "Priority support",
      "Advanced insights",
      "Multi-pet comparison",
      "Medical records storage",
      "All Essential features",
    ],
    analysisLimit: -1, // unlimited
    badge: "POPULAR",
  },
  shelter: {
    id: "shelter",
    name: "Shelter Partner",
    price: 9900, // $99/3 months = $33/month in cents (billed quarterly)
    priceDisplay: "$99",
    interval: "quarter" as const,
    features: [
      "Everything in Premium",
      "3-month commitment",
      "$10 donation to shelter",
      "Tax-deductible portion",
      "Perfect for new adopters",
    ],
    analysisLimit: -1,
    shelterDonation: 1000, // $10 in cents
  },
} as const;

export type SubscriptionPlanId = keyof typeof SUBSCRIPTION_PLANS;

/**
 * Create a Stripe checkout session for credit purchase
 */
export async function createCheckoutSession(
  userId: string,
  packId: CreditPackId,
  successUrl: string,
  cancelUrl: string
): Promise<string | null> {
  if (!stripe) {
    console.error("[Stripe] Stripe not initialized - missing STRIPE_SECRET_KEY");
    return null;
  }

  const pack = CREDIT_PACKS[packId];

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: pack.name,
              description: `${pack.credits} InterpWhat analysis credits`,
            },
            unit_amount: pack.price,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: successUrl,
      cancel_url: cancelUrl,
      client_reference_id: userId,
      metadata: {
        userId,
        packId,
        credits: pack.credits.toString(),
      },
    });

    return session.url;
  } catch (error) {
    console.error("[Stripe] Failed to create checkout session:", error);
    return null;
  }
}

/**
 * Create a Stripe checkout session for subscription
 */
export async function createSubscriptionCheckout(
  userId: string,
  planId: SubscriptionPlanId,
  successUrl: string,
  cancelUrl: string
): Promise<string | null> {
  if (!stripe) {
    console.error("[Stripe] Stripe not initialized - missing STRIPE_SECRET_KEY");
    return null;
  }

  const plan = SUBSCRIPTION_PLANS[planId];

  try {
    // Create or retrieve customer
    const customers = await stripe.customers.list({ limit: 1, email: userId });
    let customerId: string;

    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    } else {
      const customer = await stripe.customers.create({
        metadata: { userId },
      });
      customerId = customer.id;
    }

    // Determine billing interval
    const interval = plan.interval === "quarter" ? "month" : plan.interval;
    const intervalCount = plan.interval === "quarter" ? 3 : 1;

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `InterpWhat ${plan.name}`,
              description: plan.features.join(", "),
            },
            unit_amount: plan.price,
            recurring: {
              interval,
              interval_count: intervalCount,
            },
          },
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: successUrl,
      cancel_url: cancelUrl,
      client_reference_id: userId,
      metadata: {
        userId,
        planId,
      },
    });

    return session.url;
  } catch (error) {
    console.error("[Stripe] Failed to create subscription checkout:", error);
    return null;
  }
}

/**
 * Verify webhook signature
 */
export function constructWebhookEvent(payload: string | Buffer, signature: string) {
  if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET) {
    throw new Error("Stripe not configured");
  }

  return stripe.webhooks.constructEvent(payload, signature, process.env.STRIPE_WEBHOOK_SECRET);
}

