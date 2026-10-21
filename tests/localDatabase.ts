import type postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";

export function localTestUrl() {
  const value = process.env.REVIVE_TEST_DATABASE_URL;
  if (!value) return undefined;
  const url = new URL(value);
  if (url.hostname !== "127.0.0.1" || url.pathname !== "/foreverhome_rehearsal")
    throw new Error("Requires dedicated local rehearsal database");
  return value;
}
export async function migrateLocal(client: postgres.Sql) {
  const connection = await client.reserve();
  try {
    await connection`select pg_advisory_lock(178523, 10403)`;
    await migrate(drizzle(client), { migrationsFolder: "drizzle" });
  } finally {
    await connection`select pg_advisory_unlock(178523, 10403)`;
    connection.release();
  }
}
