"use client"

import { useEffect, useRef } from "react"
import { ArrowRight } from "lucide-react"
import { changedVars, type TraceStep } from "@/lib/trace/narrate"
import { cn } from "@/lib/utils"
import { VizFrame, useViz, type VizStep } from "./viz-frame"

type TraceData = { steps: TraceStep[]; truncated: boolean; python: string }

export function CodeStepperView({
  title,
  caption,
  steps,
  trace,
  lines,
}: {
  title: string
  caption: string
  steps: VizStep[]
  trace: TraceData
  lines: string[]
}) {
  return (
    <VizFrame
      title={title}
      caption={caption}
      steps={steps}
      intervalMs={900}
      badge={`Real run · Python ${trace.python}`}
    >
      <StepperScene trace={trace} lines={lines} />
    </VizFrame>
  )
}

function StepperScene({ trace, lines }: { trace: TraceData; lines: string[] }) {
  const { step } = useViz()
  const cur = trace.steps[step]!
  const prev = trace.steps[step - 1]
  const changed = new Set(changedVars(prev, cur).map((c) => c.split(" = ")[0]))
  const codeRef = useRef<HTMLDivElement>(null)

  // Keep the current line visible inside the code panel without scrolling the page.
  useEffect(() => {
    const box = codeRef.current
    const row = box?.querySelector<HTMLElement>("[data-current]")
    if (!box || !row) return
    const top = row.offsetTop - box.offsetTop
    if (top < box.scrollTop || top + row.offsetHeight > box.scrollTop + box.clientHeight) {
      box.scrollTop = Math.max(0, top - box.clientHeight / 3)
    }
  }, [step])

  return (
    <div
      className="grid gap-4 p-4 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]"
      data-testid="code-stepper"
    >
      <div
        ref={codeRef}
        className="border-rule bg-code-bg relative max-h-80 overflow-auto rounded-lg border py-2 font-mono text-[0.85rem] leading-relaxed"
        data-testid="stepper-code"
        tabIndex={0}
        role="region"
        aria-label="Program source, current line highlighted"
      >
        {lines.map((html, i) => {
          const n = i + 1
          const isCur = n === cur.line
          const isPrev = !isCur && n === prev?.line
          return (
            <div
              key={n}
              data-current={isCur || undefined}
              data-line={n}
              className={cn(
                "flex min-w-max items-center pr-4",
                isCur && "bg-highlight",
                isPrev && "bg-accent-soft/60",
              )}
            >
              <span className="text-muted w-6 shrink-0 text-center" aria-hidden>
                {isCur ? <ArrowRight className="text-accent mx-auto size-3.5" /> : null}
              </span>
              <span className="text-muted w-7 shrink-0 pr-3 text-right tabular-nums select-none">
                {n}
              </span>
              <span
                className="shiki whitespace-pre"
                dangerouslySetInnerHTML={{ __html: html || " " }}
              />
            </div>
          )
        })}
      </div>

      <div className="flex min-w-0 flex-col gap-3">
        <section aria-label="Call stack and variables" data-testid="stepper-frames">
          <h3 className="text-muted mb-1.5 text-xs font-semibold tracking-wide uppercase">
            Frames (innermost on top)
          </h3>
          <ol className="flex flex-col-reverse gap-2">
            {cur.frames.map((f, i) => {
              const active = i === cur.frames.length - 1
              return (
                <li
                  key={`${f.name}-${i}`}
                  className={cn(
                    "border-rule bg-surface rounded-md border px-3 py-2",
                    active && "border-accent",
                  )}
                >
                  <p className="font-mono text-xs font-semibold">
                    {f.name === "<module>" ? "global" : `${f.name}()`}
                  </p>
                  {f.locals.length ? (
                    <dl className="mt-1 grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 font-mono text-xs">
                      {f.locals.map(([name, value]) => (
                        <div key={name} className="contents">
                          <dt className="text-muted">{name}</dt>
                          <dd
                            className={cn(
                              "truncate",
                              active && changed.has(name) && "bg-highlight rounded px-1",
                            )}
                            title={value}
                          >
                            {value}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  ) : (
                    <p className="text-muted mt-1 text-xs">no variables yet</p>
                  )}
                </li>
              )
            })}
          </ol>
          {(cur.event === "return" || cur.event === "yield") &&
            cur.returnValue !== undefined &&
            cur.frames.length > 1 && (
              <p className="mt-2 font-mono text-xs">
                {cur.event === "yield" ? "yields" : "returns"}{" "}
                <span className="bg-highlight rounded px-1">{cur.returnValue}</span>
              </p>
            )}
          {cur.event === "exception" && (
            <p className="text-hard mt-2 font-mono text-xs" data-testid="stepper-exception">
              {cur.exception}
            </p>
          )}
        </section>

        <section aria-label="Program output" data-testid="stepper-output">
          <h3 className="text-muted mb-1.5 text-xs font-semibold tracking-wide uppercase">
            Output
          </h3>
          <pre className="border-rule bg-code-bg min-h-10 overflow-x-auto rounded-md border px-3 py-2 font-mono text-xs whitespace-pre-wrap">
            {cur.stdout || " "}
          </pre>
        </section>
        {trace.truncated && (
          <p className="text-muted text-xs">
            This run was long, so only the first steps are shown.
          </p>
        )}
      </div>
    </div>
  )
}
