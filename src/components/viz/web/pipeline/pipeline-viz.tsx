"use client"

import { ArrowDown, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { VizFrame, useViz } from "../../_shared/viz-frame"

export type PipelineNode = { id: string; label: string; detail?: string }
export type PipelineStep = {
  label: string
  narration: string
  /** Nodes lit up in this step (the work happening now). */
  active: string[]
  /** Nodes already passed through (shown dimmer than active ones). */
  done?: string[]
  /** "error" paints the active nodes red: the request stops here. */
  tone?: "ok" | "error"
  /** A small code/state panel under the diagram, e.g. the value being passed along. */
  panel?: { title: string; lines: string[] }
}

/**
 * A row of stages with the current one highlighted: the shared shape behind most web visuals
 * (request flows, validation, caching, idempotency). Wraps to a column on narrow screens.
 */
export function PipelineViz({
  title,
  caption,
  nodes,
  steps,
  intervalMs = 2800,
}: {
  title: string
  caption: string
  nodes: PipelineNode[]
  steps: PipelineStep[]
  intervalMs?: number
}) {
  return (
    <VizFrame title={title} caption={caption} steps={steps} intervalMs={intervalMs}>
      <Scene nodes={nodes} steps={steps} />
    </VizFrame>
  )
}

function Scene({ nodes, steps }: { nodes: PipelineNode[]; steps: PipelineStep[] }) {
  const { step } = useViz()
  const s = steps[step]!
  const error = s.tone === "error"
  return (
    <div className="space-y-4 p-4" data-testid="pipeline">
      <ol className="flex flex-col items-stretch gap-1 md:flex-row md:flex-wrap md:items-center md:justify-center">
        {nodes.map((n, i) => {
          const active = s.active.includes(n.id)
          const done = s.done?.includes(n.id)
          return (
            <li key={n.id} className="flex flex-col items-center md:flex-row">
              {i > 0 && (
                <>
                  <ArrowDown className="text-muted my-0.5 size-4 md:hidden" aria-hidden />
                  <ArrowRight className="text-muted mx-1 hidden size-4 md:block" aria-hidden />
                </>
              )}
              <div
                data-active={active || undefined}
                className={cn(
                  "w-full rounded-lg border-2 px-3 py-2 text-center transition-colors md:w-auto md:min-w-[7.5rem]",
                  active && !error && "border-accent bg-accent-soft",
                  active && error && "border-hard bg-hard-soft",
                  !active && done && "border-accent/40 bg-surface",
                  !active && !done && "border-rule bg-surface opacity-70",
                )}
              >
                <span className="block text-sm font-semibold">{n.label}</span>
                {n.detail && (
                  <span className="text-muted block font-mono text-[0.7rem]">{n.detail}</span>
                )}
              </div>
            </li>
          )
        })}
      </ol>
      {s.panel && (
        <div
          className={cn(
            "mx-auto max-w-2xl rounded-lg border",
            error ? "border-hard/50" : "border-rule",
          )}
        >
          <p className="text-muted border-rule border-b px-3 py-1 text-xs font-semibold tracking-wide uppercase">
            {s.panel.title}
          </p>
          <pre className="bg-code-bg overflow-x-auto px-3 py-2 font-mono text-xs leading-relaxed sm:text-[0.8rem]">
            {s.panel.lines.join("\n")}
          </pre>
        </div>
      )}
    </div>
  )
}
