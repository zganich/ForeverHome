import { afterEach, expect, it, vi } from "vitest";
afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});
it("fails closed before initializing Stripe with a live or unknown secret key", async () => {
  for (const value of [
    "sk_live_fictional",
    "rk_test_fictional",
    "unknown_fictional",
  ]) {
    vi.stubEnv("STRIPE_SECRET_KEY", value);
    vi.resetModules();
    await expect(import("./stripe")).rejects.toThrow("test-mode secret key");
  }
});
