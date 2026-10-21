import { AsyncLocalStorage } from "node:async_hooks";
import { createHash, randomUUID } from "node:crypto";
import { TRPCError } from "@trpc/server";
import { and, eq, gt, sql } from "drizzle-orm";
import { aiRequests, aiUsageDaily, users } from "../drizzle/schema";
import { getDb } from "./db";
import { ENV } from "./_core/env";

type Database = NonNullable<Awaited<ReturnType<typeof getDb>>>;
type Tx = Parameters<Parameters<Database["transaction"]>[0]>[0];
type Kind = "analysis" | "quality" | "breed";
type Permit = { id: string; userId: string; token: string };
const identity = new AsyncLocalStorage<string>();
const operation = new AsyncLocalStorage<Permit>();
const leaseMs = 120_000; // Renewed before each <=40s transport attempt.

// Only authenticated HTTP middleware establishes this server-side context.
// Neither endpoint inputs nor the browser can supply an admission permit.
export function withAiIdentity<T>(userId: string, work: () => T): T {
  return identity.run(userId, work);
}

export function aiLimits() {
  const disabled = process.env.AI_DISABLED ?? "false";
  if (disabled !== "false") deny("AI is currently unavailable.", "FORBIDDEN");
  const read = (name: string, fallback: number) => {
    const value = process.env[name];
    if (value === undefined) return fallback;
    if (
      !/^[1-9]\d*$/.test(value) ||
      !Number.isSafeInteger(Number(value)) ||
      Number(value) > fallback
    )
      deny("AI configuration is unavailable.", "SERVICE_UNAVAILABLE");
    return Number(value);
  };
  return {
    concurrent: read("AI_USER_IN_FLIGHT", 1),
    analyses: read("AI_USER_DAILY_ANALYSES", 10),
    helpers: read("AI_USER_DAILY_HELPERS", 10),
    userCalls: read("AI_USER_DAILY_PROVIDER_CALLS", 50),
    projectCalls: read("AI_PROJECT_DAILY_PROVIDER_CALLS", 100),
  };
}
function deny(
  message: string,
  code:
    | "FORBIDDEN"
    | "TOO_MANY_REQUESTS"
    | "SERVICE_UNAVAILABLE" = "TOO_MANY_REQUESTS"
): never {
  throw new TRPCError({ code, message });
}
function authenticated(userId: string) {
  if (!userId || identity.getStore() !== userId)
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Verified identity required for AI.",
    });
}
async function locked<T>(
  db: Database,
  work: (tx: Tx, now: Date, day: string) => Promise<T>
) {
  return db.transaction(async tx => {
    // Short DB-only critical section shared by every instance. Never held over
    // provider I/O. A single lock order prevents counter/lease deadlocks.
    await tx.execute(sql`select pg_advisory_xact_lock(178523, 10402)`);
    const [clock] = await tx.execute<{ now: Date; day: string }>(
      sql`select clock_timestamp() as now, (clock_timestamp() at time zone 'UTC')::date::text as day`
    );
    return work(tx, new Date(clock.now), clock.day);
  });
}
async function usage(tx: Tx, scope: string, subjectId: string, day: string) {
  await tx
    .insert(aiUsageDaily)
    .values({ scope, subjectId, usageDay: day })
    .onConflictDoNothing();
  return and(
    eq(aiUsageDaily.scope, scope),
    eq(aiUsageDaily.subjectId, subjectId),
    eq(aiUsageDaily.usageDay, day)
  );
}

// Exported store constructor permits real tests over independent DB pools.
// Runtime always uses the application database, never a caller-provided store.
export function createAdmissionStore(db: Database) {
  return {
    async begin(userId: string, kind: Kind, digest: string) {
      authenticated(userId);
      const limits = aiLimits();
      return locked(db, async (tx, now, day) => {
        const [user] = await tx
          .select({ credits: users.credits })
          .from(users)
          .where(eq(users.id, userId))
          .for("update");
        // Applies even to beta/unlimited accounts and quality cache hits.
        if (!user || user.credits < 1)
          deny("Insufficient credits for AI.", "FORBIDDEN");
        const [cached] =
          kind === "quality"
            ? await tx
                .select()
                .from(aiRequests)
                .where(
                  and(
                    eq(aiRequests.userId, userId),
                    eq(aiRequests.kind, kind),
                    eq(aiRequests.inputDigest, digest)
                  )
                )
            : [];
        if (
          cached?.status === "completed" &&
          cached.cacheExpiresAt &&
          cached.cacheExpiresAt > now &&
          cached.result !== null
        )
          return { cached: true as const, value: cached.result };
        const running = await tx
          .select({ id: aiRequests.id })
          .from(aiRequests)
          .where(
            and(
              eq(aiRequests.userId, userId),
              eq(aiRequests.status, "running"),
              gt(aiRequests.leaseExpiresAt, now)
            )
          );
        if (running.length >= limits.concurrent)
          deny("An AI request is already running. Please retry shortly.");
        const where = await usage(tx, "user", userId, day);
        const column =
          kind === "analysis" ? aiUsageDaily.analyses : aiUsageDaily.helpers;
        const ceiling = kind === "analysis" ? limits.analyses : limits.helpers;
        const claimed = await tx
          .update(aiUsageDaily)
          .set(
            kind === "analysis"
              ? { analyses: sql`${column} + 1` }
              : { helpers: sql`${column} + 1` }
          )
          .where(and(where, sql`${column} < ${ceiling}`))
          .returning();
        if (!claimed.length) deny("Your daily AI allowance has been reached.");
        const id = cached?.id ?? randomUUID(),
          token = randomUUID();
        const values = {
          userId,
          kind,
          inputDigest: digest,
          status: "running" as const,
          leaseToken: token,
          leaseExpiresAt: new Date(now.getTime() + leaseMs),
          result: null,
          cacheExpiresAt: null,
          completedAt: null,
        };
        if (cached)
          await tx.update(aiRequests).set(values).where(eq(aiRequests.id, id));
        else await tx.insert(aiRequests).values({ id, ...values });
        return { cached: false as const, permit: { id, token, userId } };
      });
    },
    async consume(permit: Permit) {
      authenticated(permit.userId);
      const limits = aiLimits();
      await locked(db, async (tx, now, day) => {
        const [lease] = await tx
          .select()
          .from(aiRequests)
          .where(
            and(
              eq(aiRequests.id, permit.id),
              eq(aiRequests.userId, permit.userId),
              eq(aiRequests.leaseToken, permit.token),
              eq(aiRequests.status, "running"),
              gt(aiRequests.leaseExpiresAt, now)
            )
          );
        if (!lease)
          deny("AI admission has expired. Please retry.", "FORBIDDEN");
        for (const [scope, subject, ceiling] of [
          ["project", "foreverhome", limits.projectCalls],
          ["user", permit.userId, limits.userCalls],
        ] as const) {
          const where = await usage(tx, scope, subject, day);
          const rows = await tx
            .update(aiUsageDaily)
            .set({
              providerAttempts: sql`${aiUsageDaily.providerAttempts} + 1`,
            })
            .where(
              and(where, sql`${aiUsageDaily.providerAttempts} < ${ceiling}`)
            )
            .returning();
          if (!rows.length)
            deny(
              "The daily AI provider limit has been reached. Please try another day."
            );
        }
        await tx
          .update(aiRequests)
          .set({ leaseExpiresAt: new Date(now.getTime() + leaseMs) })
          .where(eq(aiRequests.id, permit.id));
      });
    },
    async finish(permit: Permit, success: boolean, result?: unknown) {
      return locked(db, async (tx, now) => {
        const cached = success && result !== undefined;
        if (cached && Buffer.byteLength(JSON.stringify(result)) > 65536)
          throw new Error("AI cache result is too large");
        const rows = await tx
          .update(aiRequests)
          .set({
            status: success ? "completed" : "failed",
            completedAt: now,
            result: cached ? result : null,
            cacheExpiresAt: cached ? new Date(now.getTime() + 86400000) : null,
          })
          .where(
            and(
              eq(aiRequests.id, permit.id),
              eq(aiRequests.userId, permit.userId),
              eq(aiRequests.leaseToken, permit.token),
              eq(aiRequests.status, "running"),
              gt(aiRequests.leaseExpiresAt, now)
            )
          )
          .returning({ id: aiRequests.id });
        if (success && !rows.length)
          deny("AI admission has expired. Please retry.", "FORBIDDEN");
      });
    },
  };
}
async function databaseAction<T>(work: () => Promise<T>): Promise<T> {
  try {
    return await work();
  } catch (error) {
    if (error instanceof TRPCError) throw error;
    throw new TRPCError({
      code: "SERVICE_UNAVAILABLE",
      message: "AI admission database is unavailable.",
    });
  }
}
async function store() {
  const db = await getDb();
  if (!db) deny("AI admission database is unavailable.", "SERVICE_UNAVAILABLE");
  return createAdmissionStore(db);
}

export async function withAiOperation<T>(
  userId: string,
  kind: Kind,
  work: () => Promise<T>,
  digest: string = randomUUID()
) {
  authenticated(userId);
  aiLimits();
  const admission = await store();
  const claim = await databaseAction(() =>
    admission.begin(userId, kind, digest)
  );
  if (claim.cached) return claim.value as T;
  try {
    const result = await operation.run(claim.permit, work);
    await databaseAction(() =>
      admission.finish(
        claim.permit,
        true,
        kind === "quality" ? result : undefined
      )
    );
    return result;
  } catch (error) {
    // Best effort lease close; DB failure leaves a bounded lease, never permits
    // unmetered work. Paid-credit process-death recovery remains out of scope.
    await admission.finish(claim.permit, false).catch(() => undefined);
    throw error;
  }
}

export async function consumeProviderCall() {
  aiLimits();
  const permit = operation.getStore();
  if (!permit) deny("AI admission required.", "FORBIDDEN");
  authenticated(permit.userId);
  const admission = await store();
  await databaseAction(() => admission.consume(permit));
  // Count every attempted transport, including provider errors; no refund.
}

export function qualityDigest(imageData: string) {
  return createHash("sha256")
    .update(
      JSON.stringify([
        "quality-v1",
        ENV.openaiModel,
        ENV.openaiBaseUrl,
        imageData,
      ])
    )
    .digest("hex");
}
