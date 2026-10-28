"use client"

import { VizFrame, useViz, type VizStep } from "../../_shared/viz-frame"
import { cn } from "@/lib/utils"

type Layer = { name: string; detail: string }
type Frame = {
  code: string
  /** Outermost first. */
  layers: Layer[]
  /** Index of the active layer during a call, or null. */
  active: number | null
  flow?: string
  result?: string
}

const FRAMES: Frame[] = [
  {
    code: "def greet(name): return f'hello {name}'",
    layers: [{ name: "greet", detail: "the original function" }],
    active: null,
  },
  {
    code: "greet = shout(greet)   # what @shout does",
    layers: [
      { name: "wrapper", detail: "made by shout; remembers func" },
      { name: "greet (original)", detail: "func inside the closure" },
    ],
    active: null,
    flow: "The name greet now points at wrapper.",
  },
  {
    code: "greet('ada')   # call goes in…",
    layers: [
      { name: "wrapper", detail: "receives ('ada',)" },
      { name: "greet (original)", detail: "called by wrapper" },
    ],
    active: 1,
    flow: "wrapper → original returns 'hello ada'",
  },
  {
    code: "greet('ada')   # …result comes out",
    layers: [
      { name: "wrapper", detail: "applies .upper()" },
      { name: "greet (original)", detail: "already returned" },
    ],
    active: 0,
    result: "'HELLO ADA'",
  },
  {
    code: "@bold\n@italic\ndef text(): return 'hi'",
    layers: [
      { name: "bold wrapper", detail: "applied LAST, so outermost" },
      { name: "italic wrapper", detail: "applied first" },
      { name: "text (original)", detail: "returns 'hi'" },
    ],
    active: null,
    result: "'<b><i>hi</i></b>'",
  },
]

const STEPS: VizStep[] = [
  { label: "Function", narration: "greet is a plain function object, bound to the name greet." },
  {
    label: "Decorate",
    narration:
      "@shout runs once, at definition time: it calls shout(greet), which returns a new wrapper function. The name greet is rebound to that wrapper.",
  },
  {
    label: "Call in",
    narration:
      "Calling greet('ada') actually calls wrapper, which calls the original function inside it.",
  },
  {
    label: "Result out",
    narration:
      "The original returns 'hello ada'; wrapper uppercases it on the way out: 'HELLO ADA'.",
  },
  {
    label: "Stacking",
    narration:
      "Stacked decorators apply bottom-up (italic first, then bold), so bold is outermost. Calls go outside-in; results come back inside-out.",
  },
]

function Scene() {
  const { step } = useViz()
  const f = FRAMES[step]!
  const nest = (i: number): React.ReactNode => {
    const l = f.layers[i]
    if (!l) return null
    return (
      <div
        className={cn(
          "rounded-lg border-2 p-2 transition-colors duration-300 sm:p-3",
          f.active === i ? "border-medium bg-medium-soft" : "border-accent bg-surface",
        )}
      >
        <p className="font-mono text-sm font-semibold">{l.name}</p>
        <p className="text-muted text-xs">{l.detail}</p>
        {i < f.layers.length - 1 && <div className="mt-2">{nest(i + 1)}</div>}
      </div>
    )
  }
  return (
    <div className="space-y-3 p-4">
      <pre className="bg-surface-2 mx-auto w-fit max-w-full overflow-x-auto rounded-md px-3 py-1 font-mono text-sm whitespace-pre">
        {f.code}
      </pre>
      <div className="mx-auto max-w-md">{nest(0)}</div>
      {f.flow && <p className="text-muted text-center text-sm">{f.flow}</p>}
      {f.result && (
        <p className="text-center font-mono text-sm" data-testid="decorator-result">
          result: <span className="bg-highlight rounded px-1">{f.result}</span>
        </p>
      )}
    </div>
  )
}

export function DecoratorViz() {
  return (
    <VizFrame
      title="A decorator wraps a function"
      caption="@decorator is shorthand for func = decorator(func). The wrapper can run code before and after the original call, which is why decorators are used for logging, timing, caching and access checks."
      steps={STEPS}
      intervalMs={2600}
    >
      <Scene />
    </VizFrame>
  )
}
