"use client"

import type { SqlStep, SqlTable } from "@/lib/recording/load"
import { cn } from "@/lib/utils"
import { VizFrame, useViz } from "../viz-frame"
import { CodeHtml } from "./parts"

/** Tables, a query against them, and its result rows (all from a real SQLite run). */
export function SqlPlaygroundView({
  title,
  caption,
  tables,
  steps,
  sql,
}: {
  title: string
  caption: string
  tables: SqlTable[]
  steps: SqlStep[]
  sql: string[]
}) {
  return (
    <VizFrame
      title={title}
      caption={caption}
      steps={steps.map((s) => ({ label: s.label, narration: s.note }))}
      intervalMs={3600}
      badge="Recorded · real SQLite"
    >
      <Scene tables={tables} steps={steps} sql={sql} />
    </VizFrame>
  )
}

function Scene({ tables, steps, sql }: { tables: SqlTable[]; steps: SqlStep[]; sql: string[] }) {
  const { step } = useViz()
  const s = steps[step]!
  return (
    <div className="space-y-3 p-3 sm:p-4" data-testid="sql-playground">
      <div className="grid gap-3 sm:grid-cols-2">
        {tables.map((t) => (
          <Grid
            key={t.name}
            caption={t.name}
            columns={t.columns}
            rows={t.rows}
            active={s.uses.includes(t.name)}
          />
        ))}
      </div>
      <CodeHtml html={sql[step]!} label="SQL query" />
      <Grid caption={`result · ${s.rows.length} rows`} columns={s.columns} rows={s.rows} result />
    </div>
  )
}

function Grid({
  caption,
  columns,
  rows,
  active,
  result,
}: {
  caption: string
  columns: string[]
  rows: (string | number | null)[][]
  active?: boolean
  result?: boolean
}) {
  return (
    <div
      tabIndex={0}
      role="region"
      aria-label={caption}
      className={cn(
        "overflow-x-auto rounded-md border",
        result ? "border-accent" : active ? "border-accent/60 bg-accent-soft/40" : "border-rule",
      )}
    >
      <table className="w-full font-mono text-xs">
        <caption
          className={cn(
            "px-2 py-1 text-left font-sans font-semibold",
            result || active ? "text-accent" : "text-muted",
          )}
        >
          {caption}
        </caption>
        <thead>
          <tr className="border-rule border-y">
            {columns.map((c) => (
              <th key={c} scope="col" className="px-2 py-1 text-left font-semibold">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-rule border-b last:border-0">
              {r.map((v, j) => (
                <td key={j} className="px-2 py-0.5 whitespace-nowrap">
                  {v === null ? <span className="text-muted">NULL</span> : String(v)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
