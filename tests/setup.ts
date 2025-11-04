import { vi } from "vitest";

// Mock environment variables for testing
process.env.DATABASE_URL = process.env.DATABASE_URL || "postgresql://test:test@localhost:5432/test";
process.env.STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || "sk_test_mock";
process.env.STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || "whsec_test_mock";
process.env.OPENAI_API_KEY = process.env.OPENAI_API_KEY || "sk-test-mock";
process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret";

// Global test utilities
global.console = {
  ...console,
  // Suppress console warnings in tests unless needed
  warn: vi.fn(),
  error: vi.fn(),
};

