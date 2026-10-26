"use client"

import { VizFrame, useViz, type VizStep } from "../../_shared/viz-frame"
import { cn } from "@/lib/utils"

/** [x * x for x in nums if x % 2 == 0] with nums = [1, 2, 3, 4, 5, 6] → [4, 16, 36]. */
const NUMS = [1, 2, 3, 4, 5, 6]
const STEPS: VizStep[] = [
  ...NUMS.map((n) => ({
    label: `x = ${n}`,
    narration:
      n % 2 === 0
        ? `x = ${n} passes the filter (${n} % 2 == 0), so the expression x * x adds ${n * n} to the result.`
        : `x = ${n} fails the filter (${n} % 2 is 1), so it is skipped. The expression never runs for it.`,
  })),
  {
    label: "Generator",
    narration:
      "With parentheses instead of brackets, nothing runs up front: a generator produces 4, then 16, then 36 only when asked (next or a for loop).",
  },
]

function Scene() {
  const { step } = useViz()
  const lazy = step === NUMS.length
  const upto = lazy ? -1 : step
  const result = NUMS.slice(0, upto + 1)
    .filter((n) => n % 2 === 0)
    .map((n) => n * n)
  return (
    <div className="space-y-4 p-4">
      <p className="text-center">
        <code className="bg-surface-2 rounded-md px-3 py-1 font-mono text-sm">
          {lazy ? "(x * x for x in nums if x % 2 == 0)" : "[x * x for x in nums if x % 2 == 0]"}
        </code>
      </p>
      <div className="grid grid-cols-[auto_1fr] items-center gap-x-3 gap-y-2 text-sm">
        <span className="text-muted text-xs font-semibold uppercase">for x in nums</span>
        <ol className="flex flex-wrap gap-1.5">
          {NUMS.map((n, i) => (
            <li
              key={n}
              className={cn(
                "grid size-9 place-items-center rounded-md border-2 font-mono font-bold",
                i === upto
                  ? "border-medium bg-medium-soft"
                  : i < upto
                    ? "border-rule text-muted"
                    : "border-rule bg-surface",
              )}
            >
              {n}
            </li>
          ))}
        </ol>
        <span className="text-muted text-xs font-semibold uppercase">if x % 2 == 0</span>
        <p className="font-mono">
          {upto >= 0 ? (
            NUMS[upto]! % 2 === 0 ? (
              <span className="text-easy">✓ {NUMS[upto]} kept</span>
            ) : (
              <span className="text-hard">✗ {NUMS[upto]} skipped</span>
            )
          ) : (
            <span className="text-muted">nothing evaluated yet</span>
          )}
        </p>
        <span className="text-muted text-xs font-semibold uppercase">result</span>
        <p className="font-mono" data-testid="comp-result">
          {lazy ? (
            <span>generator object (values on demand: 4, 16, 36)</span>
          ) : (
            `[${result.join(", ")}]`
          )}
        </p>
      </div>
    </div>
  )
}

export function CompPipelineViz() {
  return (
    <VizFrame
      title="A comprehension is a loop, a filter and an expression"
      caption="Read a comprehension right to left: loop over the source, keep items that pass the if, then compute the expression for each. Square brackets build the whole list now; parentheses make a lazy generator."
      steps={STEPS}
      intervalMs={1800}
    >
      <Scene />
    </VizFrame>
  )
}
