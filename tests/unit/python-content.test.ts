import { describe, expect, it } from "vitest"
import { findTargetGaps, loadAllContent } from "@/lib/content/load"

/** Part 1 content rules from plan/part-1-python/plan.md §8. */
const python = loadAllContent().find((b) => b.module.slug === "python")!
const REFERENCE_PAGES = new Set([
  "essential-commands-and-type-hints",
  "error-catalogue-and-bug-patterns",
])
const VISUAL = /<(?:[A-Z]\w*Viz|CodeStepper|CallStack)\b/

describe("python module content", () => {
  it("meets its declared targets", () => {
    expect(findTargetGaps([python])).toEqual([])
  })

  it("every lesson except the two reference pages has a visual", () => {
    const missing = python.lessons.filter(
      (l) => !REFERENCE_PAGES.has(l.slug) && !VISUAL.test(l.body),
    )
    expect(missing.map((l) => l.slug)).toEqual([])
  })

  it("every lesson follows the template sections", () => {
    for (const l of python.lessons) {
      expect(l.body, l.slug).toMatch(/^## Common mistakes$/m)
      expect(l.body, l.slug).toMatch(/^## Practice$/m)
      expect(l.body, l.slug).toContain("<KeyTakeaways>")
      expect(l.objectives.length, l.slug).toBeGreaterThanOrEqual(3)
    }
  })

  it("has exactly 15 problems per tier and 8 find-and-fix-the-bug problems (at least one per tier)", () => {
    const tiers = Object.groupBy(python.problems, (p) => p.difficulty)
    for (const d of ["easy", "simple", "medium", "hard"] as const) {
      expect(tiers[d]?.length, d).toBe(15)
      expect(
        tiers[d]!.some((p) => p.tags.includes("debugging")),
        d,
      ).toBe(true)
    }
    const bugs = python.problems.filter((p) => p.title.startsWith("🐞"))
    expect(bugs.every((p) => p.tags.includes("debugging"))).toBe(true)
    expect(bugs).toHaveLength(8)
  })

  it("every problem has hidden tests, hints, an explanation and complexity", () => {
    for (const p of python.problems) {
      expect(p.verify, p.id).toBeTruthy()
      expect(p.hints.length, p.id).toBeGreaterThanOrEqual(1)
      expect(p.solution.explanation.length, p.id).toBeGreaterThan(150)
      expect(p.complexity.time, p.id).toMatch(/O\(/)
    }
  })

  it("lessons are grouped into the five planned sections, in order", () => {
    const sections = [...new Set(python.lessons.map((l) => l.section))]
    expect(sections).toEqual([
      "Basics",
      "Data Structures",
      "Core Language",
      "Packages, Imports & Tooling",
      "Debugging",
    ])
  })
})
