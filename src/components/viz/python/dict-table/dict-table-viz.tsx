"use client"

import dynamic from "next/dynamic"
import { VizFrame, useViz } from "../../_shared/viz-frame"
import { cn } from "@/lib/utils"
import { DICT_CAPTION, DICT_FRAMES, DICT_STEPS } from "./model"

const DictScene3D = dynamic(() => import("./scene-3d"), {
  ssr: false,
  loading: () => <div className="bg-surface-2 h-72 animate-pulse sm:h-80" />,
})

function DictFallback() {
  const { step } = useViz()
  const f = DICT_FRAMES[step]!
  return (
    <div className="space-y-4 px-4 py-5" data-testid="dict-fallback">
      <p className="text-center">
        <code className="bg-surface-2 rounded-md px-3 py-1 font-mono text-sm">{f.code}</code>
      </p>
      <div>
        <p className="text-muted mb-1 text-xs">Index table (slot → entry number)</p>
        <ol className="grid grid-cols-8 gap-1">
          {f.slots.map((entry, i) => {
            const order = f.probe.indexOf(i)
            const landed = order !== -1 && order === f.probe.length - 1
            return (
              <li
                key={i}
                aria-label={`slot ${i}: ${entry === null ? "empty" : `entry ${entry}`}${order !== -1 ? `, probe ${order + 1}` : ""}`}
                className={cn(
                  "flex flex-col items-center rounded-md border-2 py-1 font-mono text-sm",
                  landed
                    ? "border-accent bg-accent-soft font-bold"
                    : order !== -1
                      ? "border-medium bg-medium-soft"
                      : entry === null
                        ? "border-rule border-dashed"
                        : "border-rule bg-surface",
                )}
              >
                <span>{entry ?? "·"}</span>
                <span className="text-muted text-[0.65rem]">
                  {i}
                  {order !== -1 && f.probe.length > 1 ? ` #${order + 1}` : ""}
                </span>
              </li>
            )
          })}
        </ol>
      </div>
      <div>
        <p className="text-muted mb-1 text-xs">Entries (insertion order)</p>
        <ol className="flex flex-wrap gap-1.5">
          {f.entries.map((e, j) => (
            <li
              key={e.key}
              className={cn(
                "rounded-md border-2 px-2 py-1 font-mono text-sm",
                f.hit === j ? "border-accent bg-accent-soft font-bold" : "border-rule bg-surface",
              )}
            >
              {j}: {e.key} → {e.value}
            </li>
          ))}
          {!f.entries.length && <li className="text-muted text-sm italic">empty</li>}
        </ol>
      </div>
    </div>
  )
}

export function DictTableViz() {
  return (
    <VizFrame
      title="Inside a dict: hashing, collisions and insertion order"
      caption={DICT_CAPTION}
      steps={DICT_STEPS}
      kind="3d"
      intervalMs={2800}
      fallback={<DictFallback />}
    >
      <DictScene3D />
    </VizFrame>
  )
}
