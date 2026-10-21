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

// Always start from deterministic local admission settings, not shell config.
for (const name of [
  "AI_USER_IN_FLIGHT",
  "AI_USER_DAILY_ANALYSES",
  "AI_USER_DAILY_HELPERS",
  "AI_USER_DAILY_PROVIDER_CALLS",
  "AI_PROJECT_DAILY_PROVIDER_CALLS",
])
  delete process.env[name];
process.env.AI_DISABLED = "false";

// Default-deny outbound fetch in local tests. Tests must explicitly replace
// provider transport; only their disposable loopback HTTP server is real.
const localFetch = globalThis.fetch.bind(globalThis);
globalThis.fetch = (input, init) => {
  const value =
    typeof input === "string"
      ? input
      : input instanceof URL
        ? input.href
        : input.url;
  const target = new URL(value);
  if (!["127.0.0.1", "localhost", "[::1]"].includes(target.hostname))
    return Promise.reject(new Error("External test transport is not mocked"));
  return localFetch(input, init);
};
