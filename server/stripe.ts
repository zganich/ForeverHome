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
    shelterDonationPercent: 10, // 10% to shelters
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
    shelterDonationPercent: 10, // 10% to shelters
  },
  realtime: {
    id: "realtime",
    name: "Real-Time Premium",
    price: 3999, // $39.99/month in cents
    priceDisplay: "$39.99",
    interval: "month" as const,
    features: [
      "5 hours real-time monitoring/month",
      "Unlimited standard analyses",
      "Live behavior insights (< 5 seconds)",
      "All Premium features",
      "Priority support",
      "Advanced analytics",
    ],
    analysisLimit: -1, // unlimited standard analyses
    realtimeHours: 5, // 5 hours per month
    badge: "NEW",
    shelterDonationPercent: 10, // 10% to shelters = $4.00/month
  },
  ultimate: {
    id: "ultimate",
    name: "Ultimate Real-Time",
    price: 7999, // $79.99/month in cents
    priceDisplay: "$79.99",
    interval: "month" as const,
    features: [
      "15 hours real-time monitoring/month",
      "Unlimited standard analyses",
      "Live behavior insights (< 5 seconds)",
      "All Premium features",
      "Advanced analytics dashboard",
      "Priority support",
    ],
    analysisLimit: -1,
    realtimeHours: 15, // 15 hours per month
    badge: "PREMIUM",
    shelterDonationPercent: 10, // 10% to shelters = $8.00/month
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
    shelterDonation: 1000, // $10 in cents (fixed amount)
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
    // Determine billing interval
    const interval = plan.interval === "quarter" ? "month" : plan.interval;
    const intervalCount = plan.interval === "quarter" ? 3 : 1;

    const session = await stripe.checkout.sessions.create({
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
      subscription_data: { metadata: { userId, planId } },
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
