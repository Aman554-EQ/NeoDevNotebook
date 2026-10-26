import { BookOpen, ListChecks } from "lucide-react"
import type { LessonFrontmatter } from "@/lib/content/schema"
import { DifficultyBadge, MinutesBadge } from "./badges"

/** Title block + learning objectives + prerequisites (lesson template §1). */
export function LessonHeader({ lesson }: { lesson: LessonFrontmatter & { order: number } }) {
  return (
    <header className="mb-8">
      <p className="text-muted font-mono text-sm">Lesson {String(lesson.order).padStart(2, "0")}</p>
      <h1 className="font-display mt-1 text-3xl leading-tight font-semibold tracking-tight sm:text-4xl">
        {lesson.title}
      </h1>
      <p className="text-muted mt-3 max-w-[65ch] text-lg">{lesson.summary}</p>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <DifficultyBadge level={lesson.difficulty} />
        <MinutesBadge minutes={lesson.estimatedMinutes} />
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <section
          aria-labelledby="objectives"
          className="border-rule bg-surface rounded-[var(--radius-card)] border p-4"
        >
          <h2 id="objectives" className="flex items-center gap-2 text-sm font-semibold">
            <ListChecks className="text-accent size-4" aria-hidden /> You will be able to
          </h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-[0.95rem]">
            {lesson.objectives.map((o) => (
              <li key={o}>{o}</li>
            ))}
          </ul>
        </section>
        <section
          aria-labelledby="prerequisites"
          className="border-rule bg-surface rounded-[var(--radius-card)] border p-4"
        >
          <h2 id="prerequisites" className="flex items-center gap-2 text-sm font-semibold">
            <BookOpen className="text-accent size-4" aria-hidden /> Before you start
          </h2>
          {lesson.prerequisites.length ? (
            <ul className="mt-2 list-disc space-y-1 pl-5 text-[0.95rem]">
              {lesson.prerequisites.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          ) : (
            <p className="text-muted mt-2 text-[0.95rem]">Nothing — this is a starting point.</p>
          )}
        </section>
      </div>
    </header>
  )
}
