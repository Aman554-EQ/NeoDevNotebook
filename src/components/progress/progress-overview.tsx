"use client"

import Link from "next/link"
import { useProgress, type ItemKey } from "@/lib/progress/store"

export type ModuleProgressInput = {
  slug: string
  title: string
  lessons: ItemKey[]
  problems: ItemKey[]
  interview: ItemKey[]
}

function Ring({ value, total, label }: { value: number; total: number; label: string }) {
  const pct = total ? value / total : 0
  const r = 26
  const c = 2 * Math.PI * r
  return (
    <div className="flex items-center gap-3">
      <svg viewBox="0 0 64 64" className="size-14 -rotate-90" aria-hidden>
        <circle cx="32" cy="32" r={r} fill="none" stroke="var(--rule)" strokeWidth="7" />
        <circle
          cx="32"
          cy="32"
          r={r}
          fill="none"
          stroke="var(--accent)"
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={`${pct * c} ${c}`}
        />
      </svg>
      <div>
        <p className="text-muted text-sm">{label}</p>
        <p className="font-mono font-semibold">
          {value}/{total}
        </p>
      </div>
    </div>
  )
}

export function ProgressOverview({ modules }: { modules: ModuleProgressInput[] }) {
  const { isDone, done } = useProgress()
  const count = (keys: ItemKey[]) => keys.filter(isDone).length
  return (
    <div className="space-y-4">
      {!done.length && (
        <p className="border-rule bg-surface text-muted rounded-[var(--radius-card)] border p-4">
          No progress yet. Use “Mark as done” on a lesson, problem or interview question — it is
          saved in this browser.
        </p>
      )}
      {modules.map((m) => (
        <section
          key={m.slug}
          data-testid={`progress-${m.slug}`}
          className="border-rule bg-surface rounded-[var(--radius-card)] border p-5"
        >
          <h2 className="font-display text-xl font-semibold">
            <Link href={`/learn/${m.slug}`} className="hover:text-accent">
              {m.title}
            </Link>
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <Ring label="Lessons" value={count(m.lessons)} total={m.lessons.length} />
            <Ring label="Problems solved" value={count(m.problems)} total={m.problems.length} />
            <Ring
              label="Questions reviewed"
              value={count(m.interview)}
              total={m.interview.length}
            />
          </div>
        </section>
      ))}
    </div>
  )
}
