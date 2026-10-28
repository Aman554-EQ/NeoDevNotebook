import type { VizStep } from "../../_shared/viz-frame"

/**
 * Names → objects → references. One model drives the 3D scene and its SVG fallback.
 * Coordinates are world units: x ∈ [-4, 4], y ∈ [-1.6, 1.6] for objects; name tags sit on a row above.
 */

/** A container slot: either an inline small value or a reference to another object. */
export type MemCell = { text?: string; ref?: string }
export type MemObject = {
  id: string
  /** Type label shown above the object, e.g. "int", "list", "Dog". */
  type: string
  /** Scalar value (int, str, None…). */
  value?: string
  /** Container slots (list, tuple, instance attributes). */
  cells?: MemCell[]
  /** Optional slot captions, e.g. attribute names for an instance. */
  cellLabels?: string[]
  x: number
  y: number
  /** For instances: the id of their class object (drawn as a dashed "class" link). */
  classOf?: string
}
export type MemName = { name: string; target: string; x: number }
export type MemFrame = { code: string; names: MemName[]; objects: MemObject[] }
export type MemScenario = { title: string; caption: string; frames: MemFrame[]; steps: VizStep[] }

const objectsScenario: MemScenario = {
  title: "Every value is an object; names point at objects",
  caption:
    "Assignment never copies; it points a name at an object. age = age + 1 builds a NEW int object and moves only the age label, while same still points at 30.",
  frames: [
    {
      code: "age = 30",
      names: [{ name: "age", target: "i30", x: -2.6 }],
      objects: [{ id: "i30", type: "int", value: "30", x: -2.6, y: 0 }],
    },
    {
      code: 'name = "Ada"',
      names: [
        { name: "age", target: "i30", x: -2.6 },
        { name: "name", target: "sAda", x: 0.4 },
      ],
      objects: [
        { id: "i30", type: "int", value: "30", x: -2.6, y: 0 },
        { id: "sAda", type: "str", value: "'Ada'", x: 0.4, y: 0 },
      ],
    },
    {
      code: "same = age",
      names: [
        { name: "age", target: "i30", x: -3.3 },
        { name: "same", target: "i30", x: -1.9 },
        { name: "name", target: "sAda", x: 0.4 },
      ],
      objects: [
        { id: "i30", type: "int", value: "30", x: -2.6, y: 0 },
        { id: "sAda", type: "str", value: "'Ada'", x: 0.4, y: 0 },
      ],
    },
    {
      code: "age = age + 1",
      names: [
        { name: "same", target: "i30", x: -2.6 },
        { name: "name", target: "sAda", x: 0.4 },
        { name: "age", target: "i31", x: 3.0 },
      ],
      objects: [
        { id: "i30", type: "int", value: "30", x: -2.6, y: 0 },
        { id: "sAda", type: "str", value: "'Ada'", x: 0.4, y: 0 },
        { id: "i31", type: "int", value: "31", x: 3.0, y: 0 },
      ],
    },
    {
      code: "nothing = None",
      names: [
        { name: "same", target: "i30", x: -3.2 },
        { name: "name", target: "sAda", x: 0.6 },
        { name: "age", target: "i31", x: 3.2 },
        // Between the int and the str, so its arrow drops to None through the gap.
        { name: "nothing", target: "none", x: -1.3 },
      ],
      objects: [
        { id: "i30", type: "int", value: "30", x: -3.2, y: 0.6 },
        { id: "sAda", type: "str", value: "'Ada'", x: 0.6, y: 0.6 },
        { id: "i31", type: "int", value: "31", x: 3.2, y: 0.6 },
        { id: "none", type: "NoneType", value: "None", x: -1.3, y: -1.2 },
      ],
    },
  ],
  steps: [
    {
      label: "Create",
      narration: "Python creates an int object holding 30 and points the name age at it.",
    },
    {
      label: "Another type",
      narration: "A str object 'Ada' is created. Each object carries its own type: int, str.",
    },
    {
      label: "Share",
      narration: "same = age copies nothing: both names now point at the same int object.",
    },
    {
      label: "Rebind",
      narration:
        "age + 1 builds a new int object 31 and moves only the age name to it. same still points at 30.",
    },
    {
      label: "None",
      narration: "None is an object too: the single instance of NoneType, used for 'no value'.",
    },
  ],
}

const copiesScenario: MemScenario = {
  title: "Alias, shallow copy, deep copy",
  caption:
    "A shallow copy makes a new outer list but SHARES the inner objects. Mutating the shared inner list shows up through both. Only deepcopy builds new inner objects too.",
  frames: [
    {
      code: "a = [1, [2, 3]]",
      names: [{ name: "a", target: "A", x: -2.6 }],
      objects: [
        { id: "A", type: "list", cells: [{ text: "1" }, { ref: "I" }], x: -2.6, y: 0.6 },
        { id: "I", type: "list", cells: [{ text: "2" }, { text: "3" }], x: 0, y: -1.2 },
      ],
    },
    {
      code: "b = a",
      names: [
        { name: "a", target: "A", x: -3.2 },
        { name: "b", target: "A", x: -2.0 },
      ],
      objects: [
        { id: "A", type: "list", cells: [{ text: "1" }, { ref: "I" }], x: -2.6, y: 0.6 },
        { id: "I", type: "list", cells: [{ text: "2" }, { text: "3" }], x: 0, y: -1.2 },
      ],
    },
    {
      code: "c = a.copy()",
      names: [
        { name: "a", target: "A", x: -3.2 },
        { name: "b", target: "A", x: -2.0 },
        { name: "c", target: "C", x: 2.6 },
      ],
      objects: [
        { id: "A", type: "list", cells: [{ text: "1" }, { ref: "I" }], x: -2.6, y: 0.6 },
        { id: "C", type: "list", cells: [{ text: "1" }, { ref: "I" }], x: 2.6, y: 0.6 },
        { id: "I", type: "list", cells: [{ text: "2" }, { text: "3" }], x: 0, y: -1.2 },
      ],
    },
    {
      code: "c[1].append(4)",
      names: [
        { name: "a", target: "A", x: -3.2 },
        { name: "b", target: "A", x: -2.0 },
        { name: "c", target: "C", x: 2.6 },
      ],
      objects: [
        { id: "A", type: "list", cells: [{ text: "1" }, { ref: "I" }], x: -2.6, y: 0.6 },
        { id: "C", type: "list", cells: [{ text: "1" }, { ref: "I" }], x: 2.6, y: 0.6 },
        {
          id: "I",
          type: "list",
          cells: [{ text: "2" }, { text: "3" }, { text: "4" }],
          x: 0,
          y: -1.2,
        },
      ],
    },
    {
      code: "d = copy.deepcopy(a)",
      names: [
        { name: "a", target: "A", x: -3.5 },
        { name: "b", target: "A", x: -2.3 },
        { name: "c", target: "C", x: 0.6 },
        { name: "d", target: "D", x: 3.2 },
      ],
      objects: [
        { id: "A", type: "list", cells: [{ text: "1" }, { ref: "I" }], x: -2.9, y: 0.6 },
        { id: "C", type: "list", cells: [{ text: "1" }, { ref: "I" }], x: 0.1, y: 0.6 },
        { id: "D", type: "list", cells: [{ text: "1" }, { ref: "I2" }], x: 3.1, y: 0.6 },
        {
          id: "I",
          type: "list",
          cells: [{ text: "2" }, { text: "3" }, { text: "4" }],
          x: -1.4,
          y: -1.2,
        },
        {
          id: "I2",
          type: "list",
          cells: [{ text: "2" }, { text: "3" }, { text: "4" }],
          x: 2.6,
          y: -1.2,
        },
      ],
    },
  ],
  steps: [
    {
      label: "Nested list",
      narration:
        "a points at an outer list. Its second slot holds a reference to a separate inner list [2, 3].",
    },
    {
      label: "Alias",
      narration: "b = a creates no new list: a and b are two names for the same outer list.",
    },
    {
      label: "Shallow copy",
      narration:
        "a.copy() builds a NEW outer list c, but its slots copy the references, so c[1] is the SAME inner list as a[1].",
    },
    {
      label: "Shared mutation",
      narration:
        "c[1].append(4) changes the shared inner list, so a[1] and b[1] show [2, 3, 4] as well.",
    },
    {
      label: "Deep copy",
      narration:
        "copy.deepcopy(a) copies recursively: d gets its own outer list AND its own inner list. Nothing is shared.",
    },
  ],
}

const instancesScenario: MemScenario = {
  title: "Instances, their attributes and their class",
  caption:
    "Each instance stores its own attributes. Methods and class attributes live once, on the class; Python finds them by looking in the instance first, then the class.",
  frames: [
    {
      code: "class Dog: sound = 'woof'",
      names: [{ name: "Dog", target: "cls", x: 0 }],
      objects: [
        {
          id: "cls",
          type: "class Dog",
          cells: [{ text: "'woof'" }, { text: "fn" }],
          cellLabels: ["sound", "speak"],
          x: 0,
          y: -1.0,
        },
      ],
    },
    {
      code: 'rex = Dog("Rex")',
      names: [
        { name: "Dog", target: "cls", x: 1.6 },
        { name: "rex", target: "r", x: -3.0 },
      ],
      objects: [
        {
          id: "cls",
          type: "class Dog",
          cells: [{ text: "'woof'" }, { text: "fn" }],
          cellLabels: ["sound", "speak"],
          x: 1.6,
          y: -1.0,
        },
        {
          id: "r",
          type: "Dog",
          classOf: "cls",
          cells: [{ text: "'Rex'" }],
          cellLabels: ["name"],
          x: -3.0,
          y: 0.8,
        },
      ],
    },
    {
      code: 'fido = Dog("Fido")',
      names: [
        { name: "rex", target: "r", x: -3.0 },
        { name: "fido", target: "f", x: 0.2 },
        { name: "Dog", target: "cls", x: 2.8 },
      ],
      objects: [
        {
          id: "r",
          type: "Dog",
          classOf: "cls",
          cells: [{ text: "'Rex'" }],
          cellLabels: ["name"],
          x: -3.0,
          y: 0.8,
        },
        {
          id: "f",
          type: "Dog",
          classOf: "cls",
          cells: [{ text: "'Fido'" }],
          cellLabels: ["name"],
          x: 0.2,
          y: 0.8,
        },
        {
          id: "cls",
          type: "class Dog",
          cells: [{ text: "'woof'" }, { text: "fn" }],
          cellLabels: ["sound", "speak"],
          x: 1.6,
          y: -1.0,
        },
      ],
    },
    {
      code: "fido.sound = 'yap'",
      names: [
        { name: "rex", target: "r", x: -3.0 },
        { name: "fido", target: "f", x: 0.2 },
        { name: "Dog", target: "cls", x: 2.8 },
      ],
      objects: [
        {
          id: "r",
          type: "Dog",
          classOf: "cls",
          cells: [{ text: "'Rex'" }],
          cellLabels: ["name"],
          x: -3.0,
          y: 0.8,
        },
        {
          id: "f",
          type: "Dog",
          classOf: "cls",
          cells: [{ text: "'Fido'" }, { text: "'yap'" }],
          cellLabels: ["name", "sound"],
          x: 0.2,
          y: 0.8,
        },
        {
          id: "cls",
          type: "class Dog",
          cells: [{ text: "'woof'" }, { text: "fn" }],
          cellLabels: ["sound", "speak"],
          x: 1.6,
          y: -1.0,
        },
      ],
    },
  ],
  steps: [
    {
      label: "Class",
      narration:
        "class Dog creates a class object holding the class attribute sound and the method speak.",
    },
    {
      label: "Instance",
      narration:
        "Dog('Rex') creates an instance; __init__ stores name on the instance itself, not on the class.",
    },
    {
      label: "Second instance",
      narration:
        "fido gets its own name attribute. Both instances share the one class: rex.sound and fido.sound are found on Dog.",
    },
    {
      label: "Shadowing",
      narration:
        "fido.sound = 'yap' adds an attribute on the instance, which now hides Dog.sound for fido only. rex still says 'woof'.",
    },
  ],
}

export const MEMORY_SCENARIOS = {
  objects: objectsScenario,
  copies: copiesScenario,
  instances: instancesScenario,
} satisfies Record<string, MemScenario>

export type MemoryScenarioName = keyof typeof MEMORY_SCENARIOS

/** Width of one slot: wide enough for the longest text it holds (shared by 3D and SVG). */
export const CELL_W = 0.78
export const cellWidth = (o: MemObject) =>
  Math.max(CELL_W, ...(o.cells ?? []).map((c) => (c.text ?? "").length * 0.17 + 0.25))
export const objectWidth = (o: MemObject) =>
  o.cells
    ? Math.max(1.3, o.cells.length * cellWidth(o) + 0.3)
    : Math.max(1.3, o.value!.length * 0.22 + 0.5)
