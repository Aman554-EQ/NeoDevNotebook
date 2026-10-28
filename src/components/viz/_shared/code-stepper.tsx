import { highlightLines } from "@/lib/mdx/highlight"
import { describeStep } from "@/lib/trace/narrate"
import { loadTrace } from "@/lib/trace/load"
import { CodeStepperView } from "./code-stepper-view"

type Props = {
  /** Module whose content/<module>/traces/ folder holds the trace (bound by the lesson page). */
  module: string
  /** Trace name: content/<module>/traces/<trace>.py */
  trace: string
  title: string
  /** "What to notice". */
  caption: string
}

/**
 * Replays a real, recorded Python run (see scripts/trace_python.py). Loading, highlighting
 * and narration all happen at build time; the client only switches between steps.
 */
export async function CodeStepper({ module, trace: name, title, caption }: Props) {
  const trace = loadTrace(module, name)
  const sourceLines = trace.source.replace(/\n$/, "").split("\n")
  const lines = await highlightLines(trace.source.replace(/\n$/, ""), "python")
  const steps = trace.steps.map((_, i) => describeStep(trace.steps, i, sourceLines))
  return (
    <CodeStepperView
      title={title}
      caption={caption}
      steps={steps}
      trace={{ steps: trace.steps, truncated: trace.truncated, python: trace.python }}
      lines={lines}
    />
  )
}
