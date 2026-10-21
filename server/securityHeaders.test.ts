import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import {
  apiSecurityHeaders,
  hostingSecurityHeaders,
} from "../shared/securityHeaders";
import { browserHeaders } from "./_core/securityHeaders";

describe("Browser policy is explicit and consistent", () => {
  it("Hosting template enforces the same reviewed policy as the static server", () => {
    const template = JSON.parse(readFileSync("firebase.json.example", "utf8"));
    const all = template.hosting.headers.find((x: any) => x.source === "**");
    expect(
      Object.fromEntries(all.headers.map((x: any) => [x.key, x.value]))
    ).toEqual(hostingSecurityHeaders);
    const csp = hostingSecurityHeaders["Content-Security-Policy"];
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("img-src 'self' blob:");
    expect(csp).not.toContain("storage.googleapis.com");
    expect(csp).not.toContain("https:;");
    expect(csp).not.toContain("unsafe-eval");
    expect(csp).not.toMatch(/script-src[^;]*unsafe-inline/);
  });
  it("API policy disallows document execution and common protections apply", () => {
    expect(apiSecurityHeaders).toMatchObject({
      "X-Frame-Options": "DENY",
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "strict-origin-when-cross-origin",
    });
    expect(apiSecurityHeaders["Content-Security-Policy"]).toContain(
      "default-src 'none'"
    );
  });
  it("permits Vite inline refresh only in the explicit development middleware", () => {
    let headers: any = {};
    const res = {
      set: (v: any) => Object.assign(headers, v),
      setHeader: (k: string, v: string) => (headers[k] = v),
    };
    browserHeaders(true)({} as any, res as any, () => {});
    expect(headers["Content-Security-Policy"]).toContain(
      "script-src 'self' 'unsafe-inline'"
    );
    browserHeaders(false)({} as any, res as any, () => {});
    expect(headers).toEqual(hostingSecurityHeaders);
  });
});
