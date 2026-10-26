"use client"

import { useState } from "react"
import { VizFrame, useViz, type VizStep } from "../../_shared/viz-frame"

/**
 * How operation counts grow with n. Built with the dataviz method: one y-axis, validated
 * categorical palette (--series-1…5), 2px lines, recessive grid, legend + crosshair tooltip,
 * and a table view (required because some light-mode series are below 3:1 contrast).
 */
const SERIES = [
  { id: "1", label: "O(1)", example: "list[i], dict lookup", f: () => 1 },
  { id: "logn", label: "O(log n)", example: "bisect, heap push", f: (n: number) => Math.log2(n) },
  { id: "n", label: "O(n)", example: "x in list, sum()", f: (n: number) => n },
  { id: "nlogn", label: "O(n log n)", example: "sorted()", f: (n: number) => n * Math.log2(n) },
  { id: "n2", label: "O(n²)", example: "nested loops", f: (n: number) => n * n },
] as const
const COLOR = [
  "var(--series-1)",
  "var(--series-2)",
  "var(--series-3)",
  "var(--series-4)",
  "var(--series-5)",
]

const N_MAX = 20
const W = 640
const H = 300
const PAD = { l: 48, r: 16, t: 12, b: 36 }
const sx = (n: number) => PAD.l + ((n - 1) / (N_MAX - 1)) * (W - PAD.l - PAD.r)
/** A "nice" axis maximum (1, 2 or 5 × 10^k) at or above v. */
const niceMax = (v: number) => {
  const p = 10 ** Math.floor(Math.log10(v))
  return ([1, 2, 5, 10].find((m) => m * p >= v) ?? 10) * p
}
const NS = Array.from({ length: N_MAX }, (_, i) => i + 1)
const fmt = (v: number) => (Number.isInteger(v) ? String(v) : v.toFixed(1))

const STEPS: VizStep[] = [
  {
    label: "O(1)",
    narration: "Constant: the work doesn't depend on n. Indexing a list or looking up a dict key.",
  },
  {
    label: "O(log n)",
    narration:
      "Logarithmic: doubling n adds just one step. Binary search with bisect, heap push and pop.",
  },
  {
    label: "O(n)",
    narration: "Linear: twice the data, twice the work. Scanning a list, 'x in list', sum().",
  },
  {
    label: "O(n log n)",
    narration:
      "n log n: the cost of a good comparison sort such as sorted(). Slightly worse than linear.",
  },
  {
    label: "O(n²)",
    narration:
      "Quadratic: at n = 20 it is already 400 steps. Typical of a loop inside a loop; often fixable with a set or dict.",
  },
]

function Chart() {
  const { step } = useViz()
  const [hover, setHover] = useState<number | null>(null)
  const [table, setTable] = useState(false)
  const shown = SERIES.slice(0, step + 1)
  // The y-axis rescales to the curves shown, so adding O(n²) visibly squashes the others.
  const yMax = niceMax(Math.max(2, ...shown.map((s) => s.f(N_MAX))))
  const sy = (v: number) => H - PAD.b - (v / yMax) * (H - PAD.t - PAD.b)
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => t * yMax)

  const onMove = (e: React.PointerEvent<SVGRectElement>) => {
    const box = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - box.left) / box.width) * (W - PAD.l - PAD.r)
    const n = Math.round((x / (W - PAD.l - PAD.r)) * (N_MAX - 1)) + 1
    setHover(Math.min(N_MAX, Math.max(1, n)))
  }

  return (
    <div className="p-4">
      <div className="mb-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm" aria-label="Legend">
        {SERIES.map((s, i) => (
          <span key={s.id} className={i > step ? "text-muted line-through" : ""}>
            <span
              aria-hidden
              className="mr-1.5 inline-block h-0.5 w-4 align-middle"
              style={{ background: COLOR[i] }}
            />
            {s.label}
          </span>
        ))}
        <button
          type="button"
          onClick={() => setTable((t) => !t)}
          className="border-rule hover:border-accent ml-auto rounded-[var(--radius-control)] border px-2 py-0.5 text-xs"
          aria-pressed={table}
          data-testid="bigo-table-toggle"
        >
          {table ? "Show chart" : "Show table"}
        </button>
      </div>

      {table ? (
        <div className="overflow-x-auto">
          <table className="w-full text-right font-mono text-xs" data-testid="bigo-table">
            <caption className="sr-only">Steps needed for n = 1, 5, 10, 20</caption>
            <thead>
              <tr>
                <th className="text-left font-sans">growth</th>
                {[1, 5, 10, 20].map((n) => (
                  <th key={n}>n={n}</th>
                ))}
                <th className="text-left font-sans">example</th>
              </tr>
            </thead>
            <tbody>
              {SERIES.map((s) => (
                <tr key={s.id} className="border-rule border-t">
                  <th className="py-1 text-left">{s.label}</th>
                  {[1, 5, 10, 20].map((n) => (
                    <td key={n}>{fmt(s.f(n))}</td>
                  ))}
                  <td className="text-muted pl-3 text-left font-sans">{s.example}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="relative">
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="h-auto w-full"
            role="img"
            aria-label="Line chart of steps against n for each growth rate"
          >
            {ticks.map((v) => (
              <g key={v}>
                <line
                  x1={PAD.l}
                  x2={W - PAD.r}
                  y1={sy(v)}
                  y2={sy(v)}
                  stroke="var(--rule)"
                  strokeWidth={1}
                />
                <text
                  x={PAD.l - 8}
                  y={sy(v) + 4}
                  textAnchor="end"
                  fontSize={11}
                  fill="var(--muted)"
                >
                  {fmt(v)}
                </text>
              </g>
            ))}
            {[1, 5, 10, 15, 20].map((n) => (
              <text
                key={n}
                x={sx(n)}
                y={H - PAD.b + 18}
                textAnchor="middle"
                fontSize={11}
                fill="var(--muted)"
              >
                {n}
              </text>
            ))}
            <text
              x={(W + PAD.l) / 2}
              y={H - 4}
              textAnchor="middle"
              fontSize={11}
              fill="var(--muted)"
            >
              n (input size)
            </text>
            {shown.map((s, i) => (
              <polyline
                key={s.id}
                fill="none"
                stroke={COLOR[i]}
                strokeWidth={2}
                strokeLinejoin="round"
                strokeLinecap="round"
                points={NS.map((n) => `${sx(n)},${sy(s.f(n))}`).join(" ")}
              />
            ))}
            {hover !== null && (
              <g>
                <line
                  x1={sx(hover)}
                  x2={sx(hover)}
                  y1={PAD.t}
                  y2={H - PAD.b}
                  stroke="var(--muted)"
                  strokeDasharray="3 3"
                />
                {shown.map((s, i) => (
                  <circle
                    key={s.id}
                    cx={sx(hover)}
                    cy={sy(s.f(hover))}
                    r={4}
                    fill={COLOR[i]}
                    stroke="var(--surface)"
                    strokeWidth={2}
                  />
                ))}
              </g>
            )}
            <rect
              x={PAD.l}
              y={PAD.t}
              width={W - PAD.l - PAD.r}
              height={H - PAD.t - PAD.b}
              fill="transparent"
              onPointerMove={onMove}
              onPointerLeave={() => setHover(null)}
              data-testid="bigo-hit"
            />
          </svg>
          {hover !== null && (
            <div
              className="border-rule bg-surface pointer-events-none absolute top-2 rounded-md border px-2 py-1 text-xs shadow-sm"
              style={{
                left: `${(sx(hover) / W) * 100}%`,
                transform: hover > N_MAX / 2 ? "translateX(-105%)" : "translateX(8px)",
              }}
              data-testid="bigo-tooltip"
            >
              <p className="font-semibold">n = {hover}</p>
              {shown
                .map((s, i) => ({ s, i, v: s.f(hover) }))
                .sort((a, b) => b.v - a.v)
                .map(({ s, i, v }) => (
                  <p key={s.id} className="flex items-center gap-1.5 font-mono">
                    <span
                      aria-hidden
                      className="inline-block size-2 rounded-full"
                      style={{ background: COLOR[i] }}
                    />
                    {s.label}: {fmt(v)}
                  </p>
                ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export function BigOViz() {
  return (
    <VizFrame
      title="How the work grows as n grows"
      caption="For small n everything is fast. As n grows the curves separate dramatically, which is why choosing the right data structure (set vs list, dict vs scanning) matters more than micro-optimising."
      steps={STEPS}
      intervalMs={2200}
    >
      <Chart />
    </VizFrame>
  )
}
