/**
 * D-09: Database connection (Drizzle ORM + Postgres).
 *
 * SCAFFOLD — not yet wired into the app. The app still uses localStorage
 * exclusively. This module provides the connection pool that will be used
 * when the sync layer is added.
 */
import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { schema } from "./schema";

let dbInstance: NodePgDatabase<typeof schema> | null = null;
let pool: Pool | null = null;

export function initDb(): void {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) return;
  pool = new Pool({
    connectionString: databaseUrl,
    max: 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000,
  });
  dbInstance = drizzle(pool, { schema });
}

export function getDb(): NodePgDatabase<typeof schema> | null {
  return dbInstance;
}

export async function closeDb(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
    dbInstance = null;
  }
}

export function isDbReady(): boolean {
  return dbInstance !== null;
}
