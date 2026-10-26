import fs from "node:fs"
import os from "node:os"
import path from "node:path"
import { afterEach, describe, expect, it } from "vitest"
import {
  ContentError,
  loadAllContent,
  loadLessons,
  loadModules,
  loadProblems,
} from "@/lib/content/load"

/** Writes a throwaway content tree: { "mod/module.yaml": "..." } */
const dirs: string[] = []
function makeContent(files: Record<string, string>) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "ndn-content-"))
  dirs.push(root)
  for (const [rel, body] of Object.entries(files)) {
    const file = path.join(root, rel)
    fs.mkdirSync(path.dirname(file), { recursive: true })
    fs.writeFileSync(file, body)
  }
  return root
}
afterEach(() => dirs.splice(0).forEach((d) => fs.rmSync(d, { recursive: true, force: true })))

const moduleYaml = (over = "") => `title: Demo
part: 1
order: 0
description: A demo module.
icon: code
idPrefix: dm
${over}`

const lesson = (title: string) => `---
title: ${title}
summary: Summary.
estimatedMinutes: 5
difficulty: easy
objectives: [Learn a thing]
---

## Body
`

const problem = (id: string, title: string) => `id: ${id}
title: ${title}
difficulty: medium
tags: [lists]
statement: Do it.
examples:
  - input: "1"
    output: "2"
hints: [Think.]
solution:
  language: python
  code: print(2)
  explanation: Prints two.
complexity: { time: O(1), space: O(1) }
`

describe("content loader", () => {
  it("auto-discovers modules (folders with module.yaml) sorted by part then order", () => {
    const root = makeContent({
      "b/module.yaml": moduleYaml().replace("part: 1", "part: 2").replace("dm", "bb"),
      "a/module.yaml": moduleYaml(),
      "not-a-module/readme.md": "ignored",
    })
    expect(loadModules(root).map((m) => m.slug)).toEqual(["a", "b"])
  })

  it("orders lessons by their NN- prefix and derives the slug", () => {
    const root = makeContent({
      "a/module.yaml": moduleYaml(),
      "a/lessons/02-second.mdx": lesson("Second"),
      "a/lessons/01-first.mdx": lesson("First"),
    })
    const lessons = loadLessons("a", root)
    expect(lessons.map((l) => [l.order, l.slug, l.title])).toEqual([
      [1, "first", "First"],
      [2, "second", "Second"],
    ])
    expect(lessons[0]!.body).toContain("## Body")
  })

  it("rejects a lesson file name without the NN- prefix", () => {
    const root = makeContent({ "a/module.yaml": moduleYaml(), "a/lessons/intro.mdx": lesson("X") })
    expect(() => loadLessons("a", root)).toThrow(/01-my-lesson\.mdx/)
  })

  it("reports the file and field for invalid content", () => {
    const root = makeContent({
      "a/module.yaml": moduleYaml(),
      "a/problems/dm-p-001.yaml": problem("dm-p-001", "T").replace(
        "difficulty: medium",
        "difficulty: extreme",
      ),
    })
    const err = (() => {
      try {
        loadProblems("a", root)
      } catch (e) {
        return e as Error
      }
    })()
    expect(err).toBeInstanceOf(ContentError)
    expect(err?.message).toMatch(/dm-p-001\.yaml/)
    expect(err?.message).toMatch(/difficulty/)
  })

  it("requires the file name to equal the id", () => {
    const root = makeContent({
      "a/module.yaml": moduleYaml(),
      "a/problems/wrong-name.yaml": problem("dm-p-001", "T"),
    })
    expect(() => loadProblems("a", root)).toThrow(/dm-p-001\.yaml/)
  })

  it("rejects malformed YAML with the file name", () => {
    const root = makeContent({ "a/module.yaml": "title: [unclosed" })
    expect(() => loadModules(root)).toThrow(/module\.yaml/)
  })

  it("flags duplicate titles and ids with the wrong module prefix", () => {
    const root = makeContent({
      "a/module.yaml": moduleYaml(),
      "a/problems/dm-p-001.yaml": problem("dm-p-001", "Same Title"),
      "a/problems/dm-p-002.yaml": problem("dm-p-002", "same title!"),
      "a/problems/xx-p-003.yaml": problem("xx-p-003", "Other"),
    })
    expect(() => loadAllContent(root)).toThrow(/duplicate title/)
    expect(() => loadAllContent(root)).toThrow(/must start with "dm-"/)
  })

  it("flags two modules sharing an idPrefix", () => {
    const root = makeContent({ "a/module.yaml": moduleYaml(), "b/module.yaml": moduleYaml() })
    expect(() => loadAllContent(root)).toThrow(/idPrefix "dm"/)
  })

  it("the real content/ folder is valid", () => {
    const bundles = loadAllContent()
    expect(bundles.length).toBeGreaterThan(0)
    const startHere = bundles.find((b) => b.module.slug === "start-here")!
    expect(startHere.lessons.length).toBeGreaterThanOrEqual(2)
    expect(startHere.problems.length).toBeGreaterThanOrEqual(2)
    expect(startHere.interview.length).toBeGreaterThanOrEqual(2)
  })
})
