import type { VizStep } from "../../_shared/viz-frame"

/**
 * heapq keeps a list ordered as a binary min-heap: h[i] <= h[2i+1] and h[i] <= h[2i+2].
 * The arrays below are exactly what heapq produced (checked in tests/unit/viz-models.test.ts).
 */
export type HeapFrame = {
  code: string
  heap: number[]
  /** Indices that moved (sift path) or the slot that was filled. */
  path: number[]
  popped?: number
}

export const HEAP_OPS: { op: "push" | "pop"; value?: number }[] = [
  { op: "push", value: 5 },
  { op: "push", value: 3 },
  { op: "push", value: 8 },
  { op: "push", value: 1 },
  { op: "push", value: 4 },
  { op: "pop" },
]

export const HEAP_FRAMES: HeapFrame[] = [
  { code: "h = []", heap: [], path: [] },
  { code: "heapq.heappush(h, 5)", heap: [5], path: [0] },
  { code: "heapq.heappush(h, 3)", heap: [3, 5], path: [1, 0] },
  { code: "heapq.heappush(h, 8)", heap: [3, 5, 8], path: [2] },
  { code: "heapq.heappush(h, 1)", heap: [1, 3, 8, 5], path: [3, 1, 0] },
  { code: "heapq.heappush(h, 4)", heap: [1, 3, 8, 5, 4], path: [4] },
  { code: "heapq.heappop(h)  # → 1", heap: [3, 4, 8, 5], path: [0, 1], popped: 1 },
]

export const HEAP_STEPS: VizStep[] = [
  {
    label: "Empty",
    narration: "A heap is just a list. heapq keeps it in heap order: every parent ≤ its children.",
  },
  { label: "Push 5", narration: "The first item becomes the root, index 0: the smallest so far." },
  {
    label: "Push 3 (sift up)",
    narration:
      "3 is appended at index 1, then sifts up: it's smaller than its parent 5, so they swap. The root is the minimum again.",
  },
  {
    label: "Push 8",
    narration:
      "8 is appended at index 2. It's larger than its parent 3, so it stays. No swaps needed.",
  },
  {
    label: "Push 1 (two swaps)",
    narration:
      "1 is appended at index 3 (child of index 1). It swaps with 5, then with 3, climbing to the root: O(log n) swaps at most.",
  },
  {
    label: "Push 4",
    narration: "4 lands at index 4, child of 3. Since 4 ≥ 3 it stays. Siblings are not ordered.",
  },
  {
    label: "Pop (sift down)",
    narration:
      "heappop returns the root 1. The last item moves to the top and sifts down past smaller children until order is restored: [3, 4, 8, 5].",
  },
]

export const HEAP_CAPTION =
  "The smallest item is always h[0]. Push and pop only walk one root-to-leaf path, so they cost O(log n), much cheaper than sorting after every change."

/** Tree layout: (x, y) for index i in a heap drawn with `levels` rows. */
export function heapNodePos(i: number): { x: number; y: number; level: number } {
  const level = Math.floor(Math.log2(i + 1))
  const first = 2 ** level - 1
  const count = 2 ** level
  const span = 6.4
  const x = -span / 2 + ((i - first + 0.5) * span) / count
  return { x, y: 1.6 - level * 1.0, level }
}
