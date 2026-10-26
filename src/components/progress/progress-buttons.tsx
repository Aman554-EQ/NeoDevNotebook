"use client"

import { Bookmark, BookmarkCheck, Circle, CircleCheck } from "lucide-react"
import { useBookmarks, useProgress, type ItemKey } from "@/lib/progress/store"
import { cn } from "@/lib/utils"

const base =
  "inline-flex items-center gap-2 rounded-[var(--radius-control)] border px-3 py-1.5 text-sm font-medium transition-colors"

export function DoneToggle({ itemKey }: { itemKey: ItemKey }) {
  const { isDone, toggleDone } = useProgress()
  const done = isDone(itemKey)
  return (
    <button
      type="button"
      onClick={() => toggleDone(itemKey)}
      aria-pressed={done}
      data-testid="done-toggle"
      className={cn(
        base,
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
      {done ? "Completed" : "Mark as done"}
    </button>
  )
}

export function BookmarkButton({
  itemKey,
  title,
  href,
}: {
  itemKey: ItemKey
  title: string
  href: string
}) {
  const { isBookmarked, toggleBookmark } = useBookmarks()
  const saved = isBookmarked(itemKey)
  return (
    <button
      type="button"
      onClick={() => toggleBookmark({ key: itemKey, title, href })}
      aria-pressed={saved}
      data-testid="bookmark-toggle"
      className={cn(
        base,
        saved
          ? "border-accent bg-accent-soft text-accent"
          : "border-rule bg-surface text-muted hover:text-ink",
      )}
    >
      {saved ? (
        <BookmarkCheck className="size-4" aria-hidden />
      ) : (
        <Bookmark className="size-4" aria-hidden />
      )}
      {saved ? "Bookmarked" : "Bookmark"}
    </button>
  )
}
