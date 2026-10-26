"use client"

import { MotionConfig, motion } from "motion/react"
import { useViz } from "../_shared/viz-frame"
import { cn } from "@/lib/utils"

/**
 * How CPython's list grows: capacity follows (n + n//8 + 6) & ~3 → 0, 4, 8, 16 …
 * so most appends just fill a spare slot; occasionally the whole block is copied.
 */

type Frame = { code: string; items: number[]; capacity: number; oldBlock?: number[] }

export const LIST_FRAMES: Frame[] = [
  { code: "nums = []", items: [], capacity: 0 },
  { code: "nums.append(10)", items: [10], capacity: 4 },
  { code: "nums.append(20)", items: [10, 20], capacity: 4 },
  { code: "nums.append(30)", items: [10, 20, 30], capacity: 4 },
  { code: "nums.append(40)", items: [10, 20, 30, 40], capacity: 4 },
  { code: "nums.append(50)", items: [10, 20, 30, 40, 50], capacity: 8, oldBlock: [10, 20, 30, 40] },
]

function Slot({ value, empty }: { value?: number; empty?: boolean }) {
  return (
    <div
      className={cn(
        "grid size-9 place-items-center rounded-md border font-mono text-sm sm:size-12 sm:text-base",
        empty ? "border-rule border-dashed bg-transparent" : "border-accent bg-accent-soft",
      )}
    >
      {value !== undefined && (
        <motion.span
          layoutId={`item-${value}`}
          initial={{ scale: 0.4, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 22 }}
        >
          {value}
        </motion.span>
      )}
    </div>
  )
}

/** Loaded lazily (motion is only downloaded when the visual is reached). */
export default function ListAppendScene() {
  const { step, reducedMotion } = useViz()
  const f = LIST_FRAMES[step]!
  return (
    <MotionConfig reducedMotion={reducedMotion ? "always" : "never"}>
      <div className="flex flex-col items-center gap-5 px-4 py-6">
        <code className="bg-surface-2 rounded-md px-3 py-1 font-mono text-sm">{f.code}</code>

        {f.oldBlock && (
          <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: 0.35 }}
            transition={{ duration: 1.2 }}
            className="flex flex-col items-center gap-1"
          >
            <span className="text-muted text-xs">old block (freed after copy)</span>
            <div className="flex gap-1.5">
              {f.oldBlock.map((v) => (
                <div
                  key={v}
                  className="border-rule text-muted grid size-9 place-items-center rounded-md border font-mono text-sm line-through sm:size-12"
                >
                  {v}
                </div>
              ))}
            </div>
          </motion.div>
        )}

        <div className="flex flex-col items-center gap-1">
          <span className="text-muted text-xs">
            {f.capacity === 0 ? "no block allocated" : `block of ${f.capacity} slots`}
          </span>
          <div className="flex min-h-12 flex-wrap justify-center gap-1.5" data-testid="list-slots">
            {Array.from({ length: f.capacity }, (_, i) => (
              <Slot key={i} value={f.items[i]} empty={f.items[i] === undefined} />
            ))}
          </div>
        </div>

        <dl className="flex gap-6 font-mono text-sm">
          <div>
            <dt className="text-muted inline">len: </dt>
            <dd className="inline font-semibold" data-testid="list-len">
              {f.items.length}
            </dd>
          </div>
          <div>
            <dt className="text-muted inline">capacity: </dt>
            <dd className="inline font-semibold">{f.capacity}</dd>
          </div>
        </dl>
      </div>
    </MotionConfig>
  )
}
