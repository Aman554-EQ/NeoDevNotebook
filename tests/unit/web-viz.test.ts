import { describe, expect, it } from "vitest"
import { formatSql } from "@/components/viz/_shared/web/recorded"
import { STACKS, lifecycleFrames } from "@/components/viz/web/request-lifecycle/model"
import { projectFileRefs } from "@/lib/content/load"
import { recordingSchema } from "@/lib/recording/load"

describe("request lifecycle model", () => {
  it("goes in through every layer, then back out, skipping layers with no outbound work", () => {
    for (const fw of ["django", "fastapi", "flask"] as const) {
      const frames = lifecycleFrames(fw)
      const inbound = frames.filter((f) => f.direction === "in").map((f) => f.at)
      expect(inbound, fw).toEqual([0, 1, 2, 3, 4, 5, 6])
      const outbound = frames.filter((f) => f.direction === "out").map((f) => f.at)
      expect(outbound.at(-1), fw).toBe(0) // ends back at the client
      expect(
        [...outbound].sort((a, b) => b - a),
        fw,
      ).toEqual(outbound) // strictly outward
      expect(
        frames.every((f) => f.narration.length > 20),
        fw,
      ).toBe(true)
      expect(STACKS[fw]).toHaveLength(7)
    }
  })

  it("a rejected request stops at the middleware layer and never reaches the database", () => {
    const frames = lifecycleFrames("django", "rejected")
    const middleware = STACKS.django.findIndex((l) => l.id === "middleware")
    expect(Math.max(...frames.map((f) => f.at))).toBe(middleware)
    expect(frames.at(-1)).toMatchObject({ at: 0, direction: "out", tone: "error" })
    expect(frames.at(-1)!.packet).toBe("302 → /login/")
  })
})

describe("recording helpers", () => {
  it("formatSql puts the main clauses on their own lines", () => {
    expect(
      formatSql(
        'SELECT "a"."id" FROM "a" INNER JOIN "b" ON (x) WHERE "a"."id" = 1 ORDER BY "a"."id" ASC',
      ),
    ).toBe(
      'SELECT "a"."id"\nFROM "a"\nINNER JOIN "b" ON (x)\nWHERE "a"."id" = 1\nORDER BY "a"."id" ASC',
    )
  })

  it("the recording schema rejects an unknown kind", () => {
    expect(recordingSchema.safeParse({ kind: "video", title: "x", steps: [] }).success).toBe(false)
  })
})

describe("project file references in MDX", () => {
  it("finds single and multi-file references, with or without an explicit project", () => {
    const body = [
      '<ProjectFile path="notes/models.py" />',
      '<ProjectFiles paths="a.py  b/c.py" />',
      '<ProjectFile project="shoplite" path="orders/services.py" />',
    ].join("\n")
    expect(projectFileRefs(body, "notes")).toEqual([
      { project: "notes", path: "notes/models.py" },
      { project: "notes", path: "a.py" },
      { project: "notes", path: "b/c.py" },
      { project: "shoplite", path: "orders/services.py" },
    ])
    expect(projectFileRefs('<ProjectFile path="x.py" />')).toEqual([
      { project: undefined, path: "x.py" },
    ])
  })
})
