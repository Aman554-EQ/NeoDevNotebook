"use client"

import { VizFrame, useViz, type VizStep } from "../../_shared/viz-frame"

/** A = {1, 2, 3, 4}, B = {3, 4, 5}. Results are exactly what Python printed. */
const ONLY_A = [1, 2]
const BOTH = [3, 4]
const ONLY_B = [5]
type Region = "a" | "both" | "b"
const OPS: { code: string; regions: Region[]; result: string }[] = [
  { code: "A | B", regions: ["a", "both", "b"], result: "{1, 2, 3, 4, 5}" },
  { code: "A & B", regions: ["both"], result: "{3, 4}" },
  { code: "A - B", regions: ["a"], result: "{1, 2}" },
  { code: "B - A", regions: ["b"], result: "{5}" },
  { code: "A ^ B", regions: ["a", "b"], result: "{1, 2, 5}" },
]
const STEPS: VizStep[] = [
  { label: "Union |", narration: "A | B: every item in A or B (or both): {1, 2, 3, 4, 5}." },
  { label: "Intersection &", narration: "A & B: only items in both sets: {3, 4}." },
  { label: "Difference -", narration: "A - B: items in A that are not in B: {1, 2}." },
  {
    label: "Difference -",
    narration: "B - A is different from A - B: {5}. Order matters for difference.",
  },
  { label: "Symmetric ^", narration: "A ^ B: items in exactly one of the sets: {1, 2, 5}." },
]

function Scene() {
  const { step } = useViz()
  const op = OPS[step]!
  const on = (r: Region) => op.regions.includes(r)
  const dot = (v: number, x: number, y: number, r: Region) => (
    <g key={v}>
      <circle
        cx={x}
        cy={y}
        r={15}
        fill={on(r) ? "var(--accent)" : "var(--surface)"}
        stroke="var(--accent)"
        strokeWidth={2}
      />
      <text
        x={x}
        y={y + 5}
        textAnchor="middle"
        fontFamily="var(--font-mono)"
        fontWeight={700}
        fontSize={14}
        fill={on(r) ? "var(--accent-ink)" : "var(--ink)"}
      >
        {v}
      </text>
    </g>
  )
  return (
    <div className="space-y-2 p-4">
      <p className="text-center font-mono text-sm">
        A = {"{1, 2, 3, 4}"} · B = {"{3, 4, 5}"}
      </p>
      <svg
        viewBox="0 0 420 200"
        className="mx-auto h-auto w-full max-w-md"
        role="img"
        aria-label={`${op.code} = ${op.result}`}
      >
        <circle
          cx={160}
          cy={100}
          r={85}
          fill="var(--accent-soft)"
          fillOpacity={0.5}
          stroke="var(--ink)"
          strokeWidth={1.5}
        />
        <circle
          cx={260}
          cy={100}
          r={85}
          fill="var(--accent-soft)"
          fillOpacity={0.5}
          stroke="var(--ink)"
          strokeWidth={1.5}
        />
        <text x={110} y={30} fontSize={14} fontWeight={700} fill="var(--ink)">
          A
        </text>
        <text x={300} y={30} fontSize={14} fontWeight={700} fill="var(--ink)">
          B
        </text>
        {ONLY_A.map((v, i) => dot(v, 120, 75 + i * 50, "a"))}
        {BOTH.map((v, i) => dot(v, 210, 75 + i * 50, "both"))}
        {ONLY_B.map((v) => dot(v, 300, 100, "b"))}
      </svg>
      <p className="text-center font-mono text-sm" data-testid="venn-result">
        {op.code} == <span className="bg-highlight rounded px-1">{op.result}</span>
      </p>
    </div>
  )
}

export function VennViz() {
  return (
    <VizFrame
      title="Set algebra"
      caption="Sets support math-style operations, and each one is fast because membership is a hash lookup. Filled circles are the items in the result."
      steps={STEPS}
      intervalMs={2400}
    >
      <Scene />
    </VizFrame>
  )
}
