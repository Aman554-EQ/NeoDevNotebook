"use client"

import { VizFrame, useViz, type VizStep } from "../../_shared/viz-frame"
import { cn } from "@/lib/utils"

/** A real CPython 3.13 traceback for lesson 33's orders.py (only the folder path is shortened). */
type Part = "header" | "f1" | "f2" | "f3" | "error"
const LINES: { text: string; part: Part }[] = [
  { text: "Traceback (most recent call last):", part: "header" },
  { text: '  File "orders.py", line 10, in <module>', part: "f1" },
  { text: '    print(report({"ada": [10, 20], "bo": []}))', part: "f1" },
  { text: "          ~~~~~~^^^^^^^^^^^^^^^^^^^^^^^^^^^^^", part: "f1" },
  { text: '  File "orders.py", line 6, in report', part: "f2" },
  { text: "    totals = {name: average(prices) for name, prices in orders.items()}", part: "f2" },
  { text: "                    ~~~~~~~^^^^^^^^", part: "f2" },
  { text: '  File "orders.py", line 2, in average', part: "f3" },
  { text: "    return sum(prices) / len(prices)", part: "f3" },
  { text: "           ~~~~~~~~~~~~^~~~~~~~~~~~~", part: "f3" },
  { text: "ZeroDivisionError: division by zero", part: "error" },
]

const FOCUS: Part[][] = [["error"], ["f3"], ["f2", "f1"], ["header"], ["f2", "f3"]]
const STEPS: VizStep[] = [
  {
    label: "1. Last line",
    narration:
      "Start at the bottom: the exception type and message. ZeroDivisionError: something was divided by zero.",
  },
  {
    label: "2. Where",
    narration:
      "The frame just above it is where the error happened: orders.py, line 2, in average. The ^ markers point at the exact operation: the division.",
  },
  {
    label: "3. How we got there",
    narration:
      "Read upwards for the route: average was called by report (line 6), which was called from the module (line 10).",
  },
  {
    label: "4. Order",
    narration:
      "'Most recent call last' means the oldest call is at the top and the failing call is at the bottom, next to the error.",
  },
  {
    label: "5. Diagnose",
    narration:
      "Combine them: report passed one customer's prices to average, and 'bo' has an empty list, so len(prices) was 0. Fix the data or handle empty lists.",
  },
]

function Scene() {
  const { step } = useViz()
  const focus = FOCUS[step]!
  return (
    <div className="p-4">
      <pre
        className="border-rule bg-code-bg overflow-x-auto rounded-lg border p-3 font-mono text-[0.78rem] leading-relaxed"
        tabIndex={0}
        aria-label="Traceback"
      >
        {LINES.map((l, i) => (
          <div
            key={i}
            className={cn(
              "rounded px-1 transition-colors duration-300",
              focus.includes(l.part) &&
                (l.part === "error" ? "bg-hard-soft text-hard font-bold" : "bg-highlight"),
            )}
          >
            {l.text}
          </div>
        ))}
      </pre>
      <p className="text-muted mt-2 text-xs">
        Real output of CPython 3.13; only the folder path was shortened to orders.py.
      </p>
    </div>
  )
}

export function TracebackViz() {
  return (
    <VizFrame
      title="How to read a traceback"
      caption="Read bottom-up: the last line says WHAT went wrong, the frame above says WHERE, and the frames above that say HOW the program got there."
      steps={STEPS}
      intervalMs={3000}
    >
      <Scene />
    </VizFrame>
  )
}
