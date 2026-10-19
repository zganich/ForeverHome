import "dotenv/config";
import { createApp } from "./app";
import { setupVite } from "./vite";
import { listen } from "./httpServer";
import { createServer } from "node:http";

// Development entry only. The production bundle never imports Vite.
async function main() {
  const app = await createApp();
  const server = createServer(app);
  await setupVite(app, server);
  await listen(app, Number(process.env.PORT ?? 3000), server);
}
main().catch(() => {
  console.error("Development server failed to start");
  process.exitCode = 1;
});
