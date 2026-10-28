"use client"

import dynamic from "next/dynamic"
import { VizFrame } from "../../_shared/viz-frame"
import { MemoryFallback } from "./fallback"
import { MEMORY_SCENARIOS, type MemoryScenarioName } from "./model"

// three.js loads only when the visual scrolls into view.
const MemoryScene3D = dynamic(() => import("./scene-3d"), {
  ssr: false,
  loading: () => <div className="bg-surface-2 h-72 animate-pulse sm:h-80" />,
})

/** <MemoryViz scenario="copies" /> — names, objects and references in 3D. */
export function MemoryViz({ scenario }: { scenario: MemoryScenarioName }) {
  const s = MEMORY_SCENARIOS[scenario]
  return (
    <VizFrame
      title={s.title}
      caption={s.caption}
      steps={s.steps}
      kind="3d"
      fallback={<MemoryFallback scenario={scenario} />}
      intervalMs={2600}
    >
      <MemoryScene3D scenario={scenario} />
    </VizFrame>
  )
}
