import "dotenv/config";
import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { registerBillingRoutes } from "../billing";
import { apiCors } from "./cors";
import { getDb } from "../db";
import { sql } from "drizzle-orm";

/**
 * Create and configure Express app
 * Used by the local server and the Cloud Run container.
 */
export async function createApp(): Promise<express.Express> {
  const app = express();

  app.disable("x-powered-by");
  app.get("/healthz", (_req, res) => res.json({ ok: true }));
  app.get("/readyz", async (_req, res) => {
    try {
      const database = await getDb();
      if (!database) throw new Error("Not configured");
      await database.execute(sql`select 1`);
      res.json({ ok: true });
    } catch {
      res.status(503).json({ ok: false });
    }
  });
  // Browser callers use exact-origin CORS and Firebase bearer tokens. Stripe
  // has no browser Origin header and authenticates its raw body signature.
  app.use("/api", apiCors());
  registerBillingRoutes(app);

  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);

  // File upload endpoint
  const uploadRouter = await import("../upload");
  app.use("/api", uploadRouter.default);

  // Admin routes
  const { registerAdminRoutes } = await import("../routes/admin");
  registerAdminRoutes(app);

  // Streaming routes (SSE for analysis progress)
  const { registerStreamingRoutes } = await import("../routes/streaming");
  registerStreamingRoutes(app);

  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );

  app.use("/api", (_req, res) =>
    res.status(404).json({ error: "API endpoint not found" })
  );
  return app;
}
