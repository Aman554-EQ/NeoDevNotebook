"use client"

import { VizFrame, useViz, type VizStep } from "../../_shared/viz-frame"
import { cn } from "@/lib/utils"

/**
 * An exception travels up the call stack until a matching except catches it; finally blocks
 * run on the way. Output lines match the lesson's worked example (verified by pnpm verify:code).
 */
const CODE = [
  "def parse(text):",
  "    return int(text)",
  "",
  "def load(path):",
  "    try:",
  "        return parse('x')",
  "    finally:",
  "        print('closing', path)",
  "",
  "def main():",
  "    try:",
  "        load('ages.txt')",
  "    except ValueError as err:",
  "        print('bad data:', err)",
]

type F = { name: string; state: "active" | "raising" | "unwound" | "handling" }
type Frame = { line: number; frames: F[]; output: string[]; error?: string }
const ERR = "ValueError: invalid literal for int() with base 10: 'x'"
const FRAMES: Frame[] = [
  {
    line: 2,
    frames: [
      { name: "main()", state: "active" },
      { name: "load('ages.txt')", state: "active" },
      { name: "parse('x')", state: "active" },
    ],
    output: [],
  },
  {
    line: 2,
    frames: [
      { name: "main()", state: "active" },
      { name: "load('ages.txt')", state: "active" },
      { name: "parse('x')", state: "raising" },
    ],
    output: [],
    error: ERR,
  },
  {
    line: 8,
    frames: [
      { name: "main()", state: "active" },
      { name: "load('ages.txt')", state: "raising" },
      { name: "parse('x')", state: "unwound" },
    ],
    output: ["closing ages.txt"],
    error: ERR,
  },
  {
    line: 14,
    frames: [
      { name: "main()", state: "handling" },
      { name: "load('ages.txt')", state: "unwound" },
      { name: "parse('x')", state: "unwound" },
    ],
    output: ["closing ages.txt", "bad data: invalid literal for int() with base 10: 'x'"],
  },
]

const STEPS: VizStep[] = [
  {
    label: "Call chain",
    narration: "main calls load, which calls parse('x'). Three frames are on the stack.",
  },
  {
    label: "Raise",
    narration:
      "int('x') raises ValueError inside parse. parse has no try, so its frame is abandoned.",
  },
  {
    label: "finally",
    narration:
      "The exception reaches load. load has no except for it, but its finally block still runs and prints 'closing ages.txt', then the exception keeps going up.",
  },
  {
    label: "Caught",
    narration:
      "main's except ValueError matches. The handler prints the message and the program carries on normally.",
  },
]

function Scene() {
  const { step } = useViz()
  const f = FRAMES[step]!
  return (
    <div className="grid gap-4 p-4 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
      <ol className="border-rule bg-code-bg rounded-lg border py-2 font-mono text-[0.8rem] leading-relaxed">
        {CODE.map((l, i) => (
          <li
            key={i}
            className={cn("flex px-2 whitespace-pre", i + 1 === f.line && "bg-highlight")}
          >
            <span className="text-muted w-6 shrink-0 pr-2 text-right select-none">{i + 1}</span>
            {l || " "}
          </li>
        ))}
      </ol>
      <div className="space-y-3">
        <ol className="flex flex-col-reverse gap-1.5" aria-label="Call stack, innermost on top">
          {f.frames.map((fr) => (
            <li
              key={fr.name}
              className={cn(
                "rounded-md border-2 px-3 py-1.5 font-mono text-sm transition-colors duration-300",
                fr.state === "raising" && "border-hard bg-hard-soft",
                fr.state === "handling" && "border-easy bg-easy-soft",
                fr.state === "active" && "border-rule bg-surface",
                fr.state === "unwound" && "border-rule text-muted border-dashed line-through",
              )}
            >
              {fr.name}
              <span className="sr-only"> ({fr.state})</span>
            </li>
          ))}
        </ol>
        {f.error && (
          <p className="text-hard font-mono text-xs" data-testid="unwind-error">
            {f.error}
          </p>
        )}
        <div>
          <p className="text-muted text-xs font-semibold uppercase">Output</p>
          <pre className="border-rule bg-code-bg min-h-10 rounded-md border px-2 py-1 font-mono text-xs whitespace-pre-wrap">
            {f.output.join("\n") || " "}
          </pre>
        </div>
      </div>
    </div>
  )
}

export function ExceptionUnwindViz() {
  return (
    <VizFrame
      title="An exception climbs the call stack"
      caption="A raised exception abandons frames one by one, running any finally blocks on the way, until an except clause that matches its type catches it. If nothing catches it, the program stops with a traceback."
      steps={STEPS}
      intervalMs={2600}
    >
      <Scene />
    </VizFrame>
  )
}
