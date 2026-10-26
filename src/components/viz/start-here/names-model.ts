import type { VizStep } from "../_shared/viz-frame"

/** One model drives both the 3D scene and its static SVG fallback. */

export type ObjectBox = { id: string; items: number[]; x: number }
export type NameTag = { name: string; target: string }
export type NamesFrame = { code: string; objects: ObjectBox[]; names: NameTag[] }

export const NAMES_FRAMES: NamesFrame[] = [
  {
    code: "a = [1, 2]",
    objects: [{ id: "obj1", items: [1, 2], x: -1.6 }],
    names: [{ name: "a", target: "obj1" }],
  },
  {
    code: "b = a",
    objects: [{ id: "obj1", items: [1, 2], x: -1.6 }],
    names: [
      { name: "a", target: "obj1" },
      { name: "b", target: "obj1" },
    ],
  },
  {
    code: "b.append(3)",
    objects: [{ id: "obj1", items: [1, 2, 3], x: -1.6 }],
    names: [
      { name: "a", target: "obj1" },
      { name: "b", target: "obj1" },
    ],
  },
  {
    code: "b = [9]",
    objects: [
      { id: "obj1", items: [1, 2, 3], x: -1.6 },
      { id: "obj2", items: [9], x: 2.2 },
    ],
    names: [
      { name: "a", target: "obj1" },
      { name: "b", target: "obj2" },
    ],
  },
]

export const NAMES_STEPS: VizStep[] = [
  {
    label: "Create",
    narration: "Python builds a list object [1, 2] in memory and ties the name a to it.",
  },
  {
    label: "Alias",
    narration: "b = a copies nothing. It ties a second name to the SAME object.",
  },
  {
    label: "Mutate",
    narration: "b.append(3) changes the shared object, so a sees [1, 2, 3] too.",
  },
  {
    label: "Rebind",
    narration: "b = [9] makes a new object and moves only the b label. a is unaffected.",
  },
]

export const NAMES_CAPTION =
  "Variables are labels, not boxes. Mutating through one label is visible through every label on the same object; assigning a label to something new never changes the old object."
