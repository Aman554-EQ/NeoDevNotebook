"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { useProgress, type ItemKey } from "@/lib/progress/store"

type LessonRef = { key: ItemKey; href: string; title: string }

/** "Continue where you left off": the first lesson not yet marked done (only after some progress). */
export function ContinueCard({ lessons }: { lessons: LessonRef[] }) {
  const { done, isDone } = useProgress()
  const started = lessons.some((l) => isDone(l.key))
  const next = lessons.find((l) => !isDone(l.key))
  if (!started || !next || !done.length) return null
  const completed = lessons.filter((l) => isDone(l.key)).length
  return (
    <Link
      href={next.href}
      data-testid="continue-card"
      className="group border-accent/40 bg-accent-soft hover:border-accent mt-10 flex items-center justify-between gap-4 rounded-[var(--radius-card)] border p-5"
    >
      <div>
        <p className="text-muted text-sm">
          Continue where you left off · {completed}/{lessons.length} lessons done
        </p>
        <p className="font-display group-hover:text-accent mt-1 text-lg font-semibold">
          {next.title}
        </p>
      </div>
      <ArrowRight className="text-accent size-5 shrink-0" aria-hidden />
    </Link>
  )
}
