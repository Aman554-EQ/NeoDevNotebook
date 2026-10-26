import { Clock } from "lucide-react"
import type { Difficulty } from "@/lib/content/difficulty"
import { cn } from "@/lib/utils"

const DIFFICULTY_STYLE: Record<Difficulty, string> = {
  easy: "bg-easy-soft text-easy",
  simple: "bg-simple-soft text-simple",
  medium: "bg-medium-soft text-medium",
  hard: "bg-hard-soft text-hard",
}

export function DifficultyBadge({ level, className }: { level: Difficulty; className?: string }) {
  return (
    <span
      data-testid="difficulty-badge"
      data-difficulty={level}
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize",
        DIFFICULTY_STYLE[level],
        className,
      )}
    >
      {level}
    </span>
  )
}

export function TagChip({ tag }: { tag: string }) {
  return (
    <span className="border-rule text-muted inline-flex items-center rounded-full border px-2 py-0.5 font-mono text-xs">
      #{tag}
    </span>
  )
}

export function MinutesBadge({ minutes }: { minutes: number }) {
  return (
    <span className="text-muted inline-flex items-center gap-1 text-sm">
      <Clock className="size-4" aria-hidden />
      {minutes} min
    </span>
  )
}
