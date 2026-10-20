import { afterEach, expect, it, vi } from "vitest";
import {
  billingAvailability,
  requireBillingAvailable,
} from "./billingAvailability";
afterEach(() => vi.unstubAllEnvs());
it("fails closed when either checkout or fulfillment secret is absent", () => {
  for (const [key, hook] of [
    ["", ""],
    ["sk_test_fake", ""],
    ["", "whsec_fake"],
    ["sk_live_fake", "whsec_fake"],
  ]) {
    vi.stubEnv("STRIPE_SECRET_KEY", key);
    vi.stubEnv("STRIPE_WEBHOOK_SECRET", hook);
    expect(billingAvailability().available).toBe(false);
    expect(() => requireBillingAvailable()).toThrow("currently unavailable");
    expect(JSON.stringify(billingAvailability())).not.toContain("sk_");
  }
});
it("enables only a test checkout with webhook configuration", () => {
  vi.stubEnv("STRIPE_SECRET_KEY", "sk_test_fake");
  vi.stubEnv("STRIPE_WEBHOOK_SECRET", "whsec_fake");
  expect(billingAvailability().available).toBe(true);
});
