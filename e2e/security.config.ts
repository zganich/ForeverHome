import path from "node:path";
import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: ".",
  testMatch: "acceptance-repairs.local.spec.ts",
  workers: 1,
  timeout: 60000,
  reporter: "list",
  outputDir: "/tmp/foreverhome-security-browser-results",
  use: {
    baseURL: "http://127.0.0.1:4317",
    channel: "chrome",
    headless: true,
    trace: "off",
    viewport: { width: 1440, height: 1000 },
  },
  webServer: {
    command: "node --import tsx scripts/security-browser-server.ts",
    cwd: path.resolve(import.meta.dirname, ".."),
    url: "http://127.0.0.1:4317/health",
    reuseExistingServer: false,
    env: {
      NODE_ENV: "test",
      DOTENV_CONFIG_PATH: "/dev/null",
      DATABASE_URL: "",
      CLOUD_SQL_CONNECTION_NAME: "",
      APP_URL: "http://127.0.0.1:4317",
      CORS_ALLOWED_ORIGINS: "",
      GOOGLE_CLOUD_PROJECT: "foreverhome-local-only",
      GCS_BUCKET: "foreverhome-local-media",
      OPENAI_API_KEY: "",
      STRIPE_SECRET_KEY: "",
      STRIPE_WEBHOOK_SECRET: "",
      AI_DISABLED: "true",
    },
  },
});
