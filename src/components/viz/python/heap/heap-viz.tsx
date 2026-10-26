"use client"

import dynamic from "next/dynamic"
import { VizFrame, useViz } from "../../_shared/viz-frame"
import { cn } from "@/lib/utils"
import { HEAP_CAPTION, HEAP_FRAMES, HEAP_STEPS, heapNodePos } from "./model"

const HeapScene3D = dynamic(() => import("./scene-3d"), {
  ssr: false,
  loading: () => <div className="bg-surface-2 h-72 animate-pulse sm:h-80" />,
})

/** SVG tree + array, same frames as the 3D scene. */
function HeapFallback() {
  const { step } = useViz()
  const f = HEAP_FRAMES[step]!
  const sx = (x: number) => 320 + x * 80
  const sy = (y: number) => 60 + (1.6 - y) * 70
  return (
    <div className="space-y-3 px-4 py-5">
      <p className="text-center">
        <code className="bg-surface-2 rounded-md px-3 py-1 font-mono text-sm">{f.code}</code>
      </p>
      <svg
        viewBox="0 0 640 230"
        className="mx-auto h-auto w-full max-w-xl"
        role="img"
        aria-label={`Heap as a tree: ${f.heap.join(", ") || "empty"}`}
      >
        {f.heap.map((_, i) => {
          if (i === 0) return null
          const a = heapNodePos(i)
          const p = heapNodePos(Math.floor((i - 1) / 2))
          return (
            <line
              key={`e${i}`}
              x1={sx(p.x)}
              y1={sy(p.y)}
              x2={sx(a.x)}
              y2={sy(a.y)}
              stroke="var(--muted)"
              strokeWidth={2}
            />
          )
        })}
        {f.heap.map((v, i) => {
          const { x, y } = heapNodePos(i)
          return (
            <g key={i}>
              <circle
                cx={sx(x)}
                cy={sy(y)}
                r={22}
                fill={f.path.includes(i) ? "var(--medium)" : "var(--accent)"}
              />
              <text
                x={sx(x)}
                y={sy(y) + 6}
                textAnchor="middle"
                fontFamily="var(--font-mono)"
                fontWeight={700}
                fontSize={17}
                fill="var(--accent-ink)"
              >
                {v}
              </text>
            </g>
          )
        })}
      </svg>
      <ol className="flex flex-wrap justify-center gap-1.5" aria-label="Heap as a list">
        {f.heap.map((v, i) => (
          <li
            key={i}
            className={cn(
              "flex flex-col items-center rounded-md border-2 px-3 py-1 font-mono text-sm",
              f.path.includes(i) ? "border-medium bg-medium-soft" : "border-rule bg-surface",
            )}
          >
            {v}
            <span className="text-muted text-[0.65rem]">[{i}]</span>
          </li>
        ))}
      </ol>
      {f.popped !== undefined && (
        <p className="text-easy text-center font-mono text-sm">returned {f.popped}</p>
      )}
    </div>
  )
}

export function HeapViz() {
  return (
    <VizFrame
      title="A heap: a tree stored in a list"
      caption={HEAP_CAPTION}
      steps={HEAP_STEPS}
      kind="3d"
      intervalMs={2800}
      fallback={<HeapFallback />}
    >
      <HeapScene3D />
    </VizFrame>
  )
}
