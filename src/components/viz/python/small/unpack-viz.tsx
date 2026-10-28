"use client"

import { VizFrame, useViz, type VizStep } from "../../_shared/viz-frame"

type Binding = { name: string; value: string; star?: boolean }
type Frame = { code: string; source: string[]; bindings: Binding[]; note?: string }

const FRAMES: Frame[] = [
  {
    code: "point = 3, 4",
    source: ["3", "4"],
    bindings: [{ name: "point", value: "(3, 4)" }],
    note: "packing: the commas build a tuple",
  },
  {
    code: "x, y = point",
    source: ["3", "4"],
    bindings: [
      { name: "x", value: "3" },
      { name: "y", value: "4" },
    ],
  },
  {
    code: "first, *rest = [1, 2, 3, 4]",
    source: ["1", "2", "3", "4"],
    bindings: [
      { name: "first", value: "1" },
      { name: "rest", value: "[2, 3, 4]", star: true },
    ],
  },
  {
    code: "a, b = b, a   # a=1, b=2 before",
    source: ["2", "1"],
    bindings: [
      { name: "a", value: "2" },
      { name: "b", value: "1" },
    ],
    note: "the right side (b, a) is built FIRST, then unpacked",
  },
  {
    code: "x, y = 'abc'",
    source: ["'a'", "'b'", "'c'"],
    bindings: [],
    note: "ValueError: too many values to unpack (expected 2)",
  },
]

const STEPS: VizStep[] = [
  {
    label: "Pack",
    narration: "Writing values separated by commas packs them into one tuple: point is (3, 4).",
  },
  {
    label: "Unpack",
    narration: "x, y = point unpacks the tuple: the first item goes to x, the second to y.",
  },
  {
    label: "Star",
    narration:
      "A starred name collects everything left over into a list: first = 1, rest = [2, 3, 4].",
  },
  {
    label: "Swap",
    narration:
      "a, b = b, a builds the tuple (2, 1) first, then unpacks it, so the swap needs no temporary variable.",
  },
  {
    label: "Mismatch",
    narration:
      "Three values can't fill two names, so Python raises ValueError: too many values to unpack.",
  },
]

function Scene() {
  const { step } = useViz()
  const f = FRAMES[step]!
  const error = f.bindings.length === 0
  return (
    <div className="space-y-4 p-4">
      <p className="text-center">
        <code className="bg-surface-2 rounded-md px-3 py-1 font-mono text-sm">{f.code}</code>
      </p>
      <ol
        className="flex flex-wrap justify-center gap-1.5"
        aria-label="values on the right-hand side"
      >
        {f.source.map((v, i) => (
          <li
            key={i}
            className="border-accent bg-accent-soft grid h-10 min-w-10 place-items-center rounded-md border-2 px-2 font-mono text-sm font-bold"
          >
            {v}
          </li>
        ))}
      </ol>
      <p aria-hidden className="text-muted text-center">
        ↓
      </p>
      {error ? (
        <p className="text-hard text-center font-mono text-sm">{f.note}</p>
      ) : (
        <dl className="flex flex-wrap justify-center gap-3">
          {f.bindings.map((b) => (
            <div
              key={b.name}
              className="border-rule bg-surface rounded-lg border px-3 py-2 text-center"
            >
              <dt className="font-mono text-sm font-bold">
                {b.star ? "*" : ""}
                {b.name}
              </dt>
              <dd className="font-mono text-sm">{b.value}</dd>
            </div>
          ))}
        </dl>
      )}
      {!error && f.note && <p className="text-muted text-center text-sm">{f.note}</p>}
    </div>
  )
}

export function UnpackViz() {
  return (
    <VizFrame
      title="Packing and unpacking"
      caption="Commas pack values into a tuple; names on the left unpack it position by position. A starred name soaks up the rest. The counts must match, or Python raises ValueError."
      steps={STEPS}
      intervalMs={2600}
    >
      <Scene />
    </VizFrame>
  )
}
