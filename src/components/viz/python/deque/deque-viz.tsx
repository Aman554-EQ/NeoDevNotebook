"use client"

import dynamic from "next/dynamic"
import { VizFrame, useViz, type VizStep } from "../../_shared/viz-frame"
import { cn } from "@/lib/utils"
import { DEQUE_FRAMES } from "./model"

const STEPS: VizStep[] = [
  {
    label: "Create",
    narration: "The items live in a block. Each end of the deque has spare room to grow into.",
  },
  {
    label: "append",
    narration:
      "The right block is full, so a new block is linked on the right and 4 goes into it. Nothing moves: O(1).",
  },
  {
    label: "appendleft",
    narration: "0 fills the free slot at the left end. Still O(1): no other item moves.",
  },
  {
    label: "popleft",
    narration:
      "popleft() removes 0 and just moves the left edge. A list's pop(0) would shift every remaining item.",
  },
  {
    label: "rotate",
    narration:
      "rotate(1) pops from the right and pushes on the left: 4 moves to the front, and the empty right block is freed.",
  },
]

const DequeScene3D = dynamic(() => import("./scene-3d"), {
  ssr: false,
  loading: () => <div className="bg-surface-2 h-72 animate-pulse sm:h-80" />,
})

function DequeFallback() {
  const { step } = useViz()
  const f = DEQUE_FRAMES[step]!
  return (
    <div className="space-y-4 px-4 py-6" data-testid="deque-fallback">
      <p className="text-center">
        <code className="bg-surface-2 rounded-md px-3 py-1 font-mono text-sm">{f.code}</code>
      </p>
      <div className="flex flex-wrap items-center justify-center gap-2">
        {f.blocks.map((b, bi) => (
          <div key={bi} className="flex items-center gap-2">
            {bi > 0 && (
              <span aria-hidden className="text-muted font-mono">
                ⇄
              </span>
            )}
            <ol
              className="border-accent flex gap-1 rounded-lg border-2 border-dashed p-1.5"
              aria-label={`block ${bi + 1}: ${b.map((v) => v ?? "empty").join(", ")}`}
            >
              {b.map((v, i) => (
                <li
                  key={i}
                  className={cn(
                    "grid size-10 place-items-center rounded-md font-mono text-sm font-bold",
                    v === null
                      ? "border-rule border border-dashed"
                      : f.touched.includes(v)
                        ? "bg-medium-soft border-medium border-2"
                        : "bg-accent-soft",
                  )}
                >
                  {v ?? ""}
                </li>
              ))}
            </ol>
          </div>
        ))}
      </div>
      {f.result && <p className="text-easy text-center font-mono text-sm">→ {f.result}</p>}
    </div>
  )
}

export function DequeViz() {
  return (
    <VizFrame
      title="A deque: linked blocks, fast at both ends"
      caption="A deque never shifts its items. Adding or removing at either end only touches the end block, so appendleft/popleft are O(1), unlike list.insert(0, x) or list.pop(0). Blocks here hold 4 items; CPython's hold 64."
      steps={STEPS}
      kind="3d"
      intervalMs={2600}
      fallback={<DequeFallback />}
    >
      <DequeScene3D />
    </VizFrame>
  )
}
