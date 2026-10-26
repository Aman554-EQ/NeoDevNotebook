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
