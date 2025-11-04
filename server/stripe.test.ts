import { describe, test, expect, vi } from "vitest";
import { CREDIT_PACKS, SUBSCRIPTION_PLANS } from "./stripe";

// Mock Stripe - must be done before importing the module
vi.mock("stripe", () => {
  const mockStripe = {
    checkout: {
      sessions: {
        create: vi.fn().mockResolvedValue({
          id: "cs_test_123",
          url: "https://checkout.stripe.com/test",
        }),
      },
    },
    customers: {
      list: vi.fn().mockResolvedValue({ data: [] }),
      create: vi.fn().mockResolvedValue({ id: "cus_test_123" }),
    },
    webhooks: {
      constructEvent: vi.fn().mockReturnValue({
        type: "checkout.session.completed",
        data: {
          object: {
            id: "cs_test_123",
            client_reference_id: "test-user-123",
            metadata: {},
          },
        },
      }),
    },
  };
  
  return {
    default: vi.fn().mockImplementation(() => mockStripe),
  };
});

describe("Stripe Configuration", () => {
  describe("CREDIT_PACKS", () => {
    test("starter pack has correct pricing", () => {
      const pack = CREDIT_PACKS.starter;
      expect(pack.credits).toBe(10);
      expect(pack.price).toBe(499); // $4.99 in cents
      expect(pack.priceDisplay).toBe("$4.99");
      expect(pack.perAnalysis).toBe("$0.50");
    });

    test("value pack has correct pricing and badge", () => {
      const pack = CREDIT_PACKS.value;
      expect(pack.credits).toBe(25);
      expect(pack.price).toBe(999); // $9.99 in cents
      expect(pack.priceDisplay).toBe("$9.99");
      expect(pack.perAnalysis).toBe("$0.40");
      expect(pack.badge).toBe("BEST VALUE");
    });

    test("power pack has correct pricing", () => {
      const pack = CREDIT_PACKS.power;
      expect(pack.credits).toBe(60);
      expect(pack.price).toBe(1999); // $19.99 in cents
      expect(pack.priceDisplay).toBe("$19.99");
      expect(pack.perAnalysis).toBe("$0.33");
    });

    test("pricing improves with larger packs", () => {
      const starter = parseFloat(CREDIT_PACKS.starter.perAnalysis.replace("$", ""));
      const value = parseFloat(CREDIT_PACKS.value.perAnalysis.replace("$", ""));
      const power = parseFloat(CREDIT_PACKS.power.perAnalysis.replace("$", ""));

      // Larger packs have better per-analysis pricing
      expect(value).toBeLessThan(starter);
      expect(power).toBeLessThan(value);
      expect(power).toBeLessThan(starter);
    });
  });

  describe("SUBSCRIPTION_PLANS", () => {
    test("essential plan has correct configuration", () => {
      const plan = SUBSCRIPTION_PLANS.essential;
      expect(plan.price).toBe(999); // $9.99/month
      expect(plan.analysisLimit).toBe(15);
      expect(plan.features.length).toBeGreaterThan(0);
      expect(plan.shelterDonationPercent).toBe(10);
    });

    test("premium plan has unlimited analyses", () => {
      const plan = SUBSCRIPTION_PLANS.premium;
      expect(plan.price).toBe(1999); // $19.99/month
      expect(plan.analysisLimit).toBe(-1); // unlimited
      expect(plan.badge).toBe("POPULAR");
      expect(plan.shelterDonationPercent).toBe(10);
    });

    test("realtime plan has real-time hours", () => {
      const plan = SUBSCRIPTION_PLANS.realtime;
      expect(plan.price).toBe(3999); // $39.99/month
      expect(plan.realtimeHours).toBe(5);
      expect(plan.badge).toBe("NEW");
      expect(plan.shelterDonationPercent).toBe(10);
    });

    test("ultimate plan has more real-time hours", () => {
      const plan = SUBSCRIPTION_PLANS.ultimate;
      expect(plan.price).toBe(7999); // $79.99/month
      expect(plan.realtimeHours).toBe(15);
      expect(plan.badge).toBe("PREMIUM");
      expect(plan.shelterDonationPercent).toBe(10);
    });

    test("shelter plan has quarterly billing", () => {
      const plan = SUBSCRIPTION_PLANS.shelter;
      expect(plan.price).toBe(9900); // $99/3 months
      expect(plan.interval).toBe("quarter");
      expect(plan.shelterDonation).toBe(1000); // $10 in cents
    });
  });

  // Note: Stripe integration tests require actual Stripe configuration
  // These tests verify the configuration and pricing, not the actual API calls
  // For full integration tests, use Stripe test mode with real API keys
});

