"use client"

import dynamic from "next/dynamic"
import { VizFrame, type VizStep } from "../_shared/viz-frame"

// The animated scene (and the motion library) loads only when this visual scrolls into view.
const ListAppendScene = dynamic(() => import("./list-append-scene"), {
  ssr: false,
  loading: () => <div className="bg-surface-2 h-64 animate-pulse" />,
})

const STEPS: VizStep[] = [
  { label: "Empty list", narration: "An empty list owns no slots yet: len 0, capacity 0." },
  {
    label: "First append",
    narration: "Python reserves 4 slots at once (over-allocation), then stores 10 in the first.",
  },
  { label: "Spare slot", narration: "20 goes into a spare slot. No memory is allocated: O(1)." },
  { label: "Spare slot", narration: "30 also fits. Still no copying." },
  { label: "Block full", narration: "40 fills the last slot. len == capacity == 4." },
  {
    label: "Resize",
    narration:
      "No room for 50: Python allocates a bigger block (8 slots), copies the 4 items over, then appends. This copy is O(n), but it is rare.",
  },
]

export function ListAppendViz() {
  return (
    <VizFrame
      title="How list.append grows a Python list"
      caption="Most appends drop into a spare slot (cheap). Only when the block is full does Python copy everything into a bigger block — that is why append is O(1) amortized."
      steps={STEPS}
    >
      <ListAppendScene />
    </VizFrame>
  )
}
