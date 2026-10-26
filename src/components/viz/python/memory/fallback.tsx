"use client"

import { useId } from "react"
import { useViz } from "../../_shared/viz-frame"
import { CELL_W, MEMORY_SCENARIOS, objectWidth, type MemoryScenarioName } from "./model"

/** Static SVG of the same frame (reduced motion / no WebGL). World units → SVG: 70px per unit. */
const S = 70
const sx = (x: number) => 320 + x * S
const sy = (y: number) => 150 - y * S
const NAME_Y = 26

export function MemoryFallback({ scenario }: { scenario: MemoryScenarioName }) {
  const { step } = useViz()
  const marker = useId()
  const frame = MEMORY_SCENARIOS[scenario].frames[step]!
  const byId = new Map(frame.objects.map((o) => [o.id, o]))

  const label = frame.names
    .map((n) => {
      const o = byId.get(n.target)!
      return `${n.name} → ${o.type} ${o.value ?? `[${o.cells?.map((c) => c.text ?? "ref").join(", ")}]`}`
    })
    .join("; ")

  return (
    <div className="px-4 py-5">
      <p className="mb-3 text-center">
        <code className="bg-surface-2 rounded-md px-3 py-1 font-mono text-sm">{frame.code}</code>
      </p>
      <svg
        viewBox="0 0 640 300"
        className="mx-auto h-auto w-full max-w-2xl"
        role="img"
        aria-label={label}
      >
        <defs>
          <marker
            id={marker}
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
        {frame.objects.map((o) => {
          const w = objectWidth(o) * S
          const x = sx(o.x) - w / 2
          const y = sy(o.y) - 30
          return (
            <g key={o.id}>
              <text x={sx(o.x)} y={y - 6} textAnchor="middle" fontSize={12} fill="var(--muted)">
                {o.type}
              </text>
              <rect
                x={x}
                y={y}
                width={w}
                height={60}
                rx={8}
                fill="var(--accent-soft)"
                stroke="var(--accent)"
                strokeWidth={2}
              />
              {o.value !== undefined && (
                <text
                  x={sx(o.x)}
                  y={y + 37}
                  textAnchor="middle"
                  fontFamily="var(--font-mono)"
                  fontSize={18}
                  fill="var(--ink)"
                >
                  {o.value}
                </text>
              )}
              {o.cells?.map((c, i) => {
                const cx = x + 0.15 * S + i * CELL_W * S
                const target = c.ref ? byId.get(c.ref) : undefined
                return (
                  <g key={i}>
                    <rect
                      x={cx + 3}
                      y={y + 9}
                      width={CELL_W * S - 6}
                      height={42}
                      rx={5}
                      fill={c.ref ? "var(--surface)" : "var(--accent)"}
                    />
                    {c.ref ? (
                      <circle cx={cx + (CELL_W * S) / 2} cy={y + 30} r={5} fill="var(--ink)" />
                    ) : (
                      <text
                        x={cx + (CELL_W * S) / 2}
                        y={y + 36}
                        textAnchor="middle"
                        fontFamily="var(--font-mono)"
                        fontSize={15}
                        fontWeight={700}
                        fill="var(--accent-ink)"
                      >
                        {c.text}
                      </text>
                    )}
                    {o.cellLabels?.[i] && (
                      <text
                        x={cx + (CELL_W * S) / 2}
                        y={y + 74}
                        textAnchor="middle"
                        fontSize={11}
                        fill="var(--muted)"
                      >
                        {o.cellLabels[i]}
                      </text>
                    )}
                    {target && (
                      <line
                        x1={cx + (CELL_W * S) / 2}
                        y1={y + 30}
                        x2={sx(target.x)}
                        y2={sy(target.y) - 32}
                        stroke="var(--accent)"
                        strokeWidth={2}
                        markerEnd={`url(#${marker})`}
                      />
                    )}
                  </g>
                )
              })}
            </g>
          )
        })}
        {frame.names.map((n) => {
          const t = byId.get(n.target)!
          const w = Math.max(44, n.name.length * 11 + 22)
          return (
            <g key={n.name}>
              <rect
                x={sx(n.x) - w / 2}
                y={NAME_Y - 16}
                width={w}
                height={30}
                rx={15}
                fill="var(--surface)"
                stroke="var(--ink)"
                strokeWidth={1.5}
              />
              <text
                x={sx(n.x)}
                y={NAME_Y + 5}
                textAnchor="middle"
                fontFamily="var(--font-mono)"
                fontSize={15}
                fontWeight={700}
                fill="var(--ink)"
              >
                {n.name}
              </text>
              <line
                x1={sx(n.x)}
                y1={NAME_Y + 14}
                x2={sx(t.x)}
                y2={sy(t.y) - 46}
                stroke="var(--muted)"
                strokeWidth={2}
                markerEnd={`url(#${marker})`}
              />
            </g>
          )
        })}
      </svg>
    </div>
  )
}
