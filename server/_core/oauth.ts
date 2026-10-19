import type { Express } from "express";

// Firebase handles confirmation and password recovery in the browser.
// Historical Manus callbacks are no longer valid login endpoints.
export function registerOAuthRoutes(app: Express) {
  app.get("/api/oauth/callback", (_req, res) => res.redirect(302, "/login"));
}
