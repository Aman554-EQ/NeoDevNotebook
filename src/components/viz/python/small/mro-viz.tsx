"use client"

import { VizFrame, useViz, type VizStep } from "../../_shared/viz-frame"

/**
 * The diamond: class A; class B(A); class C(A); class D(B, C).
 * Python printed D.__mro__ = D, B, C, A, object and D().hello() == "D>B>C>A".
 */
const NODES: Record<string, { x: number; y: number }> = {
  object: { x: 200, y: 26 },
  A: { x: 200, y: 92 },
  B: { x: 110, y: 162 },
  C: { x: 290, y: 162 },
  D: { x: 200, y: 232 },
}
const EDGES: [string, string][] = [
  ["A", "object"],
  ["B", "A"],
  ["C", "A"],
  ["D", "B"],
  ["D", "C"],
]
const MRO = ["D", "B", "C", "A", "object"]

const STEPS: VizStep[] = [
  {
    label: "The diamond",
    narration:
      "D inherits from B and C, which both inherit from A. Which hello() should D().hello() use?",
  },
  ...MRO.map((k, i) => ({
    label: `${i + 1}. ${k}`,
    narration:
      i === 0
        ? "Attribute lookup follows D.__mro__. It starts with D itself."
        : i === 1
          ? "Then B, the first base listed in class D(B, C)."
          : i === 2
            ? "Then C. A comes AFTER both B and C, because every class appears before its own bases."
            : i === 3
              ? "Then A, shared by B and C, but visited only once."
              : "Finally object, the root of every class. super() in each hello() calls the NEXT class in this order, so D().hello() returns 'D>B>C>A'.",
  })),
]

function Scene() {
  const { step } = useViz()
  const visited = MRO.slice(0, step)
  return (
    <div className="space-y-2 p-4">
      <svg
        viewBox="0 0 400 260"
        className="mx-auto h-auto w-full max-w-md"
        role="img"
        aria-label={`MRO: ${MRO.join(" → ")}`}
      >
        {EDGES.map(([a, b]) => (
          <line
            key={a + b}
            x1={NODES[a]!.x}
            y1={NODES[a]!.y - 18}
            x2={NODES[b]!.x}
            y2={NODES[b]!.y + 18}
            stroke="var(--muted)"
            strokeWidth={2}
          />
        ))}
        {Object.entries(NODES).map(([k, p]) => {
          const order = visited.indexOf(k)
          const current = order === visited.length - 1 && order !== -1
          return (
            <g key={k}>
              <rect
                x={p.x - 38}
                y={p.y - 18}
                width={76}
                height={36}
                rx={8}
                fill={
                  current ? "var(--accent)" : order !== -1 ? "var(--accent-soft)" : "var(--surface)"
                }
                stroke="var(--accent)"
                strokeWidth={2}
              />
              <text
                x={p.x}
                y={p.y + 5}
                textAnchor="middle"
                fontFamily="var(--font-mono)"
                fontWeight={700}
                fontSize={14}
                fill={current ? "var(--accent-ink)" : "var(--ink)"}
              >
                {k}
              </text>
              {order !== -1 && (
                <text x={p.x + 46} y={p.y - 10} fontSize={12} fontWeight={700} fill="var(--ink)">
                  {order + 1}
                </text>
              )}
            </g>
          )
        })}
      </svg>
      <p className="text-center font-mono text-sm" data-testid="mro-order">
        D.__mro__: {visited.length ? visited.join(" → ") : "(press step)"}
      </p>
    </div>
  )
}

export function MroViz() {
  return (
    <VizFrame
      title="Method resolution order (MRO)"
      caption="Python linearises the class hierarchy (the C3 algorithm): each class comes before its bases, and bases keep the order you listed them. Lookups, and super(), walk this one list."
      steps={STEPS}
      intervalMs={2000}
    >
      <Scene />
    </VizFrame>
  )
}
