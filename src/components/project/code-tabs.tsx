"use client"

import { useId, useRef, useState } from "react"
import { cn } from "@/lib/utils"

/**
 * Several files of one change, as tabs (server-rendered code blocks passed in as content).
 * Keyboard: arrow keys move between tabs (WAI-ARIA tabs pattern). The tab row scrolls sideways
 * on narrow screens instead of widening the page. Hidden panels stay empty until opened.
 */
export function CodeTabs({ tabs }: { tabs: { label: string; content: React.ReactNode }[] }) {
  const [active, setActive] = useState(0)
  const id = useId()
  const refs = useRef<(HTMLButtonElement | null)[]>([])

  const focus = (i: number) => {
    const next = (i + tabs.length) % tabs.length
    setActive(next)
    refs.current[next]?.focus()
  }

  return (
    <div className="not-prose my-6" data-testid="code-tabs">
      <div
        role="tablist"
        aria-label="Files"
        className="border-rule flex gap-1 overflow-x-auto border-b"
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") focus(active + 1)
          else if (e.key === "ArrowLeft") focus(active - 1)
          else if (e.key === "Home") focus(0)
          else if (e.key === "End") focus(tabs.length - 1)
        }}
      >
        {tabs.map((t, i) => (
          <button
            key={t.label}
            ref={(el) => {
              refs.current[i] = el
            }}
            type="button"
            role="tab"
            id={`${id}-tab-${i}`}
            aria-selected={i === active}
            aria-controls={`${id}-panel-${i}`}
            tabIndex={i === active ? 0 : -1}
            onClick={() => setActive(i)}
            className={cn(
              "-mb-px shrink-0 border-b-2 px-3 py-1.5 font-mono text-xs whitespace-nowrap",
              i === active
                ? "border-accent text-accent font-semibold"
                : "text-muted hover:text-ink border-transparent",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tabs.map((t, i) => (
        <div
          key={t.label}
          role="tabpanel"
          id={`${id}-panel-${i}`}
          aria-labelledby={`${id}-tab-${i}`}
          hidden={i !== active}
          className="[&>figure]:mt-2"
        >
          {/* Only the open file is in the DOM: long project pages carry dozens of highlighted files. */}
          {i === active && t.content}
        </div>
      ))}
    </div>
  )
}
