import fs from "node:fs"
import os from "node:os"
import path from "node:path"
import { afterEach, describe, expect, it } from "vitest"
import { findTargetGaps, loadAllContent } from "@/lib/content/load"
import { groupBySection, sectionId, splitSections } from "@/lib/content/sections"

const L = (slug: string, section?: string) => ({ slug, section })

describe("groupBySection", () => {
  it("keeps modules without sections as one unnamed group", () => {
    expect(groupBySection([L("a"), L("b")])).toEqual([{ section: null, items: [L("a"), L("b")] }])
  })

  it("groups consecutive lessons in order", () => {
    const groups = groupBySection([L("a", "Basics"), L("b", "Basics"), L("c", "Data"), L("d")])
    expect(groups.map((g) => [g.section, g.items.map((i) => i.slug)])).toEqual([
      ["Basics", ["a", "b"]],
      ["Data", ["c"]],
      [null, ["d"]],
    ])
  })

  it("reports a section that is split by another section", () => {
    expect(splitSections([L("a", "X"), L("b", "Y"), L("c", "X")])).toEqual(["X"])
    expect(splitSections([L("a", "X"), L("b", "X"), L("c", "Y")])).toEqual([])
  })

  it("builds stable, URL-safe ids", () => {
    expect(sectionId("python", "Packages, Imports & Tooling")).toBe(
      "python-packages-imports-tooling",
    )
  })
})

describe("section integrity in content", () => {
  const dirs: string[] = []
  afterEach(() => dirs.splice(0).forEach((d) => fs.rmSync(d, { recursive: true, force: true })))

  function tree(sections: string[]) {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "ndn-sections-"))
    dirs.push(root)
    const w = (rel: string, body: string) => {
      fs.mkdirSync(path.dirname(path.join(root, rel)), { recursive: true })
      fs.writeFileSync(path.join(root, rel), body)
    }
    w(
      "demo/module.yaml",
      "title: Demo\npart: 1\norder: 0\ndescription: D.\nicon: code\nidPrefix: dm\n",
    )
    sections.forEach((s, i) =>
      w(
        `demo/lessons/0${i + 1}-l${i + 1}.mdx`,
        `---\ntitle: L${i + 1}\nsummary: S.\nestimatedMinutes: 5\ndifficulty: easy\nobjectives: [O]\nsection: ${s}\n---\n\n## Body\n`,
      ),
    )
    return root
  }

  it("loads sections from front matter", () => {
    const [bundle] = loadAllContent(tree(["Basics", "Basics", "Data"]))
    expect(bundle!.lessons.map((l) => l.section)).toEqual(["Basics", "Basics", "Data"])
  })

  it("fails the build when a section's lessons are not consecutive", () => {
    expect(() => loadAllContent(tree(["Basics", "Data", "Basics"]))).toThrow(
      /section "Basics" is split/,
    )
  })
})

describe("content targets", () => {
  const dirs: string[] = []
  afterEach(() => dirs.splice(0).forEach((d) => fs.rmSync(d, { recursive: true, force: true })))

  function withProblems(targets: string, difficulties: string[]) {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "ndn-targets-"))
    dirs.push(root)
    const w = (rel: string, body: string) => {
      fs.mkdirSync(path.dirname(path.join(root, rel)), { recursive: true })
      fs.writeFileSync(path.join(root, rel), body)
    }
    w(
      "demo/module.yaml",
      `title: Demo\npart: 1\norder: 0\ndescription: D.\nicon: code\nidPrefix: dm\ntargets: ${targets}\n`,
    )
    difficulties.forEach((d, i) => {
      const id = `dm-p-00${i + 1}`
      w(
        `demo/problems/${id}.yaml`,
        `id: ${id}\ntitle: Problem ${i + 1}\ndifficulty: ${d}\ntags: [t]\nstatement: S.\nexamples:\n  - { input: "1", output: "1" }\nhints: [H]\nsolution: { language: python, code: "print(1)", explanation: E. }\ncomplexity: { time: O(1), space: O(1) }\n`,
      )
    })
    return loadAllContent(root)
  }

  it("passes when every declared minimum is met", () => {
    expect(findTargetGaps(withProblems("{ problems: 2 }", ["easy", "hard"]))).toEqual([])
  })

  it("reports totals and per-difficulty minimums that are not met", () => {
    const gaps = findTargetGaps(
      withProblems("{ problems: 3, problemsPerDifficulty: 1 }", ["easy", "easy"]),
    )
    expect(gaps).toEqual([
      "demo: problems 2 < target 3",
      "demo: simple problems 0 < target 1",
      "demo: medium problems 0 < target 1",
      "demo: hard problems 0 < target 1",
    ])
  })

  it("rejects unknown target keys (typos must not silently disable a check)", () => {
    expect(() => withProblems("{ problem: 60 }", [])).toThrow(/Unrecognized key/)
  })

  it("the real content meets every target it declares", () => {
    expect(findTargetGaps(loadAllContent())).toEqual([])
  })
})
