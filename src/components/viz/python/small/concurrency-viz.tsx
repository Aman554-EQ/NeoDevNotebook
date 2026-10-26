"use client"

import { VizFrame, useViz, type VizStep } from "../../_shared/viz-frame"

/**
 * A schematic timeline (not a measurement): three tasks, each = compute, wait for I/O, compute.
 * Units are abstract time slots. It shows WHERE time goes in each model.
 */
type Seg = { start: number; len: number; kind: "cpu" | "wait" }
type Lane = { label: string; segs: Seg[] }
type Model = { title: string; lanes: Lane[]; total: number; note: string }

const task = (offset: number, cpu = 1, wait = 3): Seg[] => [
  { start: offset, len: cpu, kind: "cpu" },
  { start: offset + cpu, len: wait, kind: "wait" },
  { start: offset + cpu + wait, len: cpu, kind: "cpu" },
]

const MODELS: Model[] = [
  {
    title: "Sequential",
    lanes: [
      { label: "task 1", segs: task(0) },
      { label: "task 2", segs: task(5) },
      { label: "task 3", segs: task(10) },
    ],
    total: 15,
    note: "Each task waits for its I/O before the next starts: the CPU sits idle during every wait.",
  },
  {
    title: "Threads (I/O-bound)",
    lanes: [
      { label: "thread 1", segs: task(0) },
      { label: "thread 2", segs: task(1) },
      { label: "thread 3", segs: task(2) },
    ],
    total: 7,
    note: "While one thread waits for I/O it releases the GIL, so the others run. Waits overlap; only one thread runs Python bytecode at a time.",
  },
  {
    title: "asyncio (I/O-bound)",
    lanes: [
      { label: "coroutine 1", segs: task(0) },
      { label: "coroutine 2", segs: task(1) },
      { label: "coroutine 3", segs: task(2) },
    ],
    total: 7,
    note: "One thread, one event loop: each coroutine pauses at await, and the loop runs another. Same overlap as threads, with explicit switch points.",
  },
  {
    title: "Threads (CPU-bound)",
    lanes: [
      { label: "thread 1", segs: [{ start: 0, len: 4, kind: "cpu" }] },
      { label: "thread 2", segs: [{ start: 4, len: 4, kind: "cpu" }] },
      { label: "thread 3", segs: [{ start: 8, len: 4, kind: "cpu" }] },
    ],
    total: 12,
    note: "Pure computation never waits, so on a standard (GIL) build the threads effectively take turns: no speed-up.",
  },
  {
    title: "Processes (CPU-bound)",
    lanes: [
      { label: "process 1", segs: [{ start: 0, len: 4, kind: "cpu" }] },
      { label: "process 2", segs: [{ start: 0, len: 4, kind: "cpu" }] },
      { label: "process 3", segs: [{ start: 0, len: 4, kind: "cpu" }] },
    ],
    total: 4,
    note: "Each process has its own interpreter and GIL, so CPU work runs truly in parallel on separate cores.",
  },
]

const STEPS: VizStep[] = MODELS.map((m) => ({
  label: m.title,
  narration: `${m.title}: ${m.note} Finishes at t = ${m.total}.`,
}))
const MAX = 15

function Scene() {
  const { step } = useViz()
  const m = MODELS[step]!
  return (
    <div className="space-y-3 p-4">
      <p className="text-center font-semibold">
        {m.title} <span className="text-muted font-normal">· finishes at t = {m.total}</span>
      </p>
      <div className="space-y-2" role="img" aria-label={`${m.title}: finishes at time ${m.total}`}>
        {m.lanes.map((lane) => (
          <div key={lane.label} className="grid grid-cols-[6rem_1fr] items-center gap-2">
            <span className="text-muted font-mono text-xs">{lane.label}</span>
            <div className="bg-surface-2 relative h-6 rounded">
              {lane.segs.map((s, i) => (
                <span
                  key={i}
                  className="absolute top-0 h-6 rounded transition-all duration-500"
                  style={{
                    left: `${(s.start / MAX) * 100}%`,
                    width: `calc(${(s.len / MAX) * 100}% - 2px)`,
                    background: s.kind === "cpu" ? "var(--series-1)" : "transparent",
                    border: s.kind === "wait" ? "2px dashed var(--muted)" : undefined,
                  }}
                />
              ))}
            </div>
          </div>
        ))}
        <div className="grid grid-cols-[6rem_1fr] gap-2">
          <span />
          <div className="text-muted flex justify-between font-mono text-[0.65rem]">
            {[0, 5, 10, 15].map((t) => (
              <span key={t}>t={t}</span>
            ))}
          </div>
        </div>
      </div>
      <p className="flex flex-wrap justify-center gap-4 text-xs">
        <span>
          <span
            aria-hidden
            className="mr-1 inline-block size-3 rounded-sm align-middle"
            style={{ background: "var(--series-1)" }}
          />
          running Python code
        </span>
        <span>
          <span
            aria-hidden
            className="border-muted mr-1 inline-block size-3 rounded-sm border-2 border-dashed align-middle"
          />
          waiting for I/O
        </span>
      </p>
    </div>
  )
}

export function ConcurrencyViz() {
  return (
    <VizFrame
      title="Where the time goes: threads, asyncio, processes"
      caption="Schematic, not measured. Threads and asyncio speed up I/O-bound work by overlapping waits; only processes (or a free-threaded build) run CPU-bound Python in parallel."
      steps={STEPS}
      intervalMs={3000}
    >
      <Scene />
    </VizFrame>
  )
}
