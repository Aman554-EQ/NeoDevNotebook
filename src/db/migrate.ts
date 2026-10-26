import { config } from "dotenv"
import { migrate } from "drizzle-orm/postgres-js/migrator"
import { createDb } from "./client"

config({ path: ".env.local", quiet: true })

/** Applies migrations to DATABASE_URL, or to the URL passed as the first CLI argument. */
export async function runMigrations(url: string) {
  const { db, client } = createDb(url)
  try {
    await migrate(db, { migrationsFolder: "src/db/migrations" })
  } finally {
    await client.end()
  }
}

if (process.argv[1]?.endsWith("migrate.ts")) {
  const url = process.argv[2] ?? process.env.DATABASE_URL
  if (!url) throw new Error("DATABASE_URL is not set")
  runMigrations(url).then(
    () => console.log("✓ migrations applied"),
    (err) => {
      console.error(err)
      process.exit(1)
    },
  )
}
