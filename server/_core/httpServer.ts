import { createServer } from "node:http";
import type { Express } from "express";
import { closeDatabase } from "../db";

export async function listen(
  app: Express,
  port = Number(process.env.PORT ?? 3000),
  server = createServer(app)
) {
  if (!Number.isInteger(port) || port < 1 || port > 65535)
    throw new Error("Invalid PORT");
  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(port, "0.0.0.0", () => {
      server.off("error", reject);
      resolve();
    });
  });
  let stopping = false;
  const shutdown = () => {
    if (stopping) return;
    stopping = true;
    const deadline = setTimeout(() => server.closeAllConnections(), 8000);
    deadline.unref();
    server.close(async () => {
      clearTimeout(deadline);
      try {
        await closeDatabase();
      } catch {
        process.exitCode = 1;
      }
    });
    server.closeIdleConnections();
  };
  process.once("SIGTERM", shutdown);
  process.once("SIGINT", shutdown);
  server.once("close", () => {
    process.off("SIGTERM", shutdown);
    process.off("SIGINT", shutdown);
  });
  console.log(`Server listening on port ${port}`);
  return server;
}
