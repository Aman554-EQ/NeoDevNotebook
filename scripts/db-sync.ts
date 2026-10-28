/**
 * Runs before every build (`prebuild`). On Vercel production builds it brings the database in
 * line with the code being deployed: applies new migrations, then re-seeds the search copy of
 * content/ (idempotent; subscribers are untouched). Anywhere else it does nothing, so local
 * builds, CI and preview deployments never write to the production database.
 *
 * If it fails, the build fails and the previous deployment stays live (never a site whose search
 * disagrees with its pages).
 */
import { runMigrations } from "../src/db/migrate"
import { createDb } from "../src/db/client"
import { seed } from "../src/db/seed"
import { loadAllContent } from "../src/lib/content/load"

const url = process.env.DATABASE_URL
if (process.env.VERCEL_ENV !== "production") {
  console.log("db-sync: skipped (not a Vercel production build)")
} else if (!url) {
  console.error("db-sync: DATABASE_URL is not set for Production in Vercel")
  process.exit(1)
} else {
  await runMigrations(url)
  const { db, client } = createDb(url)
  try {
    const bundles = loadAllContent()
    await seed(db, bundles)
    const lessons = bundles.reduce((n, b) => n + b.lessons.length, 0)
    console.log(
      `db-sync: migrations applied, ${bundles.length} modules / ${lessons} lessons seeded`,
    )
  } finally {
    await client.end()
  }
}
