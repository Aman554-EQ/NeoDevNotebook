import fs from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"
import { findTargetGaps, loadAllContent } from "@/lib/content/load"

/** Content rules from plan/part-2-django/plan.md (§3, §5, §7). */
const django = loadAllContent().find((b) => b.module.slug === "django")!
// Lessons taught as screens or checklists rather than with a visual (plan §3).
const NO_VISUAL = new Set(["the-admin", "security-and-best-practices"])
const VISUAL = /<(?:[A-Z]\w*Viz|HttpExchange|OrmToSql|SqlPlayground)\b/

describe("django module content", () => {
  it("meets its declared targets", () => {
    expect(findTargetGaps([django])).toEqual([])
  })

  it("lessons come in the six planned sections, in order", () => {
    expect([...new Set(django.lessons.map((l) => l.section))]).toEqual([
      "Web & Backend Foundations",
      "Django Core",
      "The Django Toolbox",
      "REST APIs with DRF",
      "Databases in Practice",
      "Quality, Security & Production",
    ])
  })

  it("every lesson follows the template and the enrichment rules", () => {
    for (const l of django.lessons) {
      for (const heading of ["Variations", "Putting it together", "Common mistakes", "Practice"]) {
        expect(l.body, `${l.slug}: ## ${heading}`).toMatch(new RegExp(`^## ${heading}`, "m"))
      }
      expect(l.body.indexOf("## Variations"), l.slug).toBeLessThan(
        l.body.indexOf("## Common mistakes"),
      )
      expect(l.body, l.slug).toContain("<KeyTakeaways>")
      expect(l.objectives.length, l.slug).toBeGreaterThanOrEqual(3)
      const outputs = l.body.match(/```text title="Output"/g) ?? []
      expect(outputs.length, `${l.slug}: verified outputs`).toBeGreaterThanOrEqual(4)
      const checks = l.body.match(/<Reveal\b/g) ?? []
      expect(checks.length, `${l.slug}: self-checks`).toBeGreaterThanOrEqual(4)
      if (!NO_VISUAL.has(l.slug)) expect(l.body, `${l.slug}: visual`).toMatch(VISUAL)
    }
  })

  it("tiers: 8/8/7/7 problems with 5 find-the-bug ones, 7/8/8/7 interview questions", () => {
    const count = <T extends { difficulty: string }>(items: T[]) =>
      Object.fromEntries(
        ["easy", "simple", "medium", "hard"].map((d) => [
          d,
          items.filter((i) => i.difficulty === d).length,
        ]),
      )
    expect(count(django.problems)).toEqual({ easy: 8, simple: 8, medium: 7, hard: 7 })
    expect(count(django.interview)).toEqual({ easy: 7, simple: 8, medium: 8, hard: 7 })
    const bugs = django.problems.filter((p) => p.title.startsWith("🐞"))
    expect(bugs).toHaveLength(5)
    expect(bugs.every((p) => p.tags.includes("debugging"))).toBe(true)
  })

  it("every problem has hidden tests, hints and an explanation", () => {
    for (const p of django.problems) {
      expect(p.verify, p.id).toBeTruthy()
      expect(p.hints.length, p.id).toBeGreaterThanOrEqual(1)
      expect(p.solution.explanation.length, p.id).toBeGreaterThan(150)
    }
  })

  it("has 3 guided projects and 1 capstone, each with checkpoints for its milestones", () => {
    expect(django.projects.map((p) => p.kind)).toEqual(["guided", "guided", "guided", "capstone"])
    for (const p of django.projects) {
      const checkpoints = p.body.match(/<Checkpoint\b/g) ?? []
      expect(checkpoints.length, p.slug).toBeGreaterThanOrEqual(3)
      expect(p.body, p.slug).toMatch(/^## .*(PRD|brief)/im)
    }
  })

  it("the downloadable playground.py is the exact file every sample is verified with", () => {
    const verified = fs.readFileSync(path.join("content", "django", "support", "playground.py"))
    const download = fs.readFileSync(path.join("public", "downloads", "django", "playground.py"))
    expect(download.equals(verified)).toBe(true)
  })
})
