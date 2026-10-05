import { eq, and, gt, lte, gte, sql } from "drizzle-orm";
import { getDb } from "./db";
import { users, purchases, betaCodes, InsertPurchase, InsertBetaCode, type User } from "../drizzle/schema";
import { nanoid } from "nanoid";

export function hasUnlimitedCredits(user: User): boolean {
  const active = user.subscriptionStatus === "active" && !!user.subscriptionEndDate && user.subscriptionEndDate > new Date();
  return user.isBetaTester || (active && ["premium", "shelter", "realtime", "ultimate"].includes(user.subscriptionPlan ?? ""));
}

export async function reserveAnalysisCredit(userId: string): Promise<{ allowed: boolean; charged: boolean }> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!user) return { allowed: false, charged: false };
  if (hasUnlimitedCredits(user)) {
    return { allowed: true, charged: false };
  }
  const rows = await db.update(users)
    .set({ credits: sql`${users.credits} - 1` })
    .where(and(eq(users.id, userId), gte(users.credits, 1)))
    .returning({ id: users.id });
  return { allowed: rows.length > 0, charged: rows.length > 0 };
}

export async function refundAnalysisCredit(userId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(users).set({ credits: sql`${users.credits} + 1` }).where(eq(users.id, userId));
}

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
 * Validate and get beta code from database
 */
export async function validateBetaCode(code: string): Promise<{ valid: boolean; betaCode?: typeof betaCodes.$inferSelect }> {
  const db = await getDb();
  if (!db) return { valid: false };

  // Normalize code (uppercase, trim)
  const normalizedCode = code.trim().toUpperCase();

  // Find code in database
  const result = await db
    .select()
    .from(betaCodes)
    .where(eq(betaCodes.code, normalizedCode))
    .limit(1);

  if (result.length === 0) {
    return { valid: false };
  }

  const betaCode = result[0];

  // Check if code is active
  if (betaCode.status !== "active") {
    return { valid: false };
  }

  // Check if code has expired
  if (betaCode.expiresAt && new Date(betaCode.expiresAt) < new Date()) {
    // Auto-mark as expired
    await db
      .update(betaCodes)
      .set({ status: "expired", updatedAt: new Date() })
      .where(eq(betaCodes.id, betaCode.id));
    return { valid: false };
  }

  // Check if code has reached max uses
  if (betaCode.maxUses && betaCode.uses >= betaCode.maxUses) {
    return { valid: false };
  }

  return { valid: true, betaCode };
}

/**
 * Activate beta tester status with invite code
 */
export async function activateBetaTester(userId: string, inviteCode: string): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  // Validate code
  const { valid, betaCode } = await validateBetaCode(inviteCode);
  if (!valid || !betaCode) {
    return false;
  }

  // Check if user already has beta status
  const userResult = await db
    .select({ isBetaTester: users.isBetaTester })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (userResult.length > 0 && userResult[0].isBetaTester) {
    // User already has beta status, but still mark code as used
    await incrementBetaCodeUsage(betaCode.id);
    return true;
  }

  // Activate beta tester status
  await db
    .update(users)
    .set({
      isBetaTester: true,
      betaInviteCode: inviteCode.trim().toUpperCase(),
      credits: 999999, // Effectively unlimited
    })
    .where(eq(users.id, userId));

  // Increment code usage
  await incrementBetaCodeUsage(betaCode.id);

  // If code is single-use and now used, mark as used
  if (betaCode.maxUses === 1 || (betaCode.maxUses && betaCode.uses + 1 >= betaCode.maxUses)) {
    await db
      .update(betaCodes)
      .set({ status: "used", updatedAt: new Date() })
      .where(eq(betaCodes.id, betaCode.id));
  }

  return true;
}

/**
 * Increment usage count for a beta code
 */
async function incrementBetaCodeUsage(codeId: string): Promise<void> {
  const db = await getDb();
  if (!db) return;

  // Get current usage count
  const result = await db
    .select({ uses: betaCodes.uses })
    .from(betaCodes)
    .where(eq(betaCodes.id, codeId))
    .limit(1);

  if (result.length === 0) return;

  const currentUses = result[0].uses || 0;

  // Increment usage
  await db
    .update(betaCodes)
    .set({
      uses: currentUses + 1,
      updatedAt: new Date(),
    })
    .where(eq(betaCodes.id, codeId));
}

/**
 * Generate a new beta code
 */
export async function generateBetaCode(data: {
  createdBy?: string;
  maxUses?: number;
  expiresAt?: Date;
  notes?: string;
}): Promise<string> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Generate unique code: BETA-XXXXX-XXXX
  let code: string;
  let isUnique = false;
  let attempts = 0;

  while (!isUnique && attempts < 10) {
    const randomPart1 = Math.random().toString(36).substring(2, 7).toUpperCase();
    const randomPart2 = Math.random().toString(36).substring(2, 6).toUpperCase();
    code = `BETA-${randomPart1}-${randomPart2}`;

    // Check if code already exists
    const existing = await db
      .select()
      .from(betaCodes)
      .where(eq(betaCodes.code, code))
      .limit(1);

    if (existing.length === 0) {
      isUnique = true;
    }
    attempts++;
  }

  if (!isUnique) {
    throw new Error("Failed to generate unique beta code after 10 attempts");
  }

  const codeId = nanoid();
  const betaCode: InsertBetaCode = {
    id: codeId,
    code: code!,
    createdBy: data.createdBy,
    maxUses: data.maxUses || 1,
    uses: 0,
    status: "active",
    expiresAt: data.expiresAt,
    notes: data.notes,
  };

  await db.insert(betaCodes).values(betaCode);

  return code!;
}

/**
 * Get all beta codes (admin function)
 */
export async function getAllBetaCodes(): Promise<Array<typeof betaCodes.$inferSelect>> {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(betaCodes).orderBy(betaCodes.createdAt);
}

/**
 * Revoke a beta code
 */
export async function revokeBetaCode(codeId: string): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db
    .update(betaCodes)
    .set({ status: "revoked", updatedAt: new Date() })
    .where(eq(betaCodes.id, codeId));
}
