"use client"

import dynamic from "next/dynamic"
import { VizFrame } from "../_shared/viz-frame"
import { NamesFallback } from "./names-fallback"
import { NAMES_CAPTION, NAMES_STEPS } from "./names-model"

// three.js + R3F load only when this visual scrolls into view (never in the initial bundle).
const NamesScene3D = dynamic(() => import("./names-scene-3d"), {
  ssr: false,
  loading: () => <div className="bg-surface-2 h-72 animate-pulse sm:h-80" />,
})

export function NamesViz() {
  return (
    <VizFrame
      title="Names point at objects"
      caption={NAMES_CAPTION}
      steps={NAMES_STEPS}
      kind="3d"
      fallback={<NamesFallback />}
      intervalMs={2400}
    >
      <NamesScene3D />
    </VizFrame>
  )
}
