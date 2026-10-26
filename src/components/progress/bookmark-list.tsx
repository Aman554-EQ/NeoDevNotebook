"use client"

import Link from "next/link"
import { X } from "lucide-react"
import { useBookmarks } from "@/lib/progress/store"

const TYPE_LABEL = { lesson: "Lesson", problem: "Problem", interview: "Interview" } as const

export function BookmarkList() {
  const { bookmarks, toggleBookmark } = useBookmarks()
  if (!bookmarks.length) {
    return (
      <p
        className="border-rule bg-surface text-muted rounded-[var(--radius-card)] border p-4"
        data-testid="bookmarks-empty"
      >
        No bookmarks yet. Use the Bookmark button on any lesson, problem or interview question.
      </p>
    )
  }
  return (
    <ul className="space-y-2" data-testid="bookmark-list">
      {bookmarks.map((b) => {
        const type = b.key.split(":")[0] as keyof typeof TYPE_LABEL
        return (
          <li
            key={b.key}
            className="border-rule bg-surface flex items-center gap-3 rounded-[var(--radius-card)] border p-4"
          >
            <span className="bg-surface-2 text-muted rounded px-1.5 py-0.5 text-xs font-medium">
              {TYPE_LABEL[type] ?? type}
            </span>
            <Link
              href={b.href}
              className="hover:text-accent min-w-0 flex-1 font-medium hover:underline"
            >
              {b.title}
            </Link>
            <button
              type="button"
              onClick={() => toggleBookmark(b)}
              aria-label={`Remove bookmark: ${b.title}`}
              className="text-muted hover:bg-surface-2 hover:text-ink inline-flex size-9 items-center justify-center rounded-[var(--radius-control)]"
            >
              <X className="size-4" aria-hidden />
            </button>
          </li>
        )
      })}
    </ul>
  )
}
