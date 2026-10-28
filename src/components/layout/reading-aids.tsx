"use client"

import { useEffect, useRef, useState } from "react"
import { ArrowUp, ListTree, X } from "lucide-react"
import { cn } from "@/lib/utils"
import type { TocItem } from "./toc"

const button =
  "border-rule bg-surface text-ink hover:border-accent inline-flex size-11 items-center justify-center rounded-full border shadow-md"

/**
 * Floating helpers for long pages: an "On this page" outline below the xl breakpoint (where the
 * sidebar outline is hidden) and a back-to-top button once the reader has scrolled down.
 * Fixed-position, so they never shift the layout.
 */
export function ReadingAids({ items }: { items: TocItem[] }) {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const panel = useRef<HTMLDivElement>(null)
  const toggle = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 800)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false)
        toggle.current?.focus()
      }
    }
    const onClick = (e: MouseEvent) => {
      const target = e.target as Node
      if (!panel.current?.contains(target) && !toggle.current?.contains(target)) setOpen(false)
    }
    document.addEventListener("keydown", onKey)
    document.addEventListener("click", onClick)
    return () => {
      document.removeEventListener("keydown", onKey)
      document.removeEventListener("click", onClick)
    }
  }, [open])

  return (
    <div className="fixed right-4 bottom-4 z-30 flex flex-col items-end gap-2 print:hidden">
      {open && (
        <div
          ref={panel}
          id="page-outline"
          data-testid="page-outline"
          className="border-rule bg-surface max-h-[60dvh] w-[min(20rem,calc(100vw-2rem))] overflow-y-auto rounded-[var(--radius-card)] border p-3 shadow-lg xl:hidden"
        >
          <nav aria-label="On this page (outline)" className="text-sm">
            <p className="mb-2 font-semibold">On this page</p>
            <ul className="space-y-1">
              {items.map((i) => (
                <li key={i.id}>
                  <a
                    href={`#${i.id}`}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "text-muted hover:text-ink block rounded px-2 py-1 leading-snug",
                      i.depth === 3 && "pl-5",
                    )}
                  >
                    {i.text}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      )}
      <div className="flex gap-2">
        {scrolled && (
          <button
            type="button"
            aria-label="Back to top"
            data-testid="back-to-top"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className={button}
          >
            <ArrowUp className="size-5" aria-hidden />
          </button>
        )}
        {items.length > 2 && (
          <button
            ref={toggle}
            type="button"
            aria-label={open ? "Close the page outline" : "Open the page outline"}
            aria-expanded={open}
            aria-controls="page-outline"
            data-testid="outline-toggle"
            onClick={() => setOpen((o) => !o)}
            className={cn(button, "xl:hidden")}
          >
            {open ? (
              <X className="size-5" aria-hidden />
            ) : (
              <ListTree className="size-5" aria-hidden />
            )}
          </button>
        )}
      </div>
    </div>
  )
}
