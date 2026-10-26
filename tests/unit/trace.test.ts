// @vitest-environment node
import { execFileSync, spawnSync } from "node:child_process"
import fs from "node:fs"
import os from "node:os"
import path from "node:path"
import { afterEach, describe, expect, it } from "vitest"
import { splitHighlightedLines, highlightLines } from "@/lib/mdx/highlight"
import { loadTrace } from "@/lib/trace/load"
import { changedVars, describeStep, type Trace } from "@/lib/trace/narrate"

/** These tests run the real recorder, so they need the same Python as `pnpm verify:code`. */
const SCRIPT = path.resolve("scripts/trace_python.py")
const FIXTURE = path.resolve("tests/fixtures/traces/basics.py")

function recordOne(file: string): Trace {
  return JSON.parse(execFileSync("python", [SCRIPT, "--one", file], { encoding: "utf8" })) as Trace
}

describe("trace recorder", () => {
  const trace = recordOne(FIXTURE)
  const sourceLines = trace.source.split("\n")

  it("matches the hand-checked execution of the fixture", () => {
    // [line, event, innermost frame, its variables, stdout so far]
    const compact = trace.steps.map((s) => {
      const f = s.frames.at(-1)!
      return [s.line, s.event, f.name, Object.fromEntries(f.locals), s.stdout]
    })
    const g = (total: string, i?: string) => ({
      double: "function double",
      total,
      ...(i === undefined ? {} : { i }),
    })
    expect(compact).toEqual([
      [1, "line", "<module>", {}, ""],
      [5, "line", "<module>", { double: "function double" }, ""],
      [6, "line", "<module>", g("0"), ""],
      [7, "line", "<module>", g("0", "0"), ""],
      [1, "call", "double", { n: "0" }, ""],
      [2, "line", "double", { n: "0" }, ""],
      [2, "return", "double", { n: "0" }, ""],
      [6, "line", "<module>", g("0", "0"), ""],
      [7, "line", "<module>", g("0", "1"), ""],
      [1, "call", "double", { n: "1" }, ""],
      [2, "line", "double", { n: "1" }, ""],
      [2, "return", "double", { n: "1" }, ""],
      [6, "line", "<module>", g("2", "1"), ""],
      [8, "line", "<module>", g("2", "1"), ""],
      [9, "line", "<module>", g("2", "1"), "total 2\n"],
      [10, "line", "<module>", g("2", "1"), "total 2\n"],
      [10, "exception", "<module>", g("2", "1"), "total 2\n"],
      [11, "line", "<module>", g("2", "1"), "total 2\n"],
      [12, "line", "<module>", g("2", "1"), "total 2\n"],
      [12, "return", "<module>", g("2", "1"), "total 2\ncaught\n"],
    ])
    expect(trace.steps[11]!.returnValue).toBe("2")
    expect(trace.steps[16]!.exception).toBe(
      "ValueError: invalid literal for int() with base 10: 'x'",
    )
    expect(trace.steps[4]!.frames.map((f) => f.name)).toEqual(["<module>", "double"])
    expect(trace).toMatchObject({ version: 1, truncated: false, stdout: "total 2\ncaught\n" })
    expect(trace.error).toBeUndefined()
  })

  it("narrates calls, returns, exceptions, changes and output", () => {
    const say = (i: number) => describeStep(trace.steps, i, sourceLines)
    expect(say(4)).toEqual({
      label: "Call double",
      narration: "double(n=0) is called, so a new frame is pushed onto the call stack.",
    })
    expect(say(11).narration).toBe("double returns 2; its frame is popped off the stack.")
    expect(say(12).narration).toContain("Now total = 2 (was 0)")
    expect(say(14).narration).toContain("Printed: total 2.")
    expect(say(16)).toMatchObject({ label: "Exception" })
    expect(say(19)).toEqual({ label: "Finished", narration: "The program ends. Printed: caught." })
    expect(changedVars(trace.steps[7], trace.steps[8]!)).toEqual(["i = 1 (was 0)"])
  })

  it("records generator yields and resumes (not calls/returns)", () => {
    const gen = recordOne(path.resolve("tests/fixtures/traces/generator.py"))
    const events = gen.steps
      .filter((s) => s.frames.at(-1)!.name === "countdown" && s.event !== "line")
      .map((s) => [s.event, s.returnValue ?? null])
    expect(events).toEqual([
      ["call", null],
      ["yield", "2"],
      ["resume", null],
      ["yield", "1"],
      ["resume", null],
      ["return", "None"],
    ])
    const lines = gen.source.split("\n")
    const y = gen.steps.findIndex((s) => s.event === "yield")
    expect(describeStep(gen.steps, y, lines).narration).toContain("countdown yields 2 and pauses")
    expect(gen.stdout).toBe("2\n1\n")
  })

  it("truncates long runs and records uncaught errors instead of crashing", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "ndn-trace-"))
    try {
      const loop = path.join(dir, "loop.py")
      fs.writeFileSync(loop, "n = 0\nwhile True:\n    n += 1\n")
      const t = recordOne(loop)
      expect(t.truncated).toBe(true)
      expect(t.steps).toHaveLength(120)

      const boom = path.join(dir, "boom.py")
      fs.writeFileSync(boom, "class Thing:\n    pass\n\nx = Thing()\n1 / 0\n")
      const b = recordOne(boom)
      expect(b.error).toBe("ZeroDivisionError: division by zero")
      // Object reprs never contain memory addresses, so traces are reproducible.
      expect(JSON.stringify(b)).not.toMatch(/0x[0-9a-f]{6,}/i)
      expect(Object.fromEntries(b.steps.at(-1)!.frames[0]!.locals)).toMatchObject({
        Thing: "class Thing",
        x: "<__main__.Thing object>",
      })
    } finally {
      fs.rmSync(dir, { recursive: true, force: true })
    }
  })
})

describe("committed traces (record / --check)", () => {
  const dirs: string[] = []
  afterEach(() => dirs.splice(0).forEach((d) => fs.rmSync(d, { recursive: true, force: true })))

  const run = (root: string, ...args: string[]) =>
    spawnSync("python", [SCRIPT, ...args], {
      encoding: "utf8",
      env: { ...process.env, NDN_CONTENT_DIR: root },
    })

  it("detects missing, stale and orphaned traces", () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "ndn-traces-"))
    dirs.push(root)
    const src = path.join(root, "demo", "traces", "hello.py")
    fs.mkdirSync(path.dirname(src), { recursive: true })
    fs.writeFileSync(src, 'print("hi")\n')

    expect(run(root, "--check").stdout).toContain("trace missing")
    expect(run(root).status).toBe(0) // record
    expect(run(root, "--check").status).toBe(0)

    fs.writeFileSync(src, 'print("changed")\n')
    const stale = run(root, "--check")
    expect(stale.status).toBe(1)
    expect(stale.stdout).toContain("demo/traces/hello.py: trace is stale")

    fs.rmSync(src)
    expect(run(root, "--check").stdout).toContain("no matching .py source")
  })

  it("loads a recorded trace and rejects bad names", () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "ndn-traces-"))
    dirs.push(root)
    const src = path.join(root, "demo", "traces", "hello.py")
    fs.mkdirSync(path.dirname(src), { recursive: true })
    fs.writeFileSync(src, "x = 1\n")
    run(root)
    expect(loadTrace("demo", "hello", root).steps[0]!.line).toBe(1)
    expect(() => loadTrace("demo", "../secret", root)).toThrow(/Invalid trace name/)
    expect(() => loadTrace("demo", "nope", root)).toThrow(/Trace not found/)
  })
})

describe("per-line highlighting", () => {
  it("splits Shiki output into one HTML string per source line", async () => {
    const lines = await highlightLines('x = 1\n\nprint("a\\nb")', "python")
    expect(lines).toHaveLength(3)
    expect(lines[1]).toBe("")
    expect(lines[2]).toContain("print")
    expect(lines.join("")).not.toContain('class="line"')
  })

  it("handles markup without a code element", () => {
    expect(splitHighlightedLines("<pre></pre>")).toEqual([""])
  })
})
