import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import postgres from "postgres";
import { migrateLocal } from "../tests/localDatabase";
import { createServer, type Server } from "node:http";
import { readFileSync } from "node:fs";
import type Stripe from "stripe";

const fixtures = vi.hoisted(() => ({
  failAi: false,
  providerCalls: 0,
  verified: true,
  subscription: null as any,
  identity: `rehearsal-${crypto.randomUUID()}-${"x".repeat(64)}`,
  mediaUrl: "",
  checkoutId: `cs_${crypto.randomUUID()}`,
  invoiceId: `in_${crypto.randomUUID()}`,
}));
vi.mock("./_core/firebase", () => ({
  verifyFirebaseToken: async (token: string) => {
    if (token !== "fictional-valid-token")
      throw { code: "auth/invalid-id-token" };
    return {
      uid: fixtures.identity,
      email: "fictional@example.test",
      email_verified: fixtures.verified,
    };
  },
}));
vi.mock("./storage", async importOriginal => {
  const real = await importOriginal<typeof import("./storage")>();
  return {
    ...real,
    ownedImageDataUrl: async (uid: string, url: string) => {
      real.assertOwnedImageUrl(uid, url);
      return "data:image/jpeg;base64,/9j/2Q==";
    },
    storagePut: async (key: string) => ({
      key,
      url: real.publicObjectUrl(key),
    }),
  };
});
// Exercise the real AI request builder, schemas, pipeline and persistence. Only
// the outbound transport is replaced. No AI, Blob or Stripe network requests.
vi.mock("./_core/env", () => ({
  ENV: {
    firebaseProjectId: "foreverhome-test",
    storageBucket: "foreverhome-test-media",
    openaiApiKey: "fictional-key",
    openaiBaseUrl: "https://fictional-ai.example/v1",
    openaiModel: "gpt-4.1-mini",
  },
}));

const testUrl = process.env.REVIVE_TEST_DATABASE_URL;
if (testUrl) {
  const parsed = new URL(testUrl);
  if (
    parsed.hostname !== "127.0.0.1" ||
    parsed.pathname !== "/foreverhome_rehearsal"
  )
    throw new Error("Requires dedicated local rehearsal database");
  process.env.DATABASE_URL = testUrl;
}

describe.runIf(Boolean(testUrl))(
  "ForeverHome local database and HTTP rehearsal",
  () => {
    let sql: postgres.Sql;
    let server: Server;
    let origin: string;
    let db: typeof import("./db");
    let credits: typeof import("./credits");
    let billing: typeof import("./billing");
    let stripe: typeof import("./stripe").stripe;
    const realFetch = globalThis.fetch;
    const token = { Authorization: "Bearer fictional-valid-token" };

    beforeAll(async () => {
      sql = postgres(testUrl!, { max: 3 });
      await migrateLocal(sql);
      const storage = await import("./storage");
      fixtures.mediaUrl = storage.publicObjectUrl(
        `${storage.userUploadPrefix(fixtures.identity)}fictional.jpg`
      );
      db = await import("./db");
      credits = await import("./credits");
      billing = await import("./billing");
      stripe = (await import("./stripe")).stripe;
      vi.spyOn(stripe!.subscriptions, "retrieve").mockImplementation(
        async () => fixtures.subscription
      );
      vi.stubGlobal("fetch", async (input: any, init: any) => {
        if (!String(input).startsWith("https://fictional-ai.example/"))
          return realFetch(input, init);
        fixtures.providerCalls++;
        if (fixtures.failAi)
          return new Response("provider failure", { status: 503 });
        const request = JSON.parse(init.body);
        for (const message of request.messages ?? [])
          if (Array.isArray(message.content))
            for (const part of message.content)
              if (part.type === "image_url")
                expect(part.image_url.url).toMatch(/^data:image\/jpeg;base64,/);

        expect(request).not.toHaveProperty("thinking");
        const schema = request.response_format?.json_schema;
        const data =
          schema?.name === "photo_quality_check"
            ? {
                isAcceptable: true,
                score: 90,
                issues: [],
                suggestions: [],
                canProceed: true,
              }
            : schema?.name === "vision_analysis"
              ? {
                  posture: "Relaxed",
                  facialExpression: "Soft",
                  environmentalContext: "Quiet room",
                  confidence: 85,
                }
              : schema?.name === "context_enrichment"
                ? { breedTraits: "Mixed", ageConsiderations: "Adult" }
                : schema?.name === "behavior_synthesis"
                  ? {
                      primaryBehavior: "Content",
                      confidence: 80,
                      reasoning: "Relaxed posture",
                      alternativeInterpretations: [],
                    }
                  : schema?.name === "recommendations"
                    ? {
                        actions: ["Allow quiet rest"],
                        safetyWarnings: [],
                        vetConsultation: false,
                      }
                    : null;
        if (schema?.strict)
          expect(schema.schema.required).toEqual(
            expect.arrayContaining(Object.keys(schema.schema.properties))
          );
        return Response.json({
          choices: [
            {
              message: {
                content: data
                  ? JSON.stringify(data)
                  : "I feel relaxed in this quiet room.",
              },
            },
          ],
        });
      });
      const { createApp } = await import("./_core/app");
      server = createServer(await createApp());
      await new Promise<void>(resolve =>
        server.listen(0, "127.0.0.1", resolve)
      );
      origin = `http://127.0.0.1:${(server.address() as any).port}`;
    });
    afterAll(async () => {
      vi.unstubAllGlobals();
      if (server)
        await new Promise<void>(resolve => server.close(() => resolve()));
      if (db) await db.closeDatabase();
      if (sql) await sql.end();
    });

    it("rejects anonymous upload, admin export and analysis requests", async () => {
      for (const [path, method] of [
        ["/api/upload", "POST"],
        ["/api/admin/export?type=users", "GET"],
        ["/api/analysis/stream", "POST"],
      ]) {
        expect((await fetch(origin + path, { method })).status).toBe(401);
      }
    });
    it("creates the account from verified token identity through HTTP", async () => {
      const response = await fetch(origin + "/api/trpc/auth.me", {
        headers: token,
      });
      expect(response.status).toBe(200);
      expect((await response.json()).result.data.json.id).toBe(
        fixtures.identity
      );
      expect((await db.getUser(fixtures.identity))?.credits).toBe(3);
    });
    it("blocks regular users from admin data and forged tokens", async () => {
      expect(
        (
          await fetch(origin + "/api/admin/export?type=users", {
            headers: token,
          })
        ).status
      ).toBe(403);
      expect(
        (
          await fetch(origin + "/api/upload", {
            method: "POST",
            headers: { Authorization: "Bearer forged" },
          })
        ).status
      ).toBe(401);
    });
    it("uploads a fictional photo through authenticated multipart HTTP", async () => {
      const form = new FormData();
      form.append(
        "file",
        new Blob([new Uint8Array([255, 216, 255, 217])], {
          type: "image/jpeg",
        }),
        "fictional.jpg"
      );
      const response = await fetch(origin + "/api/upload", {
        method: "POST",
        headers: token,
        body: form,
      });
      expect(response.status).toBe(200);
      expect((await response.json()).url).toMatch(
        /^https:\/\/storage.googleapis.com\/foreverhome-test-media\/uploads\//
      );
    });
    it("saves pet and analysis and emits one completion with a stored result ID", async () => {
      const pet = await db.createPet(fixtures.identity, {
        name: "Fictional Buddy",
        species: "dog",
      });
      const response = await fetch(origin + "/api/analysis/stream", {
        method: "POST",
        headers: { ...token, "Content-Type": "application/json" },
        body: JSON.stringify({
          petId: pet.id,
          mediaUrl: fixtures.mediaUrl,
          mediaType: "image",
        }),
      });
      expect(response.status).toBe(200);
      const events = (await response.text())
        .trim()
        .split("\n\n")
        .map(line => JSON.parse(line.slice(6)));
      const completed = events.filter(event => event.stage === "complete");
      expect(completed).toHaveLength(1);
      expect(completed[0].analysisId).toBeTruthy();
      const saved = await db.getAnalysis(completed[0].analysisId);
      expect(saved?.personalityVoice).toBe(
        "I feel relaxed in this quiet room."
      );
      expect(saved?.petId).toBe(pet.id);
      expect(await credits.getUserCredits(fixtures.identity)).toBe(2);
    });
    it("refunds an AI failure through the same HTTP stream", async () => {
      const [pet] = await db.getUserPets(fixtures.identity);
      fixtures.failAi = true;
      const response = await fetch(origin + "/api/analysis/stream", {
        method: "POST",
        headers: { ...token, "Content-Type": "application/json" },
        body: JSON.stringify({
          petId: pet.id,
          mediaUrl: fixtures.mediaUrl,
          mediaType: "image",
        }),
      });
      expect(await response.text()).toContain('"stage":"error"');
      fixtures.failAi = false;
      expect(await credits.getUserCredits(fixtures.identity)).toBe(2);
    });
    it("denies zero-credit users at every HTTP AI entry without calling transport", async () => {
      const [pet] = await db.getUserPets(fixtures.identity);
      const before = fixtures.providerCalls;
      await sql`update users set credits=0 where id=${fixtures.identity}`;
      for (const [name, input] of [
        ["pets.identifyBreed", { imageUrl: fixtures.mediaUrl, species: "dog" }],
        ["analysis.validatePhoto", { imageUrl: fixtures.mediaUrl }],
        [
          "analysis.create",
          { petId: pet.id, mediaUrl: fixtures.mediaUrl, mediaType: "image" },
        ],
      ]) {
        const response = await fetch(origin + "/api/trpc/" + name, {
          method: "POST",
          headers: { ...token, "Content-Type": "application/json" },
          body: JSON.stringify({ json: input }),
        });
        expect(response.status).toBe(403);
      }
      const response = await fetch(origin + "/api/analysis/stream", {
        method: "POST",
        headers: { ...token, "Content-Type": "application/json" },
        body: JSON.stringify({
          petId: pet.id,
          mediaUrl: fixtures.mediaUrl,
          mediaType: "image",
        }),
      });
      expect(await response.text()).toContain("Insufficient credits");
      expect(fixtures.providerCalls).toBe(before);
      await sql`update users set credits=2 where id=${fixtures.identity}`;
    });
    it("reuses a valid quality result without another helper debit or provider call", async () => {
      const before = fixtures.providerCalls;
      for (let n = 0; n < 2; n++) {
        const response = await fetch(
          origin + "/api/trpc/analysis.validatePhoto",
          {
            method: "POST",
            headers: { ...token, "Content-Type": "application/json" },
            body: JSON.stringify({ json: { imageUrl: fixtures.mediaUrl } }),
          }
        );
        expect(response.status).toBe(200);
        expect((await response.json()).result.data.json.score).toBe(90);
      }
      expect(fixtures.providerCalls - before).toBe(1);
      expect(await credits.getUserCredits(fixtures.identity)).toBe(2);
      const [row] =
        await sql`select helpers from ai_usage_daily where subject_id=${fixtures.identity}`;
      expect(row.helpers).toBe(1);
    });
    it("kill switch blocks all HTTP AI routes including cached quality", async () => {
      const before = fixtures.providerCalls;
      const [pet] = await db.getUserPets(fixtures.identity);
      process.env.AI_DISABLED = "true";
      try {
        for (const [name, input] of [
          [
            "pets.identifyBreed",
            { imageUrl: fixtures.mediaUrl, species: "dog" },
          ],
          ["analysis.validatePhoto", { imageUrl: fixtures.mediaUrl }],
          [
            "analysis.create",
            { petId: pet.id, mediaUrl: fixtures.mediaUrl, mediaType: "image" },
          ],
        ]) {
          const response = await fetch(origin + "/api/trpc/" + name, {
            method: "POST",
            headers: { ...token, "Content-Type": "application/json" },
            body: JSON.stringify({ json: input }),
          });
          expect(response.status).toBe(403);
        }
        const response = await fetch(origin + "/api/analysis/stream", {
          method: "POST",
          headers: { ...token, "Content-Type": "application/json" },
          body: JSON.stringify({
            petId: pet.id,
            mediaUrl: fixtures.mediaUrl,
            mediaType: "image",
          }),
        });
        expect(await response.text()).toContain("AI is currently unavailable");
        expect(fixtures.providerCalls).toBe(before);
      } finally {
        delete process.env.AI_DISABLED;
      }
    });
    it("unverified token is denied before all HTTP AI entry points", async () => {
      fixtures.verified = false;
      try {
        for (const path of [
          "/api/trpc/analysis.create",
          "/api/trpc/analysis.validatePhoto",
          "/api/trpc/pets.identifyBreed",
          "/api/analysis/stream",
        ])
          expect(
            (
              await fetch(origin + path, {
                method: "POST",
                headers: { ...token, "Content-Type": "application/json" },
                body: "{}",
              })
            ).status
          ).toBe(401);
      } finally {
        fixtures.verified = true;
      }
    });
    it("completes the real mocked pipeline using exactly the last available credit", async () => {
      const [pet] = await db.getUserPets(fixtures.identity);
      await sql`update users set credits=1 where id=${fixtures.identity}`;
      const before = fixtures.providerCalls;
      const response = await fetch(origin + "/api/analysis/stream", {
        method: "POST",
        headers: { ...token, "Content-Type": "application/json" },
        body: JSON.stringify({
          petId: pet.id,
          mediaUrl: fixtures.mediaUrl,
          mediaType: "image",
        }),
      });
      const events = (await response.text())
        .split("\n\n")
        .filter(Boolean)
        .map(line => JSON.parse(line.slice(6)));
      const completed = events.filter(e => e.stage === "complete");
      expect(completed).toHaveLength(1);
      expect(
        (await db.getAnalysis(completed[0].analysisId))?.personalityVoice
      ).toBeTruthy();
      expect(await credits.getUserCredits(fixtures.identity)).toBe(0);
      expect(fixtures.providerCalls - before).toBe(5);
      await sql`update users set credits=2 where id=${fixtures.identity}`;
    });
    it("retains the 4MB multipart contract and rejects extra fields", async () => {
      const bytes = new Uint8Array(4 * 1024 * 1024);
      bytes.set([255, 216, 255]);
      const form = new FormData();
      form.append(
        "file",
        new Blob([bytes], { type: "image/jpeg" }),
        "fixture.jpg"
      );
      expect(
        (
          await fetch(origin + "/api/upload", {
            method: "POST",
            headers: token,
            body: form,
          })
        ).status
      ).toBe(200);
      for (const extra of [false, true]) {
        const bad = new FormData();
        bad.append(
          "file",
          new Blob([extra ? bytes : new Uint8Array(bytes.length + 1)], {
            type: "image/jpeg",
          }),
          "fixture.jpg"
        );
        if (extra) bad.append("unexpected", "text");
        expect(
          (
            await fetch(origin + "/api/upload", {
              method: "POST",
              headers: token,
              body: bad,
            })
          ).status
        ).toBe(413);
      }
    });
    it("owner analytics executes on PostgreSQL without fabricated metrics", async () => {
      await sql`update users set role='admin' where id=${fixtures.identity}`;
      try {
        const response = await fetch(origin + "/api/admin/analytics", {
          headers: token,
        });
        expect(response.status).toBe(200);
        const stats = await response.json();
        expect(stats.totalUsers).toBeGreaterThan(0);
        expect(stats.monthlyGrowth).toBeNull();
        expect(stats.recentActivity).toEqual([]);
      } finally {
        await sql`update users set role='user' where id=${fixtures.identity}`;
      }
    });
    it("exposes a non-reserved liveness endpoint", async () => {
      expect(await (await fetch(origin + "/health")).json()).toEqual({
        ok: true,
      });
    });
    it("allows only one concurrent claim for the last credit", async () => {
      await sql`update users set credits=1 where id=${fixtures.identity}`;
      const attempts = await Promise.all(
        Array.from({ length: 8 }, () =>
          credits.reserveAnalysisCredit(fixtures.identity)
        )
      );
      expect(attempts.filter(attempt => attempt.charged)).toHaveLength(1);
      expect(await credits.getUserCredits(fixtures.identity)).toBe(0);
    });
    it("verifies a raw signed webhook and grants a credit pack once across retries", async () => {
      const event = {
        id: "evt_fictional",
        type: "checkout.session.completed",
        data: {
          object: {
            id: fixtures.checkoutId,
            mode: "payment",
            payment_status: "paid",
            amount_total: 499,
            currency: "usd",
            metadata: { userId: fixtures.identity, packId: "starter" },
          },
        },
      };
      const payload = JSON.stringify(event);
      const signature = stripe!.webhooks.generateTestHeaderString({
        payload,
        secret: process.env.STRIPE_WEBHOOK_SECRET!,
      });
      expect(
        (
          await fetch(origin + "/api/stripe/webhook", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "stripe-signature": "bad",
            },
            body: payload,
          })
        ).status
      ).toBe(400);
      for (let n = 0; n < 3; n++)
        expect(
          (
            await fetch(origin + "/api/stripe/webhook", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "stripe-signature": signature,
              },
              body: payload,
            })
          ).status
        ).toBe(200);
      expect(await credits.getUserCredits(fixtures.identity)).toBe(10);
      expect(
        await sql`select * from purchases where "stripePaymentId"=${fixtures.checkoutId}`
      ).toHaveLength(1);
    });
    it("rejects even a correctly signed live event without granting credits", async () => {
      const before = await credits.getUserCredits(fixtures.identity);
      const payload = JSON.stringify({
        id: "evt_live_fictional",
        type: "checkout.session.completed",
        livemode: true,
        data: { object: {} },
      });
      const signature = stripe!.webhooks.generateTestHeaderString({
        payload,
        secret: process.env.STRIPE_WEBHOOK_SECRET!,
      });
      const response = await fetch(origin + "/api/stripe/webhook", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "stripe-signature": signature,
        },
        body: payload,
      });
      expect(response.status).toBe(400);
      expect(await credits.getUserCredits(fixtures.identity)).toBe(before);
    });
    it("grants a paid subscription once and respects its expiry", async () => {
      fixtures.subscription = {
        id: "sub_fictional",
        status: "active",
        metadata: { userId: fixtures.identity, planId: "premium" },
        items: {
          data: [{ current_period_end: Math.floor(Date.now() / 1000) + 3600 }],
        },
      };
      const event = {
        type: "invoice.paid",
        data: {
          object: {
            id: fixtures.invoiceId,
            parent: { subscription_details: { subscription: "sub_fictional" } },
          },
        },
      } as Stripe.Event;
      await billing.fulfillBillingEvent(event);
      await billing.fulfillBillingEvent(event);
      expect(await credits.reserveAnalysisCredit(fixtures.identity)).toEqual({
        allowed: true,
        charged: false,
      });
      await sql`update users set "subscriptionEndDate"=now()-interval '1 second', credits=0 where id=${fixtures.identity}`;
      expect(await credits.reserveAnalysisCredit(fixtures.identity)).toEqual({
        allowed: false,
        charged: false,
      });
    });
    it("enables RLS for every app table", async () => {
      const rows =
        await sql`select relname from pg_class where relnamespace='public'::regnamespace and relkind='r' and not relrowsecurity`;
      expect(rows).toHaveLength(0);
    });
  }
);
