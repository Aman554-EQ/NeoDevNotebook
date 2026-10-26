import { config } from "dotenv"
import { runMigrations } from "../../src/db/migrate"
import { createDb } from "../../src/db/client"
import { seed } from "../../src/db/seed"
import { loadAllContent } from "../../src/lib/content/load"

/** Search needs the database: make sure it is migrated and holds the current content. */
export default async function globalSetup() {
  config({ path: ".env.local", quiet: true })
  const url = process.env.DATABASE_URL
  if (!url) throw new Error("DATABASE_URL is not set (copy .env.example to .env.local)")
  await runMigrations(url)
  const { db, client } = createDb(url)
  try {
    await seed(db, loadAllContent())
  } finally {
    await client.end()
  }
}
