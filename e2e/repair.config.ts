import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: ".",
  testMatch: "acceptance-repairs.local.spec.ts",
  workers: 1,
  timeout: 60000,
  reporter: "list",
  outputDir: "/tmp/foreverhome-local-repair-results",
  use: {
    baseURL: "http://127.0.0.1:4317",
    channel: "chrome",
    headless: true,
    trace: "off",
    viewport: { width: 1440, height: 1000 },
  },
  webServer: {
    command: "pnpm exec vite --host 127.0.0.1 --port 4317 --strictPort",
    url: "http://127.0.0.1:4317",
    reuseExistingServer: false,
    env: {
      VITE_FIREBASE_API_KEY: "fictional-local-api-key",
      VITE_FIREBASE_AUTH_DOMAIN: "foreverhome-local-only.firebaseapp.com",
      VITE_FIREBASE_PROJECT_ID: "foreverhome-local-only",
      VITE_FIREBASE_APP_ID: "1:123:web:local",
      VITE_API_BASE_URL: "http://127.0.0.1:4317",
      VITE_ANALYTICS_ENDPOINT: "",
      VITE_ANALYTICS_WEBSITE_ID: "",
    },
  },
});
