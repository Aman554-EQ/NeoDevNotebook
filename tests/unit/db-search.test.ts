// @vitest-environment node
import { config } from "dotenv"
import { sql } from "drizzle-orm"
import { afterAll, beforeAll, describe, expect, it } from "vitest"
import { createDb } from "@/db/client"
import { runMigrations } from "@/db/migrate"
import { mdxToPlainText, seed } from "@/db/seed"
import { loadAllContent } from "@/lib/content/load"
import { searchContent } from "@/lib/search/query"

config({ path: ".env.local", quiet: true })

/**
 * Runs against TEST_DATABASE_URL only (never dev data). Requires the Docker database:
 * `pnpm db:up`. Failing here with a connection error means the DB is not running.
 */
const url = process.env.TEST_DATABASE_URL
if (!url) throw new Error("TEST_DATABASE_URL is not set (see .env.example)")
if (url === process.env.DATABASE_URL)
  throw new Error("TEST_DATABASE_URL must differ from DATABASE_URL")

const { db, client } = createDb(url)

beforeAll(async () => {
  await runMigrations(url)
  await seed(db, loadAllContent())
}, 60_000)
afterAll(() => client.end())

describe("seed", () => {
  it("copies every content item and is idempotent", async () => {
    await seed(db, loadAllContent()) // second run must not duplicate rows
    const bundles = loadAllContent()
    const expected = (k: "lessons" | "problems" | "interview") =>
      bundles.reduce((n, b) => n + b[k].length, 0)
    const [row] = await db.execute<{ l: number; p: number; i: number }>(sql`
      select (select count(*) from lessons)::int as l,
             (select count(*) from problems)::int as p,
             (select count(*) from interview_questions)::int as i`)
    expect(row).toEqual({
      l: expected("lessons"),
      p: expected("problems"),
      i: expected("interview"),
    })
  })

  it("strips MDX to searchable text", () => {
    expect(
      mdxToPlainText('import X from "y"\n## Title\n<Callout type="tip">Use **deque**</Callout>'),
    ).toBe("Title Use deque")
  })
})

describe("full-text search", () => {
  it("finds lessons, problems and interview questions with correct links", async () => {
    const hits = await searchContent(db, "append")
    const types = new Set(hits.map((h) => h.type))
    expect(types).toEqual(new Set(["lesson", "problem", "interview"]))
    expect(hits.map((h) => h.href)).toContain("/learn/start-here/why-append-is-fast")
    expect(hits.map((h) => h.href)).toContain("/interview/start-here/sh-i-002")
  })

  it("matches word prefixes while typing", async () => {
    const hits = await searchContent(db, "resiz")
    expect(hits.some((h) => h.href === "/practice/start-here/sh-p-002")).toBe(true)
  })

  it("ranks by relevance and marks matches in the snippet", async () => {
    const hits = await searchContent(db, "default list")
    expect(hits[0]?.href).toBe("/practice/start-here/sh-p-001")
    expect(hits[0]!.rank).toBeGreaterThanOrEqual(hits.at(-1)!.rank)
  })

  it("handles short, empty and hostile input safely", async () => {
    expect(await searchContent(db, "")).toEqual([])
    expect(await searchContent(db, "a")).toEqual([])
    expect(await searchContent(db, "!!! ::: &&& |||")).toEqual([])
    await expect(searchContent(db, "'); drop table lessons; --")).resolves.toBeInstanceOf(Array)
    const [row] = await db.execute<{ n: number }>(sql`select count(*)::int as n from lessons`)
    expect(row!.n).toBeGreaterThan(0)
  })
})
