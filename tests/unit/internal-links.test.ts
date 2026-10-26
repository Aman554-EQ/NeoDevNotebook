import { describe, expect, it } from "vitest"
import { loadAllContent } from "@/lib/content/load"

/** Every internal markdown link in content must point at a real route. */
const bundles = loadAllContent()
const routes = new Set<string>()
for (const b of bundles) {
  const m = b.module.slug
  routes.add(`/learn/${m}`).add(`/practice/${m}`).add(`/interview/${m}`)
  for (const l of b.lessons) routes.add(`/learn/${m}/${l.slug}`)
  for (const p of b.problems) routes.add(`/practice/${m}/${p.id}`)
  for (const q of b.interview) routes.add(`/interview/${m}/${q.id}`)
}
const LINK = /\]\((\/(?:learn|practice|interview)[^)#\s]*)/g

function linksIn(text: string): string[] {
  return [...text.matchAll(LINK)].map((m) => m[1]!.replace(/\/$/, ""))
}

describe("internal links", () => {
  it("every lesson, problem and answer link resolves", () => {
    const broken: string[] = []
    for (const b of bundles) {
      const texts: [string, string][] = [
        ...b.lessons.map((l) => [`lesson ${l.slug}`, l.body] as [string, string]),
        ...b.problems.map(
          (p) => [p.id, `${p.statement}\n${p.solution.explanation}`] as [string, string],
        ),
        ...b.interview.map(
          (q) => [q.id, `${q.shortAnswer}\n${q.detailedAnswer}`] as [string, string],
        ),
      ]
      for (const [where, text] of texts) {
        for (const link of linksIn(text)) if (!routes.has(link)) broken.push(`${where} → ${link}`)
      }
    }
    expect(broken).toEqual([])
  })

  it("every python lesson links to practice or interview material", () => {
    const python = bundles.find((b) => b.module.slug === "python")!
    const unlinked = python.lessons.filter((l) => !l.practice.length && !l.interview.length)
    expect(unlinked.map((l) => l.slug)).toEqual([])
  })
})
