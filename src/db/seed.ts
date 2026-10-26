import { config } from "dotenv"
import { loadAllContent, type ContentBundle } from "../lib/content/load"
import { createDb, type Db } from "./client"
import * as s from "./schema"

config({ path: ".env.local", quiet: true })

/** Turns MDX into plain searchable text (drops JSX tags, imports and markdown punctuation). */
export function mdxToPlainText(mdx: string): string {
  return mdx
    .replace(/^(import|export)\s.*$/gm, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/[#*_`>|$\\[\]{}()-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

/**
 * Idempotent: replaces all content rows in one transaction (user tables are untouched).
 * Git is the source of truth; the DB is a searchable copy.
 */
export async function seed(db: Db, bundles: ContentBundle[]) {
  await db.transaction(async (tx) => {
    await tx.delete(s.modules) // cascades to lessons/problems/interview + join tables
    await tx.delete(s.tags)

    const tagIds = new Map<string, number>()
    const allTags = new Set(
      bundles.flatMap((b) => [...b.problems, ...b.interview].flatMap((i) => i.tags)),
    )
    if (allTags.size) {
      const rows = await tx
        .insert(s.tags)
        .values([...allTags].map((slug) => ({ slug })))
        .returning()
      rows.forEach((r) => tagIds.set(r.slug, r.id))
    }

    for (const { module, lessons, problems, interview } of bundles) {
      const [mod] = await tx
        .insert(s.modules)
        .values({
          slug: module.slug,
          title: module.title,
          part: module.part,
          sortOrder: module.order,
          description: module.description,
        })
        .returning({ id: s.modules.id })
      const moduleId = mod!.id

      if (lessons.length) {
        await tx.insert(s.lessons).values(
          lessons.map((l) => ({
            moduleId,
            slug: l.slug,
            title: l.title,
            sortOrder: l.order,
            estMinutes: l.estimatedMinutes,
            difficulty: l.difficulty,
            summary: l.summary,
            bodyText: mdxToPlainText(l.body),
          })),
        )
      }
      if (problems.length) {
        await tx.insert(s.problems).values(
          problems.map((p) => ({
            id: p.id,
            moduleId,
            title: p.title,
            difficulty: p.difficulty,
            statement: p.statement,
            solutionCode: p.solution.code,
            explanation: p.solution.explanation,
            complexity: `time ${p.complexity.time}; space ${p.complexity.space}`,
          })),
        )
        await tx
          .insert(s.problemTags)
          .values(
            problems.flatMap((p) =>
              p.tags.map((t) => ({ problemId: p.id, tagId: tagIds.get(t)! })),
            ),
          )
      }
      if (interview.length) {
        await tx.insert(s.interviewQuestions).values(
          interview.map((q) => ({
            id: q.id,
            moduleId,
            question: q.question,
            shortAnswer: q.shortAnswer,
            detailedAnswer: q.detailedAnswer,
            code: q.code?.code ?? null,
            difficulty: q.difficulty,
          })),
        )
        await tx
          .insert(s.interviewTags)
          .values(
            interview.flatMap((q) =>
              q.tags.map((t) => ({ questionId: q.id, tagId: tagIds.get(t)! })),
            ),
          )
      }
    }
  })
}

if (process.argv[1]?.endsWith("seed.ts")) {
  const url = process.argv[2] ?? process.env.DATABASE_URL
  if (!url) throw new Error("DATABASE_URL is not set")
  const { db, client } = createDb(url)
  const bundles = loadAllContent()
  seed(db, bundles)
    .then(() => {
      const count = (k: "lessons" | "problems" | "interview") =>
        bundles.reduce((n, b) => n + b[k].length, 0)
      console.log(
        `✓ seeded ${bundles.length} modules, ${count("lessons")} lessons, ${count("problems")} problems, ${count("interview")} interview questions`,
      )
    })
    .catch((err) => {
      console.error(err)
      process.exitCode = 1
    })
    .finally(() => client.end())
}
