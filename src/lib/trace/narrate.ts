/** Execution traces recorded by scripts/trace_python.py, and how each step is described. */

export type TraceFrame = { name: string; locals: [string, string][] }
export type TraceStep = {
  line: number
  event: "line" | "call" | "return" | "exception" | "yield" | "resume"
  frames: TraceFrame[]
  stdout: string
  returnValue?: string
  exception?: string
}
export type Trace = {
  version: 1
  python: string
  source: string
  steps: TraceStep[]
  stdout: string
  truncated: boolean
  error?: string
}

const top = (s: TraceStep) => s.frames.at(-1)

/** Variables that are new or changed in the innermost frame since the previous step of that same frame. */
export function changedVars(prev: TraceStep | undefined, cur: TraceStep): string[] {
  const now = top(cur)
  if (!now) return []
  const before = prev?.frames.find((f, i) => f.name === now.name && i === cur.frames.length - 1)
  const old = new Map(before?.locals ?? [])
  return now.locals
    .filter(([name, value]) => old.get(name) !== value)
    .map(([name, value]) =>
      old.has(name) ? `${name} = ${value} (was ${old.get(name)})` : `${name} = ${value}`,
    )
}

const MODULE = "<module>"

/** Short label + a sentence a screen reader can read for one step. */
export function describeStep(
  steps: TraceStep[],
  index: number,
  sourceLines: string[],
): { label: string; narration: string } {
  const cur = steps[index]!
  const prev = steps[index - 1]
  const code = (sourceLines[cur.line - 1] ?? "").trim()
  const fn = top(cur)?.name ?? MODULE
  const printed =
    prev && cur.stdout.length > prev.stdout.length
      ? ` Printed: ${cur.stdout.slice(prev.stdout.length).trimEnd()}.`
      : ""

  switch (cur.event) {
    case "call": {
      const args = (top(cur)?.locals ?? []).map(([n, v]) => `${n}=${v}`).join(", ")
      return {
        label: `Call ${fn}`,
        narration: `${fn}(${args}) is called, so a new frame is pushed onto the call stack.`,
      }
    }
    case "return":
      if (fn === MODULE) {
        return { label: "Finished", narration: `The program ends.${printed}` }
      }
      return {
        label: `Return from ${fn}`,
        narration: `${fn} returns ${cur.returnValue ?? "None"}; its frame is popped off the stack.${printed}`,
      }
    case "yield":
      return {
        label: `${fn} yields`,
        narration: `${fn} yields ${cur.returnValue ?? "None"} and pauses here; its local variables are kept for later.${printed}`,
      }
    case "resume":
      return {
        label: `Resume ${fn}`,
        narration: `The loop asks for the next value, so ${fn} resumes right after its last yield, with its variables intact.`,
      }
    case "exception":
      return {
        label: "Exception",
        narration: `Line ${cur.line} raised ${cur.exception ?? "an exception"}.`,
      }
    default: {
      const changes = changedVars(prev, cur)
      const changed = prev && changes.length ? ` Now ${changes.join(", ")}.` : ""
      return {
        label: `Line ${cur.line}`,
        narration: `Next to run: line ${cur.line}, ${code ? `“${code}”` : "(blank)"}.${changed}${printed}`,
      }
    }
  }
}
