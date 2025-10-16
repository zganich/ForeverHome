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
 * Verify webhook signature
 */
export function constructWebhookEvent(payload: string | Buffer, signature: string) {
  if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET) {
    throw new Error("Stripe not configured");
  }

  return stripe.webhooks.constructEvent(payload, signature, process.env.STRIPE_WEBHOOK_SECRET);
}

