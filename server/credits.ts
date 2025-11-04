import { eq } from "drizzle-orm";
import { getDb } from "./db";
import { users, purchases, InsertPurchase } from "../drizzle/schema";
import { nanoid } from "nanoid";

/**
 * Get user's current credit balance
 */
export async function getUserCredits(userId: string): Promise<number> {
  const db = await getDb();
  if (!db) return 0;

  const result = await db.select({ credits: users.credits }).from(users).where(eq(users.id, userId)).limit(1);

  return result.length > 0 ? result[0].credits || 0 : 0;
}

/**
 * Check if user is a beta tester
 */
export async function isBetaTester(userId: string): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  const result = await db
    .select({ isBetaTester: users.isBetaTester })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  return result.length > 0 ? result[0].isBetaTester || false : false;
}

/**
 * Add credits to user account
 */
export async function addCredits(userId: string, credits: number): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db
    .update(users)
    .set({
      credits: (await getUserCredits(userId)) + credits,
    })
    .where(eq(users.id, userId));
}

/**
 * Deduct credits from user account
 * Returns true if successful, false if insufficient credits
 */
export async function deductCredits(userId: string, credits: number = 1): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  // Check if beta tester (unlimited credits)
  if (await isBetaTester(userId)) {
    return true;
  }

  const currentCredits = await getUserCredits(userId);

  if (currentCredits < credits) {
    return false;
  }

  await db
    .update(users)
    .set({
      credits: currentCredits - credits,
    })
    .where(eq(users.id, userId));

  return true;
}

/**
 * Record a purchase
 */
export async function createPurchase(data: {
  userId: string;
  stripePaymentId?: string;
  amount: number;
  credits: number;
  status?: "pending" | "completed" | "failed";
}): Promise<string> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const purchaseId = nanoid();

  const purchase: InsertPurchase = {
    id: purchaseId,
    userId: data.userId,
    stripePaymentId: data.stripePaymentId,
    amount: data.amount.toString(), // Convert number to string for decimal type
    credits: data.credits,
    status: data.status || "pending",
  };

  await db.insert(purchases).values(purchase);

  return purchaseId;
}

/**
 * Complete a purchase and add credits
 */
export async function completePurchase(purchaseId: string): Promise<void> {
  const db = await getDb();
  if (!db) return;

  // Get purchase details
  const result = await db.select().from(purchases).where(eq(purchases.id, purchaseId)).limit(1);

  if (result.length === 0) {
    throw new Error("Purchase not found");
  }

  const purchase = result[0];

  // Update purchase status
  await db
    .update(purchases)
    .set({ status: "completed" })
    .where(eq(purchases.id, purchaseId));

  // Add credits to user
  await addCredits(purchase.userId, purchase.credits);
}

/**
 * Mark a purchase as failed
 */
export async function failPurchase(purchaseId: string): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db
    .update(purchases)
    .set({ status: "failed" })
    .where(eq(purchases.id, purchaseId));
}

/**
 * Refresh free tier credits (monthly)
 * Called by a cron job or when user logs in
 */
export async function refreshFreeCredits(userId: string): Promise<void> {
  const db = await getDb();
  if (!db) return;

  // Don't refresh for beta testers (they have unlimited)
  if (await isBetaTester(userId)) {
    return;
  }

  const result = await db
    .select({ lastCreditRefresh: users.lastCreditRefresh })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (result.length === 0) return;

  const lastRefresh = result[0].lastCreditRefresh;
  if (!lastRefresh) return;

  const now = new Date();
  const daysSinceRefresh = Math.floor((now.getTime() - lastRefresh.getTime()) / (1000 * 60 * 60 * 24));

  // Refresh if it's been 30+ days
  if (daysSinceRefresh >= 30) {
    await db
      .update(users)
      .set({
        credits: 3, // Reset to 3 free credits
        lastCreditRefresh: now,
      })
      .where(eq(users.id, userId));
  }
}

/**
 * Activate beta tester status with invite code
 */
export async function activateBetaTester(userId: string, inviteCode: string): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  // Verify invite code is valid (you'll need to implement invite code generation)
  // For now, we'll just check if it starts with "BETA-"
  if (!inviteCode.startsWith("BETA-")) {
    return false;
  }

  await db
    .update(users)
    .set({
      isBetaTester: true,
      betaInviteCode: inviteCode,
      credits: 999999, // Effectively unlimited
    })
    .where(eq(users.id, userId));

  return true;
}

