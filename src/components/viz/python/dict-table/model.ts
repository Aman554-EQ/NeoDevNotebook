import type { VizStep } from "../../_shared/viz-frame"

/**
 * A CPython dict = a sparse INDEX table (8 slots here) pointing into a dense ENTRIES array
 * kept in insertion order. Slots and probe paths follow CPython's open addressing
 * (i = hash & mask; on collision perturb >>= 5; i = (5*i + perturb + 1) & mask), computed for
 * int keys, whose hash is the int itself. Verified in tests/unit/viz-models.test.ts.
 */
export type DictEntry = { key: string; value: string }
export type DictFrame = {
  code: string
  /** index table: slot → entry number (null = empty) */
  slots: (number | null)[]
  entries: DictEntry[]
  /** Slots visited in order by this step's probe; the last one is where it landed / matched. */
  probe: number[]
  /** Entry highlighted (inserted or found). */
  hit?: number
}

const E = (key: number, value: string): DictEntry => ({ key: String(key), value: `'${value}'` })
const S = (...pairs: [number, number][]) => {
  const slots: (number | null)[] = Array(8).fill(null)
  for (const [slot, entry] of pairs) slots[slot] = entry
  return slots
}

export const DICT_FRAMES: DictFrame[] = [
  { code: "stock = {}", slots: S(), entries: [], probe: [] },
  { code: "stock[10] = 'pen'", slots: S([2, 0]), entries: [E(10, "pen")], probe: [2], hit: 0 },
  {
    code: "stock[18] = 'ink'",
    slots: S([2, 0], [3, 1]),
    entries: [E(10, "pen"), E(18, "ink")],
    probe: [2, 3],
    hit: 1,
  },
  {
    code: "stock[3] = 'cap'",
    slots: S([2, 0], [3, 1], [0, 2]),
    entries: [E(10, "pen"), E(18, "ink"), E(3, "cap")],
    probe: [3, 0],
    hit: 2,
  },
  {
    code: "stock[26] = 'pad'",
    slots: S([2, 0], [3, 1], [0, 2], [1, 3]),
    entries: [E(10, "pen"), E(18, "ink"), E(3, "cap"), E(26, "pad")],
    probe: [2, 3, 0, 1],
    hit: 3,
  },
  {
    code: "stock[26]  # lookup",
    slots: S([2, 0], [3, 1], [0, 2], [1, 3]),
    entries: [E(10, "pen"), E(18, "ink"), E(3, "cap"), E(26, "pad")],
    probe: [2, 3, 0, 1],
    hit: 3,
  },
  {
    code: "list(stock)  # → [10, 18, 3, 26]",
    slots: S([2, 0], [3, 1], [0, 2], [1, 3]),
    entries: [E(10, "pen"), E(18, "ink"), E(3, "cap"), E(26, "pad")],
    probe: [],
  },
]

export const DICT_STEPS: VizStep[] = [
  {
    label: "Empty dict",
    narration:
      "A new dict has an index table of 8 slots (all empty) and an empty entries array that will keep items in insertion order.",
  },
  {
    label: "Insert 10",
    narration:
      "hash(10) is 10. 10 & 7 = 2, so slot 2 stores entry number 0, and the pair (10, 'pen') is appended to the entries array.",
  },
  {
    label: "Collision",
    narration:
      "18 & 7 is also 2, but slot 2 is taken: a collision. CPython probes the next slot by its formula and lands on slot 3.",
  },
  {
    label: "Probe again",
    narration: "3 & 7 = 3 is taken by 18, so the probe moves on to slot 0, which is free.",
  },
  {
    label: "Longer probe",
    narration:
      "26 & 7 = 2: slots 2, 3 and 0 are all taken, so it probes four times and lands in slot 1. Collisions cost extra steps.",
  },
  {
    label: "Lookup",
    narration:
      "stock[26] repeats the same probe path, comparing keys at each occupied slot (10, 18, 3) until it finds 26 and returns 'pad'.",
  },
  {
    label: "Order",
    narration:
      "Iteration walks the ENTRIES array, not the slots, so a dict lists keys in insertion order: 10, 18, 3, 26.",
  },
]

export const DICT_CAPTION =
  "A dict turns a key into a slot number with hash(). Most lookups touch one slot, which makes them O(1) on average; collisions add a few probes. Keys must be hashable so their slot never changes."
