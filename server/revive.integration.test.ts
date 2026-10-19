import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { createServer, type Server } from "node:http";
import { readFileSync } from "node:fs";
import type Stripe from "stripe";

const fixtures = vi.hoisted(() => ({
  failAi: false,
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
      email_verified: true,
    };
  },
}));
vi.mock("./storage", async importOriginal => {
  const real = await importOriginal<typeof import("./storage")>();
  return {
    ...real,
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
      await migrate(drizzle(sql), { migrationsFolder: "drizzle" });
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
        if (fixtures.failAi)
          return new Response("provider failure", { status: 503 });
        const request = JSON.parse(init.body);
        expect(request).not.toHaveProperty("thinking");
        const schema = request.response_format?.json_schema;
        const data =
          schema?.name === "vision_analysis"
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
