"use client"

import { useId } from "react"
import { useViz } from "../_shared/viz-frame"
import { NAMES_FRAMES } from "./names-model"

/** Static SVG version of the names → objects scene (reduced motion / no WebGL). */
export function NamesFallback() {
  const { step } = useViz()
  const markerId = useId()
  const f = NAMES_FRAMES[step]!
  const CELL = 34
  const boxX = (x: number) => 300 + x * 70
  const objById = new Map(f.objects.map((o) => [o.id, o]))

  return (
    <div className="px-4 py-6">
      <p className="mb-3 text-center">
        <code className="bg-surface-2 rounded-md px-3 py-1 font-mono text-sm">{f.code}</code>
      </p>
      <svg
        viewBox="0 0 600 220"
        className="mx-auto h-auto w-full max-w-xl"
        role="img"
        aria-label={`Names ${f.names.map((n) => `${n.name} points to [${objById.get(n.target)?.items.join(", ")}]`).join("; ")}`}
      >
        <defs>
          <marker
            id={markerId}
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="7"
            markerHeight="7"
            orient="auto"
          >
            <path d="M0,0 L10,5 L0,10 z" fill="var(--muted)" />
          </marker>
        </defs>
        {f.objects.map((o) => {
          const w = o.items.length * CELL + 16
          const x = boxX(o.x) - w / 2
          return (
            <g key={o.id}>
              <rect
                x={x}
                y={130}
                width={w}
                height={50}
                rx={8}
                fill="var(--accent-soft)"
                stroke="var(--accent)"
                strokeWidth={2}
              />
              {o.items.map((v, i) => (
                <text
                  key={i}
                  x={x + 8 + i * CELL + CELL / 2}
                  y={161}
                  textAnchor="middle"
                  fontFamily="var(--font-mono)"
                  fontSize={18}
                  fill="var(--ink)"
                >
                  {v}
                </text>
              ))}
              <text x={boxX(o.x)} y={200} textAnchor="middle" fontSize={12} fill="var(--muted)">
                list object
              </text>
            </g>
          )
        })}
        {f.names.map((n, i) => {
          // Arrows that share a target fan out across its top edge.
          const target = objById.get(n.target)!
          const sharing = f.names.filter((m) => m.target === n.target)
          const slot = sharing.indexOf(n) - (sharing.length - 1) / 2
          const tx = boxX(target.x) + slot * 30
          const lx = 120 + i * 140
          return (
            <g key={n.name}>
              <rect
                x={lx - 26}
                y={20}
                width={52}
                height={34}
                rx={17}
                fill="var(--surface)"
                stroke="var(--ink)"
                strokeWidth={1.5}
              />
              <text
                x={lx}
                y={43}
                textAnchor="middle"
                fontFamily="var(--font-mono)"
                fontSize={18}
                fontWeight={700}
                fill="var(--ink)"
              >
                {n.name}
              </text>
              <line
                x1={lx}
                y1={54}
                x2={tx}
                y2={126}
                stroke="var(--muted)"
                strokeWidth={2}
                markerEnd={`url(#${markerId})`}
              />
            </g>
          )
        })}
      </svg>
    </div>
  )
}
