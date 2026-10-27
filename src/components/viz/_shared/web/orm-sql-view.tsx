"use client"

import { ArrowDown } from "lucide-react"
import type { OrmStep } from "@/lib/recording/load"
import { cn } from "@/lib/utils"
import { VizFrame, useViz } from "../viz-frame"
import { CodeHtml } from "./parts"

type Code = { python: string; sql: string[] }[]

/** An ORM expression, the exact SQL Django ran for it (captured), and the result. */
export function OrmSqlView({
  title,
  caption,
  steps,
  code,
}: {
  title: string
  caption: string
  steps: OrmStep[]
  code: Code
}) {
  return (
    <VizFrame
      title={title}
      caption={caption}
      steps={steps.map((s) => ({ label: s.label, narration: s.note }))}
      intervalMs={3200}
      badge="Recorded · real SQL"
    >
      <Scene steps={steps} code={code} />
    </VizFrame>
  )
}

function Scene({ steps, code }: { steps: OrmStep[]; code: Code }) {
  const { step } = useViz()
  const s = steps[step]!
  const c = code[step]!
  const n = s.sql.length
  return (
    <div className="space-y-2 p-3 sm:p-4" data-testid="orm-sql">
      <p className="text-muted text-xs font-semibold tracking-wide uppercase">Python (ORM)</p>
      <CodeHtml html={c.python} label="ORM code" />
      <div className="text-muted flex items-center justify-center gap-2 text-xs">
        <ArrowDown className="size-4" aria-hidden />
        <span
          data-testid="query-count"
          className={cn(
            "rounded-full px-2 py-0.5 font-mono font-semibold",
            n === 0
              ? "bg-surface-2"
              : n <= 2
                ? "bg-easy-soft text-easy"
                : "bg-medium-soft text-medium",
          )}
        >
          {n === 0 ? "no query yet (lazy)" : `${n} ${n === 1 ? "query" : "queries"}`}
        </span>
      </div>
      {c.sql.map((html, i) => (
        <CodeHtml key={i} html={html} label={`SQL query ${i + 1}`} />
      ))}
      <p className="text-muted pt-1 text-xs font-semibold tracking-wide uppercase">Result</p>
      <pre className="bg-surface-2 overflow-x-auto rounded-md px-3 py-2 font-mono text-xs">
        {s.result}
      </pre>
    </div>
  )
}
