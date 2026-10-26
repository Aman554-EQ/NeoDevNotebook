"use client"

import { VizFrame, useViz, type VizStep } from "../../_shared/viz-frame"

/** Counter(['red', 'blue', 'red', 'green', 'blue', 'red']) → red 3, blue 2, green 1 (as Python printed). */
const WORDS = ["red", "blue", "red", "green", "blue", "red"]
const KEYS = ["red", "blue", "green"]
const STEPS: VizStep[] = [
  ...WORDS.map((w, i) => ({
    label: `+ ${w}`,
    narration: `Counter sees '${w}' (item ${i + 1}) and adds 1 to its count. Missing keys start at 0, so no KeyError.`,
  })),
  {
    label: "most_common(2)",
    narration: "most_common(2) returns the two highest counts: [('red', 3), ('blue', 2)].",
  },
]

function Scene() {
  const { step } = useViz()
  const seen = WORDS.slice(0, Math.min(step + 1, WORDS.length))
  const counts = Object.fromEntries(KEYS.map((k) => [k, seen.filter((w) => w === k).length]))
  const top = step === WORDS.length
  const max = 3
  return (
    <div className="space-y-3 p-4">
      <p className="text-center font-mono text-sm">
        {WORDS.map((w, i) => (
          <span
            key={i}
            className={i === step ? "bg-highlight rounded px-1" : i < step ? "" : "text-muted"}
          >
            {`'${w}'`}
            {i < WORDS.length - 1 ? ", " : ""}
          </span>
        ))}
      </p>
      <ul className="mx-auto max-w-sm space-y-2" aria-label="counts">
        {KEYS.map((k) => (
          <li
            key={k}
            className="grid grid-cols-[3.5rem_1fr_1.5rem] items-center gap-2 font-mono text-sm"
          >
            <span>{k}</span>
            <span className="bg-surface-2 h-4 rounded-sm">
              <span
                className="block h-4 rounded-r transition-[width] duration-300"
                style={{ width: `${(counts[k]! / max) * 100}%`, background: "var(--series-1)" }}
              />
            </span>
            <span className="text-right">{counts[k]}</span>
          </li>
        ))}
      </ul>
      {top && (
        <p className="text-center font-mono text-sm" data-testid="counter-top">
          c.most_common(2) =={" "}
          <span className="bg-highlight rounded px-1">{"[('red', 3), ('blue', 2)]"}</span>
        </p>
      )}
    </div>
  )
}

export function CounterViz() {
  return (
    <VizFrame
      title="Counting with collections.Counter"
      caption="Counter is a dict of counts that starts every key at 0. It replaces the 'if key not in d: d[key] = 0' pattern and adds tools like most_common."
      steps={STEPS}
      intervalMs={1600}
    >
      <Scene />
    </VizFrame>
  )
}
