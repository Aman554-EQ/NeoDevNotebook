import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import * as schema from "./schema"

/**
 * One connection pool per process. The only config is DATABASE_URL, so moving
 * to Neon means pasting its (pooled) connection string — nothing else changes.
 */

export function createDb(url: string) {
  const client = postgres(url, { max: 5, idle_timeout: 20, connect_timeout: 5, onnotice: () => {} })
  return { db: drizzle(client, { schema }), client }
}

export type Db = ReturnType<typeof createDb>["db"]

const globalForDb = globalThis as unknown as { __ndnDb?: ReturnType<typeof createDb> }

export function getDb(): Db {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error("DATABASE_URL is not set (copy .env.example to .env.local)")
  globalForDb.__ndnDb ??= createDb(url)
  return globalForDb.__ndnDb.db
}
