"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

export type TocItem = { id: string; text: string; depth: 2 | 3 }

/** "On this page" outline with scroll-spy. */
export function Toc({ items }: { items: TocItem[] }) {
  const [active, setActive] = useState<string>()

  useEffect(() => {
    const headings = items
      .map((i) => document.getElementById(i.id))
      .filter((h): h is HTMLElement => Boolean(h))
    if (!headings.length || typeof IntersectionObserver === "undefined") return
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting)
        if (visible[0]) setActive(visible[0].target.id)
      },
      { rootMargin: "-80px 0px -70% 0px" },
    )
    headings.forEach((h) => observer.observe(h))
    return () => observer.disconnect()
  }, [items])

  if (!items.length) return null
  return (
    <nav aria-label="On this page" className="text-sm">
      <p className="mb-3 font-semibold">On this page</p>
      <ul className="border-rule space-y-1.5 border-l">
        {items.map((i) => (
          <li key={i.id}>
            <a
              href={`#${i.id}`}
              className={cn(
                "text-muted hover:text-ink -ml-px block border-l-2 border-transparent py-0.5 leading-snug",
                i.depth === 3 ? "pl-6" : "pl-3",
                active === i.id && "border-accent text-ink font-medium",
              )}
            >
              {i.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
