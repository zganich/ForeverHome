import express from "express";
import type { Server } from "node:http";
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { apiCors, allowedOrigins } from "./_core/cors";
import { cloudSqlSocket, databaseOptions } from "./_core/databaseConfig";

describe("Cloud SQL configuration", () => {
  afterEach(() => vi.unstubAllEnvs());
  it("uses the Cloud Run Auth Proxy socket with a bounded pool", () => {
    vi.stubEnv(
      "CLOUD_SQL_CONNECTION_NAME",
      "foreverhome-test:us-central1:foreverhome-db"
    );
    expect(databaseOptions()).toMatchObject({
      path: "/cloudsql/foreverhome-test:us-central1:foreverhome-db/.s.PGSQL.5432",
      ssl: false,
      max: 5,
    });
  });
  it("keeps direct local Postgres usable and rejects malformed attachments", () => {
    vi.stubEnv("CLOUD_SQL_CONNECTION_NAME", "");
    expect(databaseOptions()).not.toHaveProperty("path");
    expect(() => cloudSqlSocket("../wrong-instance")).toThrow(
      "Invalid Cloud SQL"
    );
  });
});

describe("browser CORS boundary", () => {
  let server: Server;
  let origin: string;
  beforeAll(async () => {
    const app = express();
    app.use("/api", apiCors(new Set(["https://app.example.test"])));
    app.post("/api/check", (_req, res) => res.json({ ok: true }));
    server = await new Promise<Server>((resolve, reject) => {
      const listener = app.listen(0, "127.0.0.1", () => resolve(listener));
      listener.once("error", reject);
    });
    origin = `http://127.0.0.1:${(server.address() as import("node:net").AddressInfo).port}`;
  });
  afterAll(
    () =>
      new Promise<void>(resolve =>
        server ? server.close(() => resolve()) : resolve()
      )
  );
  afterEach(() => vi.unstubAllEnvs());
  it("permits an exact frontend origin and bearer preflight without cookies", async () => {
    const response = await fetch(`${origin}/api/check`, {
      method: "OPTIONS",
      headers: {
        Origin: "https://app.example.test",
        "Access-Control-Request-Method": "POST",
        "Access-Control-Request-Headers": "authorization,content-type",
      },
    });
    expect(response.status).toBe(204);
    expect(response.headers.get("access-control-allow-origin")).toBe(
      "https://app.example.test"
    );
    expect(response.headers.get("access-control-allow-headers")).toContain(
      "Authorization"
    );
    expect(response.headers.has("access-control-allow-credentials")).toBe(
      false
    );
  });
  it("rejects lookalike origins before the API handler", async () => {
    const response = await fetch(`${origin}/api/check`, {
      method: "POST",
      headers: { Origin: "https://app.example.test.attacker.invalid" },
    });
    expect(response.status).toBe(403);
    expect(response.headers.has("access-control-allow-origin")).toBe(false);
  });
  it("allows server webhooks without a browser Origin", async () => {
    expect(
      (await fetch(`${origin}/api/check`, { method: "POST" })).status
    ).toBe(200);
  });
  it("rejects wildcard, path-bearing and insecure production origins", () => {
    vi.stubEnv("NODE_ENV", "production");
    for (const value of [
      "*",
      "https://app.example.test/path",
      "http://localhost:3000",
    ]) {
      vi.stubEnv("APP_URL", value);
      expect(() => allowedOrigins()).toThrow();
    }
  });
});
