import { defineConfig } from "drizzle-kit";
import { cloudSqlSocket } from "./server/_core/databaseConfig";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is required to run drizzle commands");
}

const socket = cloudSqlSocket();
const parsed = new URL(connectionString);
export default defineConfig({
  schema: "./drizzle/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: socket
    ? {
        host: socket.slice(0, socket.lastIndexOf("/")),
        port: 5432,
        user: decodeURIComponent(parsed.username),
        password: decodeURIComponent(parsed.password),
        database: decodeURIComponent(parsed.pathname.slice(1)),
        ssl: false,
      }
    : {
        url: connectionString,
      },
});
