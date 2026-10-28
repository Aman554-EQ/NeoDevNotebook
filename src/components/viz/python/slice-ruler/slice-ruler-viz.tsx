"use client"

import { useId, useState } from "react"
import { VizFrame, useViz, type VizStep } from "../../_shared/viz-frame"
import { cn } from "@/lib/utils"
import { pySlice, sliceIndices } from "./py-slice"

const WORD = "PYTHONIC"

type Example = { expr: string; start: number | null; stop: number | null; step: number | null }
const EXAMPLES: Example[] = [
  { expr: "s[0]", start: 0, stop: 1, step: null },
  { expr: "s[-1]", start: -1, stop: null, step: null },
  { expr: "s[1:4]", start: 1, stop: 4, step: null },
  { expr: "s[:3]", start: null, stop: 3, step: null },
  { expr: "s[-3:]", start: -3, stop: null, step: null },
  { expr: "s[::2]", start: null, stop: null, step: 2 },
  { expr: "s[::-1]", start: null, stop: null, step: -1 },
  { expr: "s[5:1:-1]", start: 5, stop: 1, step: -1 },
]

const STEPS: VizStep[] = [
  {
    label: "s[0]",
    narration: "Index 0 is the first character, 'P'. Indexing returns one character.",
  },
  {
    label: "s[-1]",
    narration: "Negative indexes count from the end: -1 is the last character, 'C'.",
  },
  {
    label: "s[1:4]",
    narration: "A slice start:stop includes start and EXCLUDES stop: indexes 1, 2, 3 give 'YTH'.",
  },
  {
    label: "s[:3]",
    narration: "Omit start and the slice begins at 0: 'PYT'. Its length is exactly 3.",
  },
  {
    label: "s[-3:]",
    narration: "Omit stop and the slice runs to the end. s[-3:] is the last three: 'NIC'.",
  },
  {
    label: "s[::2]",
    narration: "A step of 2 takes every second character: indexes 0, 2, 4, 6 give 'PTOI'.",
  },
  {
    label: "s[::-1]",
    narration: "A step of -1 walks backwards from the end: the reversed string 'CINOHTYP'.",
  },
  {
    label: "s[5:1:-1]",
    narration:
      "With a negative step, start is on the right and stop on the left, still excluded: 'NOHT'.",
  },
]

function Ruler({ picked, order }: { picked: Set<number>; order: number[] }) {
  return (
    <div className="overflow-x-auto pb-1">
      <table className="mx-auto border-separate border-spacing-1 font-mono text-sm">
        <tbody>
          <tr className="text-muted text-xs">
            {[...WORD].map((_, i) => (
              <td key={i} className="text-center">
                {i}
              </td>
            ))}
          </tr>
          <tr>
            {[...WORD].map((ch, i) => (
              <td
                key={i}
                className={cn(
                  "relative size-10 rounded-md border-2 text-center text-base font-bold transition-colors duration-300",
                  picked.has(i)
                    ? "border-accent bg-accent text-accent-ink"
                    : "border-rule bg-surface",
                )}
              >
                {ch}
                {picked.has(i) && order.length > 1 && (
                  <span className="bg-ink text-bg absolute -top-2 -right-2 grid size-4 place-items-center rounded-full text-[0.6rem]">
                    {order.indexOf(i) + 1}
                  </span>
                )}
              </td>
            ))}
          </tr>
          <tr className="text-muted text-xs">
            {[...WORD].map((_, i) => (
              <td key={i} className="text-center">
                {i - WORD.length}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  )
}

function Scene() {
  const { step } = useViz()
  const ex = EXAMPLES[step]!
  const order = sliceIndices(WORD.length, ex.start, ex.stop, ex.step)
  const isIndex = !ex.expr.includes(":")
  const result = pySlice(WORD, ex.start, ex.stop, ex.step)
  return (
    <div className="space-y-4 p-4">
      <p className="text-center font-mono text-sm">
        s = &quot;{WORD}&quot; → <span className="bg-surface-2 rounded px-2 py-0.5">{ex.expr}</span>{" "}
        =={" "}
        <span className="bg-highlight rounded px-2 py-0.5" data-testid="slice-result">
          {`'${result}'`}
        </span>
        {isIndex && <span className="text-muted"> (one character)</span>}
      </p>
      <Ruler picked={new Set(order)} order={order} />
      <TryIt />
    </div>
  )
}

/** Free-form playground: same Python rules, learner-chosen numbers. */
function TryIt() {
  const id = useId()
  const [vals, setVals] = useState<[string, string, string]>(["1", "", ""])
  const parse = (v: string) => (v.trim() === "" || v.trim() === "-" ? null : Number.parseInt(v, 10))
  const [a, b, c] = vals.map(parse) as [number | null, number | null, number | null]
  const bad = [a, b, c].some((v) => v !== null && Number.isNaN(v))
  const zero = c === 0
  const order = bad || zero ? [] : sliceIndices(WORD.length, a, b, c)
  const set = (i: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = [...vals] as [string, string, string]
    next[i] = e.target.value
    setVals(next)
  }
  const shown = (v: string) => v.trim()
  return (
    <div className="border-rule bg-surface rounded-lg border p-3">
      <p className="text-sm font-semibold">Try your own slice</p>
      <div className="mt-2 flex flex-wrap items-center gap-1 font-mono text-sm">
        s[
        {(["start", "stop", "step"] as const).map((name, i) => (
          <span key={name} className="flex items-center gap-1">
            <label htmlFor={`${id}-${name}`} className="sr-only">
              {name}
            </label>
            <input
              id={`${id}-${name}`}
              data-testid={`slice-${name}`}
              value={vals[i]}
              onChange={set(i)}
              inputMode="numeric"
              placeholder={name}
              className="border-rule bg-bg focus:border-accent w-16 rounded border px-1.5 py-1 text-center"
            />
            {i < 2 && ":"}
          </span>
        ))}
        ]
      </div>
      <p className="mt-2 font-mono text-sm" aria-live="polite" data-testid="slice-try-result">
        {bad
          ? "Use whole numbers or leave a box empty."
          : zero
            ? "ValueError: slice step cannot be zero"
            : `s[${shown(vals[0])}:${shown(vals[1])}${vals[2].trim() ? `:${shown(vals[2])}` : ""}] == '${order.map((i) => WORD[i]).join("")}'`}
      </p>
      {!bad && !zero && <Ruler picked={new Set(order)} order={order} />}
    </div>
  )
}

export function SliceRulerViz() {
  return (
    <VizFrame
      title="Indexing and slicing a string"
      caption="A slice includes its start and excludes its stop. Negative numbers count from the end, and a negative step walks backwards. Slices never raise IndexError; out-of-range bounds are clipped."
      steps={STEPS}
      intervalMs={2600}
    >
      <Scene />
    </VizFrame>
  )
}
