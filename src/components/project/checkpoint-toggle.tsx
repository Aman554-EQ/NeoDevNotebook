"use client"

import { CircleCheck, Circle } from "lucide-react"
import { useProgress, type ItemKey } from "@/lib/progress/store"
import { cn } from "@/lib/utils"

export function CheckpointToggle({ itemKey }: { itemKey: ItemKey }) {
  const { isDone, toggleDone } = useProgress()
  const done = isDone(itemKey)
  return (
    <button
      type="button"
      aria-pressed={done}
      onClick={() => toggleDone(itemKey)}
      data-testid="checkpoint-toggle"
      className={cn(
        "inline-flex items-center gap-2 rounded-[var(--radius-control)] border px-3 py-1.5 text-sm font-medium",
        done
          ? "border-easy bg-easy-soft text-easy"
          : "border-rule bg-surface text-muted hover:text-ink",
      )}
    >
      {done ? (
        <CircleCheck className="size-4" aria-hidden />
      ) : (
        <Circle className="size-4" aria-hidden />
      )}
      {done ? "Passed on my machine" : "I ran it and it passed"}
    </button>
  )
}
