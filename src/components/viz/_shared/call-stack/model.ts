import { describeStep, type TraceFrame, type TraceStep } from "@/lib/trace/narrate"
import type { VizStep } from "../viz-frame"

export type StackFrameView = { title: string; detail: string }
export type StackSnapshot = {
  frames: StackFrameView[]
  /** Index of the frame that is returning (shown with its value), if any. */
  returning?: { index: number; value: string }
  line: number
}

const MAX_LOCALS = 3

/** "fact(n=3)" for a call frame; "global" for the module frame. */
export function frameTitle(f: TraceFrame): string {
  if (f.name === "<module>") return "global"
  return `${f.name}()`
}

/** Short summary of a frame's variables, skipping functions and classes. */
export function frameDetail(f: TraceFrame): string {
  const vars = f.locals.filter(([, v]) => !/^(function|class|module) /.test(v))
  const shown = vars.slice(0, MAX_LOCALS).map(([k, v]) => `${k}=${v}`)
  if (vars.length > MAX_LOCALS) shown.push("…")
  return shown.join(", ")
}

/**
 * Keeps the steps where the stack changes (calls and returns), plus the first and last step,
 * so the visual shows frames being pushed and popped rather than every line.
 */
export function stackSnapshots(
  steps: TraceStep[],
  sourceLines: string[],
): { snapshots: StackSnapshot[]; vizSteps: VizStep[] } {
  const keep = steps
    .map((s, i) => ({ s, i }))
    .filter(
      ({ s, i }) => i === 0 || i === steps.length - 1 || s.event === "call" || s.event === "return",
    )
  const snapshots = keep.map(({ s }) => ({
    frames: s.frames.map((f) => ({ title: frameTitle(f), detail: frameDetail(f) })),
    returning:
      s.event === "return" && s.frames.length > 1
        ? { index: s.frames.length - 1, value: s.returnValue ?? "None" }
        : undefined,
    line: s.line,
  }))
  const vizSteps = keep.map(({ i }) => describeStep(steps, i, sourceLines))
  return { snapshots, vizSteps }
}
