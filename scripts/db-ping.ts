import { config } from "dotenv"
import postgres from "postgres"

config({ path: ".env.local", quiet: true })

const url = process.env.DATABASE_URL
if (!url) {
  console.error("✗ DATABASE_URL is not set (copy .env.example to .env.local)")
  process.exit(1)
}
const sql = postgres(url, { connect_timeout: 5, max: 1 })
sql`select version()`
  .then(([row]) => console.log(`✓ connected: ${String(row?.version).split(",")[0]}`))
  .catch((err: Error) => {
    console.error(`✗ cannot reach database: ${err.message}\n  Is Docker running? Try: pnpm db:up`)
    process.exitCode = 1
  })
  .finally(() => sql.end())
