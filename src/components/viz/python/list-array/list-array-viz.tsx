"use client"

import dynamic from "next/dynamic"
import { VizFrame, useViz } from "../../_shared/viz-frame"
import { cn } from "@/lib/utils"
import { LIST_OPS_CAPTION, LIST_OPS_FRAMES, LIST_OPS_STEPS } from "./model"

const ListArrayScene3D = dynamic(() => import("./scene-3d"), {
  ssr: false,
  loading: () => <div className="bg-surface-2 h-72 animate-pulse sm:h-80" />,
})

/** Shown under both the 3D scene and the fallback: what this operation costs. */
function CostLine() {
  const { step } = useViz()
  const f = LIST_OPS_FRAMES[step]!
  return (
    <p className="text-muted px-4 pb-3 text-center font-mono text-xs" data-testid="list-cost">
      {f.cost}
    </p>
  )
}

function ListArrayFallback() {
  const { step } = useViz()
  const f = LIST_OPS_FRAMES[step]!
  return (
    <div className="px-4 py-6">
      <p className="mb-4 text-center">
        <code className="bg-surface-2 rounded-md px-3 py-1 font-mono text-sm">{f.code}</code>
      </p>
      <ol
        className="mx-auto flex max-w-full flex-wrap justify-center gap-1.5"
        aria-label={`Slots: ${f.slots.map((s) => s ?? "spare").join(", ")}`}
      >
        {f.slots.map((v, i) => (
          <li key={i} className="flex flex-col items-center gap-1">
            <span
              className={cn(
                "grid size-11 place-items-center rounded-md border-2 font-mono text-sm font-bold",
                v === null
                  ? "border-rule text-muted border-dashed"
                  : f.focus.includes(i)
                    ? "border-medium bg-medium-soft"
                    : "border-accent bg-accent-soft",
              )}
            >
              {v ?? ""}
            </span>
            <span className="text-muted font-mono text-[0.7rem]">{i}</span>
          </li>
        ))}
      </ol>
    </div>
  )
}

export function ListArrayViz() {
  return (
    <VizFrame
      title="Inside a list: one block of slots"
      caption={LIST_OPS_CAPTION}
      steps={LIST_OPS_STEPS}
      kind="3d"
      intervalMs={2600}
      fallback={
        <>
          <ListArrayFallback />
          <CostLine />
        </>
      }
    >
      <ListArrayScene3D />
      <CostLine />
    </VizFrame>
  )
}
