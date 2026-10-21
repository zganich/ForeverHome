import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { randomUUID } from "node:crypto";
import { localTestUrl, migrateLocal } from "../tests/localDatabase";
import {
  aiLimits,
  consumeProviderCall,
  createAdmissionStore,
  qualityDigest,
  withAiIdentity,
  withAiOperation,
} from "./aiAdmission";
import { closeDatabase } from "./db";
import { invokeLLM } from "./_core/llm";
import { generateSpeech } from "./textToSpeech";
const url = localTestUrl();
if (url) process.env.DATABASE_URL = url;
const limitNames = [
  "AI_DISABLED",
  "AI_USER_IN_FLIGHT",
  "AI_USER_DAILY_ANALYSES",
  "AI_USER_DAILY_HELPERS",
  "AI_USER_DAILY_PROVIDER_CALLS",
  "AI_PROJECT_DAILY_PROVIDER_CALLS",
];

describe("AI transport fails closed without admission", () => {
  it("denies direct text, speech and forged operation identities without a provider call", async () => {
    const fetch = vi.fn();
    vi.stubGlobal("fetch", fetch);
    try {
      await expect(invokeLLM({ messages: [] })).rejects.toThrow("admission");
      await expect(generateSpeech("fixture")).rejects.toThrow();
      await expect(
        withAiOperation("unverified", "breed", async () => null)
      ).rejects.toThrow("Verified identity");
      expect(fetch).not.toHaveBeenCalled();
    } finally {
      vi.unstubAllGlobals();
    }
  });
  it("denies malformed kill-switch and limit settings", () => {
    process.env.AI_DISABLED = "FALSE";
    expect(() => aiLimits()).toThrow("unavailable");
    delete process.env.AI_DISABLED;
    process.env.AI_PROJECT_DAILY_PROVIDER_CALLS = "0";
    expect(() => aiLimits()).toThrow("configuration");
    delete process.env.AI_PROJECT_DAILY_PROVIDER_CALLS;
  });
});

describe.runIf(Boolean(url))(
  "DB-backed AI admission across independent pools",
  () => {
    let a: postgres.Sql, b: postgres.Sql;
    let first: ReturnType<typeof createAdmissionStore>,
      second: ReturnType<typeof createAdmissionStore>;
    let uid: string;
    const inIdentity = <T>(work: () => T) => withAiIdentity(uid, work);
    async function begin(
      kind: "analysis" | "breed" | "quality" = "breed",
      digest = randomUUID()
    ) {
      const claim = await inIdentity(() => first.begin(uid, kind, digest));
      if (claim.cached) throw new Error("Unexpected cache hit");
      return claim.permit;
    }
    beforeAll(async () => {
      a = postgres(url!, { max: 3 });
      b = postgres(url!, { max: 3 });
      await migrateLocal(a);
      first = createAdmissionStore(drizzle(a));
      second = createAdmissionStore(drizzle(b));
    });
    beforeEach(async () => {
      for (const name of limitNames) delete process.env[name];
      uid = `admission-${randomUUID()}`;
      await a`insert into users (id, credits) values (${uid}, 3)`;
      await a`update ai_usage_daily set provider_attempts=0 where scope='project'`;
    });
    afterEach(() => {
      for (const name of limitNames) delete process.env[name];
    });
    afterAll(async () => {
      await closeDatabase();
      await a?.end();
      await b?.end();
    });
    it("denies zero-credit users for every kind, including beta/unlimited", async () => {
      for (const entitlement of ["ordinary", "beta", "unlimited"]) {
        await a`update users set credits=0, "isBetaTester"=${entitlement === "beta"}, "subscriptionPlan"=${entitlement === "unlimited" ? "premium" : null}, "subscriptionStatus"='active', "subscriptionEndDate"=now()+interval '1 day' where id=${uid}`;
        for (const kind of ["analysis", "quality", "breed"] as const)
          await expect(
            inIdentity(() => first.begin(uid, kind, randomUUID()))
          ).rejects.toThrow("Insufficient credits");
      }
    });
    it("permits only one in-flight operation across two independent DB pools", async () => {
      const attempts = await Promise.allSettled(
        Array.from({ length: 8 }, (_, i) =>
          inIdentity(() =>
            (i % 2 ? first : second).begin(uid, "breed", randomUUID())
          )
        )
      );
      expect(attempts.filter(x => x.status === "fulfilled")).toHaveLength(1);
    });
    it("enforces the helper allowance across quality and breed", async () => {
      process.env.AI_USER_DAILY_HELPERS = "1";
      const p = await begin("quality");
      await first.finish(p, true, { canProceed: true });
      await expect(
        inIdentity(() => second.begin(uid, "breed", randomUUID()))
      ).rejects.toThrow("daily AI allowance");
    });
    it("enforces the analysis daily admission limit independently", async () => {
      process.env.AI_USER_DAILY_ANALYSES = "1";
      const p = await begin("analysis");
      await first.finish(p, true);
      await expect(
        inIdentity(() => second.begin(uid, "analysis", randomUUID()))
      ).rejects.toThrow("daily AI allowance");
      expect(
        (await inIdentity(() => second.begin(uid, "breed", randomUUID())))
          .cached
      ).toBe(false);
    });
    it("accounts failures, user ceiling and project ceiling transactionally", async () => {
      process.env.AI_USER_DAILY_PROVIDER_CALLS = "1";
      const p = await begin();
      await inIdentity(() => first.consume(p));
      await expect(inIdentity(() => second.consume(p))).rejects.toThrow(
        "provider limit"
      );
      const [row] =
        await a`select provider_attempts from ai_usage_daily where scope='project' and usage_day=(now() at time zone 'UTC')::date`;
      expect(row.provider_attempts).toBe(1); // Failed user increment rolled project increment back.
      await first.finish(p, false);
      const [user] =
        await a`select provider_attempts from ai_usage_daily where subject_id=${uid}`;
      expect(user.provider_attempts).toBe(1); // Failure never returns provider-call allowance.
    });
    it("does not exempt beta or unlimited users from the project ceiling", async () => {
      process.env.AI_PROJECT_DAILY_PROVIDER_CALLS = "1";
      await a`update users set "isBetaTester"=true, "subscriptionPlan"='premium', "subscriptionStatus"='active', "subscriptionEndDate"=now()+interval '1 day' where id=${uid}`;
      const p = await begin();
      await inIdentity(() => first.consume(p));
      const other = `admission-${randomUUID()}`;
      await a`insert into users (id, credits) values (${other}, 3)`;
      const c = await withAiIdentity(other, () =>
        second.begin(other, "analysis", randomUUID())
      );
      if (c.cached) throw new Error("Unexpected cache");
      await expect(
        withAiIdentity(other, () => second.consume(c.permit))
      ).rejects.toThrow("provider limit");
    });
    it("starts a new UTC day without resetting persisted old usage", async () => {
      process.env.AI_PROJECT_DAILY_PROVIDER_CALLS = "1";
      const p = await begin();
      await inIdentity(() => first.consume(p));
      await a`update ai_usage_daily set usage_day=(now() at time zone 'UTC')::date - 1 where scope='project'`;
      await inIdentity(() => second.consume(p));
      const rows =
        await a`select provider_attempts from ai_usage_daily where scope='project'`;
      expect(rows).toHaveLength(2);
      expect(rows.every(r => r.provider_attempts === 1)).toBe(true);
    });
    it("expires abandoned leases and prevents old cleanup from releasing a new lease", async () => {
      const digest = randomUUID(),
        old = await begin("quality", digest);
      await a`update ai_requests set lease_expires_at=now()-interval '1 second' where id=${old.id}`;
      const fresh = await inIdentity(() =>
        second.begin(uid, "quality", digest)
      );
      if (fresh.cached) throw new Error("Unexpected cache");
      await first.finish(old, false);
      await expect(inIdentity(() => first.consume(old))).rejects.toThrow(
        "expired"
      );
      await expect(
        inIdentity(() => second.consume(fresh.permit))
      ).resolves.toBeUndefined();
    });
    it("deduplicates cached quality results, isolates owners and still checks balance and kill switch", async () => {
      const run = vi.fn(async () => {
        await consumeProviderCall();
        return { canProceed: true, score: 90 };
      });
      const digest = qualityDigest("fictional-image");
      const call = () =>
        inIdentity(() => withAiOperation(uid, "quality", run, digest));
      expect(await call()).toEqual(await call());
      expect(run).toHaveBeenCalledTimes(1);
      const [usage] =
        await a`select helpers,provider_attempts from ai_usage_daily where subject_id=${uid}`;
      expect(usage).toMatchObject({ helpers: 1, provider_attempts: 1 });
      process.env.AI_DISABLED = "true";
      await expect(call()).rejects.toThrow("unavailable");
      delete process.env.AI_DISABLED;
      await a`update users set credits=0 where id=${uid}`;
      await expect(call()).rejects.toThrow("Insufficient credits");
      expect(run).toHaveBeenCalledTimes(1);
      const other = `admission-${randomUUID()}`;
      await a`insert into users (id, credits) values (${other}, 3)`;
      expect(
        await withAiIdentity(other, () =>
          second.begin(other, "quality", digest)
        )
      ).toMatchObject({ cached: false });
    });
    it("rejects a second same-image miss while the first is running, then serves cache", async () => {
      const p = await begin("quality", "same-image");
      await expect(
        inIdentity(() => second.begin(uid, "quality", "same-image"))
      ).rejects.toThrow("already running");
      await first.finish(p, true, { score: 90 });
      expect(
        await inIdentity(() => second.begin(uid, "quality", "same-image"))
      ).toMatchObject({ cached: true, value: { score: 90 } });
    });
    it("does not cache provider failures", async () => {
      const work = vi.fn(async () => {
        await consumeProviderCall();
        throw new Error("mock provider failure");
      });
      for (let i = 0; i < 2; i++)
        await expect(
          inIdentity(() =>
            withAiOperation(uid, "quality", work, "failed-image")
          )
        ).rejects.toThrow("mock provider failure");
      expect(work).toHaveBeenCalledTimes(2);
    });
    it("fails closed when the admission table cannot be read", async () => {
      const denied = {
        transaction: () => Promise.reject(new Error("mock DB unavailable")),
      } as any;
      await expect(
        inIdentity(() =>
          createAdmissionStore(denied).begin(uid, "breed", randomUUID())
        )
      ).rejects.toThrow("DB unavailable");
    });
  }
);
