import "dotenv/config";
import { createApp } from "./app";
import { serveStatic } from "./static";
import { listen } from "./httpServer";
import { allowedOrigins } from "./cors";
import { cloudSqlSocket } from "./databaseConfig";

async function main() {
  for (const key of [
    "GOOGLE_CLOUD_PROJECT",
    "GCS_BUCKET",
    "DATABASE_URL",
    "OPENAI_API_KEY",
    "APP_URL",
  ])
    if (!process.env[key]) throw new Error(`${key} is required`);
  if (process.env.FIREBASE_AUTH_EMULATOR_HOST)
    throw new Error("Auth emulator is forbidden in production");
  allowedOrigins();
  cloudSqlSocket();
  const app = await createApp();
  serveStatic(app);
  await listen(app);
}
main().catch(() => {
  // No potentially secret-bearing connection/SDK error details in startup logs.
  console.error(
    "Startup failed. Check required runtime configuration and port availability."
  );
  process.exitCode = 1;
});
