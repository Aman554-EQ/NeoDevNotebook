import { describe, expect, it } from "vitest"
import { extractSamples, parseFences } from "@/lib/content/samples"
import { loadAllContent } from "@/lib/content/load"

describe("code sample extraction", () => {
  it("parses fences in order with language and meta", () => {
    const md = 'Text\n\n```python title="a.py"\nprint(1)\n```\n\n```text title="Output"\n1\n```\n'
    expect(parseFences(md)).toEqual([
      { lang: "python", meta: 'title="a.py"', code: "print(1)\n" },
      { lang: "text", meta: 'title="Output"', code: "1\n" },
    ])
  })

  it("attaches a following Output block as the expected output", () => {
    const bundles = [
      {
        module: {
          slug: "m",
          title: "M",
          part: 0,
          order: 0,
          description: "d",
          icon: "code" as const,
          idPrefix: "mm",
        },
        lessons: [
          {
            title: "L",
            summary: "s",
            estimatedMinutes: 1,
            difficulty: "easy" as const,
            objectives: ["o"],
            prerequisites: [],
            tags: [],
            practice: [],
            interview: [],
            module: "m",
            slug: "l",
            order: 1,
            file: "x",
            body: '```python norun\nraise SystemExit\n```\n\n```python\nprint(2)\n```\n\n```text title="Output"\n2\n```',
          },
        ],
        problems: [],
        interview: [],
        projects: [],
      },
    ]
    const samples = extractSamples(bundles)
    expect(samples).toHaveLength(2)
    expect(samples[0]).toMatchObject({ flags: ["norun"], expectedOutput: undefined })
    expect(samples[1]).toMatchObject({ code: "print(2)\n", expectedOutput: "2\n", flags: [] })
  })

  it("appends the hidden verify block to problem solutions", () => {
    const samples = extractSamples(loadAllContent())
    const sol = samples.find((s) => s.source === "problem:sh-p-002:solution")!
    expect(sol.code).toContain("def resize_stats")
    expect(sol.code).toContain("# --- verify ---")
  })
})
