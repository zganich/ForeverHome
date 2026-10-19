import { vi } from "vitest";

// Mock environment variables for testing
process.env.DATABASE_URL =
  process.env.DATABASE_URL || "postgresql://test:test@localhost:5432/test";
process.env.STRIPE_SECRET_KEY = "sk_test_mock";
process.env.STRIPE_WEBHOOK_SECRET = "whsec_test_mock";
process.env.OPENAI_API_KEY = "sk-test-mock";
process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret";

// Global test utilities
global.console = {
  ...console,
  // Suppress console warnings in tests unless needed
  warn: vi.fn(),
  error: vi.fn(),
};

process.env.GOOGLE_CLOUD_PROJECT = "foreverhome-test";
process.env.GCS_BUCKET = "foreverhome-test-media";
process.env.APP_URL = "https://app.example.test";
process.env.CORS_ALLOWED_ORIGINS = "";
