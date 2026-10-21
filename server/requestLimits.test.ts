import express from "express";
import type { Server } from "node:http";
import { gzipSync } from "node:zlib";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  boundedJson,
  formBody,
  jsonBody,
  parserError,
} from "./_core/requestLimits";
import { apiHeaders } from "./_core/securityHeaders";

describe("HTTP text envelopes remain bounded before auth", () => {
  let server: Server, origin: string;
  beforeAll(async () => {
    const app = express();
    app.use(apiHeaders, jsonBody, formBody, parserError, boundedJson);
    app.post("/echo", (req, res) =>
      res.json({ ok: true, fields: Object.keys(req.body).length })
    );
    server = await new Promise<Server>(resolve => {
      const s = app.listen(0, "127.0.0.1", () => resolve(s));
    });
    origin = `http://127.0.0.1:${(server.address() as any).port}/echo`;
  });
  afterAll(() => new Promise<void>(resolve => server.close(() => resolve())));
  const post = (value: unknown) =>
    fetch(origin, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(value),
    });
  it("accepts the largest analysis-context contract, including Unicode", async () => {
    const response = await post({
      petId: "fixture",
      mediaUrl: "https://example.test/image",
      userContext: "🐕".repeat(5000),
    });
    expect(response.status).toBe(200);
    expect(response.headers.get("x-content-type-options")).toBe("nosniff");
    expect(response.headers.get("x-frame-options")).toBe("DENY");
    expect(response.headers.get("referrer-policy")).toBe(
      "strict-origin-when-cross-origin"
    );
    expect(response.headers.get("content-security-policy")).toContain(
      "default-src 'none'"
    );
  });
  it("rejects oversized JSON, nesting, fields, strings and batches with 413", async () => {
    let nested: any = {};
    for (let i = 0; i < 10; i++) nested = { child: nested };
    for (const value of [
      { text: "x".repeat(70000) },
      nested,
      Object.fromEntries(Array.from({ length: 129 }, (_, i) => [i, 1])),
      { text: "x".repeat(16385) },
      Array.from({ length: 21 }, () => ({ json: {} })),
    ])
      expect((await post(value)).status).toBe(413);
  });
  it("limits flat forms to 8KiB and twenty parameters", async () => {
    for (const [body, status] of [
      ["title=fixture&description=hello", 200],
      [Array.from({ length: 21 }, (_, i) => `p${i}=x`).join("&"), 413],
      ["title=" + "x".repeat(8192), 413],
    ] as const)
      expect(
        (
          await fetch(origin, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body,
          })
        ).status
      ).toBe(status);
  });
  it("rejects compressed JSON and malformed JSON without echoing content", async () => {
    expect(
      (
        await fetch(origin, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Content-Encoding": "gzip",
          },
          body: gzipSync('{"fixture":true}'),
        })
      ).status
    ).toBe(415);
    const response = await fetch(origin, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "PRIVATE_MALFORMED",
    });
    expect(response.status).toBe(400);
    expect(await response.text()).not.toContain("PRIVATE_MALFORMED");
  });
});
