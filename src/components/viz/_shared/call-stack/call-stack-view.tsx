"use client"

import dynamic from "next/dynamic"
import { VizFrame, useViz, type VizStep } from "../viz-frame"
import type { StackSnapshot } from "./model"

const CallStackScene3D = dynamic(() => import("./scene-3d"), {
  ssr: false,
  loading: () => <div className="bg-surface-2 h-72 animate-pulse sm:h-80" />,
})

export function CallStackView({
  title,
  caption,
  steps,
  snapshots,
  codeLines,
}: {
  title: string
  caption: string
  steps: VizStep[]
  snapshots: StackSnapshot[]
  codeLines: string[]
}) {
  return (
    <VizFrame
      title={title}
      caption={caption}
      steps={steps}
      kind="3d"
      intervalMs={1600}
      fallback={<CallStackFallback snapshots={snapshots} codeLines={codeLines} />}
    >
      <CallStackScene3D snapshots={snapshots} codeLines={codeLines} />
    </VizFrame>
  )
}

/** Static version: the same stack as a column of cards, innermost frame on top. */
function CallStackFallback({
  snapshots,
  codeLines,
}: {
  snapshots: StackSnapshot[]
  codeLines: string[]
}) {
  const { step } = useViz()
  const snap = snapshots[step]!
  return (
    <div className="px-4 py-5" data-testid="callstack-fallback">
      <p className="mb-3 text-center">
        <code className="bg-surface-2 rounded-md px-3 py-1 font-mono text-sm">
          {codeLines[step]}
        </code>
      </p>
      <ol
        className="mx-auto flex max-w-sm flex-col-reverse gap-1.5"
        aria-label="Call stack, innermost on top"
      >
        {snap.frames.map((f, i) => {
          const top = i === snap.frames.length - 1
          const ret = snap.returning?.index === i
          return (
            <li
              key={i}
              className={
                ret
                  ? "border-easy bg-easy-soft rounded-md border-2 px-3 py-2"
                  : top
                    ? "border-accent bg-accent-soft rounded-md border-2 px-3 py-2"
                    : "border-rule bg-surface rounded-md border px-3 py-2"
              }
            >
              <p className="font-mono text-sm font-semibold">
                {f.title}
                {ret && <span className="text-easy"> → returns {snap.returning!.value}</span>}
              </p>
              {f.detail && <p className="text-muted font-mono text-xs">{f.detail}</p>}
            </li>
          )
        })}
      </ol>
    </div>
  )
}
