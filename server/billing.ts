import express, { type Express } from "express";
import Stripe from "stripe";
import { eq, sql } from "drizzle-orm";
import { nanoid } from "nanoid";
import { billingReceipts, purchases, users } from "../drizzle/schema";
import { getDb } from "./db";
import {
  constructWebhookEvent,
  CREDIT_PACKS,
  SUBSCRIPTION_PLANS,
  stripe,
} from "./stripe";

export async function fulfillBillingEvent(event: Stripe.Event) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  if (
    event.type === "checkout.session.completed" ||
    event.type === "checkout.session.async_payment_succeeded"
  ) {
    const session = event.data.object as Stripe.Checkout.Session;
    if (session.mode !== "payment" || session.payment_status !== "paid") return;
    const userId = session.metadata?.userId;
    const packId = session.metadata?.packId;
    const pack =
      packId && Object.hasOwn(CREDIT_PACKS, packId)
        ? CREDIT_PACKS[packId as keyof typeof CREDIT_PACKS]
        : undefined;
    if (
      !userId ||
      !pack ||
      session.amount_total !== pack.price ||
      session.currency !== "usd"
    )
      throw new Error("Invalid credit purchase");
    await db.transaction(async tx => {
      const inserted = await tx
        .insert(billingReceipts)
        .values({ id: `checkout:${session.id}` })
        .onConflictDoNothing()
        .returning();
      if (!inserted.length) return;
      const changed = await tx
        .update(users)
        .set({ credits: sql`${users.credits} + ${pack.credits}` })
        .where(eq(users.id, userId))
        .returning();
      if (!changed.length) throw new Error("Purchase user not found");
      await tx.insert(purchases).values({
        id: nanoid(),
        userId,
        stripePaymentId: session.id,
        amount: (pack.price / 100).toFixed(2),
        credits: pack.credits,
        status: "completed",
      });
    });
  } else if (event.type === "invoice.paid") {
    const invoice = event.data.object as Stripe.Invoice;
    const reference = invoice.parent?.subscription_details?.subscription;
    if (!reference) return;
    if (!stripe) throw new Error("Stripe not configured");
    const subscription = await stripe.subscriptions.retrieve(
      typeof reference === "string" ? reference : reference.id
    );
    if (!["active", "trialing"].includes(subscription.status)) return;
    const { userId, planId } = subscription.metadata;
    const plan = Object.hasOwn(SUBSCRIPTION_PLANS, planId ?? "")
      ? SUBSCRIPTION_PLANS[planId as keyof typeof SUBSCRIPTION_PLANS]
      : undefined;
    if (!userId || !plan)
      throw new Error("Subscription account metadata missing");
    const periodEnd = Math.max(
      ...subscription.items.data.map(item => item.current_period_end)
    );
    if (!Number.isFinite(periodEnd))
      throw new Error("Subscription period missing");
    await db.transaction(async tx => {
      const inserted = await tx
        .insert(billingReceipts)
        .values({ id: `invoice:${invoice.id}` })
        .onConflictDoNothing()
        .returning();
      if (!inserted.length) return;
      const changed = await tx
        .update(users)
        .set({
          subscriptionPlan: planId,
          stripeSubscriptionId: subscription.id,
          subscriptionStatus: "active",
          subscriptionEndDate: new Date(periodEnd * 1000),
          // Paid allowance adds to unused purchased credits; unlimited plans use
          // the entitlement check rather than an artificial large balance.
          ...(plan.analysisLimit > 0
            ? { credits: sql`${users.credits} + ${plan.analysisLimit}` }
            : {}),
        })
        .where(eq(users.id, userId))
        .returning();
      if (!changed.length) throw new Error("Subscription user not found");
    });
  } else if (
    event.type === "customer.subscription.deleted" ||
    event.type === "customer.subscription.updated"
  ) {
    const subscription = event.data.object as Stripe.Subscription;
    // Read the latest subscription so out-of-order delivery cannot restore an
    // expired entitlement. Deleted events always revoke it.
    const latest =
      event.type === "customer.subscription.deleted"
        ? subscription
        : await stripe!.subscriptions.retrieve(subscription.id);
    if (["active", "trialing"].includes(latest.status)) return; // invoice.paid grants access
    await db
      .update(users)
      .set({
        subscriptionStatus:
          latest.status === "past_due" ? "past_due" : "canceled",
      })
      .where(eq(users.stripeSubscriptionId, subscription.id));
  }
}

export function registerBillingRoutes(app: Express) {
  // Must be registered before express.json: signature verification needs bytes.
  app.post(
    "/api/stripe/webhook",
    express.raw({ type: "application/json" }),
    async (req, res) => {
      if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET) {
        res.status(503).json({ error: "Billing webhook not configured" });
        return;
      }
      let event: Stripe.Event;
      try {
        const signature = req.headers["stripe-signature"];
        if (typeof signature !== "string" || !Buffer.isBuffer(req.body))
          throw new Error("Missing signature or raw body");
        event = constructWebhookEvent(req.body, signature);
        if (event.livemode) throw new Error("Live Stripe events are disabled");
      } catch {
        res.status(400).json({ error: "Invalid webhook signature" });
        return;
      }
      try {
        await fulfillBillingEvent(event);
        res.json({ received: true });
      } catch {
        res
          .status(503)
          .json({ error: "Fulfillment unavailable; retry delivery" });
      }
    }
  );
}
