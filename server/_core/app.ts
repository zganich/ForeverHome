import "dotenv/config";
import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { registerBillingRoutes } from "../billing";

/**
 * Create and configure Express app
 * Works for both local development and Vercel serverless
 */
export async function createApp(): Promise<express.Express> {
  const app = express();

  // Redirect www to non-www (fixes SSL certificate issue)
  app.use((req, res, next) => {
    if (req.hostname && req.hostname.startsWith("www.")) {
      const nonWwwHost = req.hostname.replace(/^www\./, "");
      return res.redirect(301, `https://${nonWwwHost}${req.url}`);
    }
    next();
  });

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
