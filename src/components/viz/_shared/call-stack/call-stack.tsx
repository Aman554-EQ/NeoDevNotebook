import { loadTrace } from "@/lib/trace/load"
import { CallStackView } from "./call-stack-view"
import { stackSnapshots } from "./model"

type Props = {
  /** Bound by the lesson page: the module whose traces/ folder holds the trace. */
  module: string
  trace: string
  title: string
  caption: string
}

/** 3D call stack replayed from a recorded run: frames are pushed on calls and popped on returns. */
export async function CallStack({ module, trace: name, title, caption }: Props) {
  const trace = loadTrace(module, name)
  const sourceLines = trace.source.replace(/\n$/, "").split("\n")
  const { snapshots, vizSteps } = stackSnapshots(trace.steps, sourceLines)
  return (
    <CallStackView
      title={title}
      caption={caption}
      steps={vizSteps}
      snapshots={snapshots}
      codeLines={snapshots.map((s) => (sourceLines[s.line - 1] ?? "").trim())}
    />
  )
}
