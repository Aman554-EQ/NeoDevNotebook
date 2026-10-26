"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { ChevronDown, CircleCheck, ListChecks, MessageSquareText } from "lucide-react"
import type { NavModule } from "@/lib/content"
import { useProgress } from "@/lib/progress/store"
import { cn } from "@/lib/utils"
import { ModuleIcon } from "./module-icon"

/** Part → Module → Lesson tree. The module containing the current page starts expanded. */
export function ModuleTree({
  modules,
  onNavigate,
}: {
  modules: NavModule[]
  onNavigate?: () => void
}) {
  const pathname = usePathname()
  return (
    <nav aria-label="Modules" className="text-[0.95rem]">
      <ul className="space-y-1">
        {modules.map((m) => (
          <ModuleNode key={m.slug} module={m} pathname={pathname} onNavigate={onNavigate} />
        ))}
      </ul>
    </nav>
  )
}

function ModuleNode({
  module: m,
  pathname,
  onNavigate,
}: {
  module: NavModule
  pathname: string
  onNavigate?: () => void
}) {
  const inModule = pathname.split("/")[2] === m.slug
  const [open, setOpen] = useState(inModule)
  const { isDone } = useProgress()
  const listId = `tree-${m.slug}`

  const item = (href: string, label: React.ReactNode, key: string) => {
    const active = pathname === href
    return (
      <li key={key}>
        <Link
          href={href}
          onClick={onNavigate}
          aria-current={active ? "page" : undefined}
          className={cn(
            "text-muted hover:bg-surface-2 hover:text-ink flex items-center gap-2 rounded-[var(--radius-control)] px-2 py-1.5 leading-snug",
            active && "bg-accent-soft text-ink font-medium",
          )}
        >
          {label}
        </Link>
      </li>
    )
  }

  return (
    <li>
      <div className="flex items-center">
        <Link
          href={`/learn/${m.slug}`}
          onClick={onNavigate}
          aria-current={pathname === `/learn/${m.slug}` ? "page" : undefined}
          className="hover:bg-surface-2 flex min-w-0 flex-1 items-center gap-2 rounded-[var(--radius-control)] px-2 py-1.5 font-semibold"
        >
          <ModuleIcon icon={m.icon} className="text-accent size-4 shrink-0" />
          <span className="truncate">{m.title}</span>
        </Link>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls={listId}
          aria-label={`${open ? "Collapse" : "Expand"} ${m.title}`}
          className="text-muted hover:bg-surface-2 inline-flex size-8 items-center justify-center rounded-[var(--radius-control)]"
        >
          <ChevronDown
            className={cn("size-4 transition-transform", !open && "-rotate-90")}
            aria-hidden
          />
        </button>
      </div>
      {open && (
        <ul id={listId} className="border-rule mt-1 ml-3 space-y-0.5 border-l pl-2">
          {m.lessons.map((l) =>
            item(
              `/learn/${m.slug}/${l.slug}`,
              <>
                <span className="flex w-5 shrink-0 justify-end font-mono text-xs tabular-nums">
                  {isDone(`lesson:${m.slug}/${l.slug}`) ? (
                    <CircleCheck className="text-easy size-4" aria-label="completed" />
                  ) : (
                    String(l.order).padStart(2, "0")
                  )}
                </span>
                <span>{l.title}</span>
              </>,
              l.slug,
            ),
          )}
          {m.problemCount > 0 &&
            item(
              `/practice/${m.slug}`,
              <>
                <ListChecks className="size-4 shrink-0" aria-hidden />
                <span>Practice ({m.problemCount})</span>
              </>,
              "practice",
            )}
          {m.interviewCount > 0 &&
            item(
              `/interview/${m.slug}`,
              <>
                <MessageSquareText className="size-4 shrink-0" aria-hidden />
                <span>Interview ({m.interviewCount})</span>
              </>,
              "interview",
            )}
        </ul>
      )}
    </li>
  )
}
