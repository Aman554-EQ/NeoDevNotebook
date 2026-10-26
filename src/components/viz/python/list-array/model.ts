import type { VizStep } from "../../_shared/viz-frame"

/**
 * A list as CPython stores it: one contiguous block of slots (capacity), the first `len` in use.
 * Capacities below were measured with sys.getsizeof on CPython 3.13 (see lesson 11).
 */
export type ListFrame = {
  code: string
  /** Slot contents; null = spare capacity. */
  slots: (string | null)[]
  /** Slots that move or are touched in this step. */
  focus: number[]
  /** "shift" = items slid one place; "resize" = copied into a new, bigger block. */
  effect?: "shift" | "resize" | "direct"
  cost: string
}

export const LIST_OPS_FRAMES: ListFrame[] = [
  {
    code: "nums = [10, 20, 30]",
    slots: ["10", "20", "30", null],
    focus: [0, 1, 2],
    cost: "len 3 · capacity 4",
  },
  {
    code: "nums[2]",
    slots: ["10", "20", "30", null],
    focus: [2],
    effect: "direct",
    cost: "O(1): address = start + 2 × slot size",
  },
  {
    code: "nums.append(40)",
    slots: ["10", "20", "30", "40"],
    focus: [3],
    cost: "O(1): fills the spare slot",
  },
  {
    code: "nums.insert(0, 5)",
    slots: ["5", "10", "20", "30", "40", null, null, null],
    focus: [0, 1, 2, 3, 4],
    effect: "resize",
    cost: "O(n): new block of 8, then every item shifts right",
  },
  {
    code: "nums.pop()",
    slots: ["5", "10", "20", "30", null, null, null, null],
    focus: [4],
    cost: "O(1): nothing else moves",
  },
  {
    code: "nums.pop(0)",
    slots: ["10", "20", "30", null, null, null, null, null],
    focus: [0, 1, 2],
    effect: "shift",
    cost: "O(n): every remaining item shifts left",
  },
]

export const LIST_OPS_STEPS: VizStep[] = [
  {
    label: "Create",
    narration:
      "The list stores references in one contiguous block. Here 3 slots are used and 1 is spare (capacity 4).",
  },
  {
    label: "Index",
    narration:
      "nums[2] jumps straight to slot 2 with arithmetic on the block's address: O(1), no matter how long the list is.",
  },
  {
    label: "Append",
    narration: "append(40) drops into the spare slot. No other item moves: O(1).",
  },
  {
    label: "Insert at front",
    narration:
      "insert(0, 5) needs a 5th slot, so CPython allocates a block of 8, copies everything, and shifts every item one place right to free slot 0: O(n).",
  },
  {
    label: "Pop end",
    narration: "pop() removes the last item. Nothing else moves: O(1).",
  },
  {
    label: "Pop front",
    narration:
      "pop(0) removes the first item, and every other item slides one place left to close the gap: O(n). For a queue, use collections.deque.",
  },
]

export const LIST_OPS_CAPTION =
  "Work at the END of a list is cheap; work at the FRONT or middle moves every item after it. Indexing is always O(1) because slots are contiguous."
