import express from "express";
import { apiHeaders } from "../server/_core/securityHeaders";
/** Local-only static production rehearsal. Never uses hosted credentials. */
import { createApp } from "../server/_core/app";
import { serveStatic } from "../server/_core/static";
const app = await createApp();
serveStatic(app);
// Browser scenarios replace every API response. Block any missed API route
// before the real app can initialize auth/provider clients or access a DB.
const fixture = express();
fixture.use("/api", apiHeaders, (_req, res) =>
  res.status(503).json({ error: "Unmocked local browser API" })
);
fixture.use(app);
const server = fixture.listen(4317, "127.0.0.1");
for (const signal of ["SIGINT", "SIGTERM"] as const)
  process.on(signal, () => server.close(() => process.exit(0)));
