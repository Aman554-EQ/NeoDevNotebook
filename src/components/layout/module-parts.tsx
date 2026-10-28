import Link from "next/link"
import { BookOpen, Hammer, ListChecks, MessageSquareText } from "lucide-react"
import type { NavModule } from "@/lib/content"

/** The module at a glance: its parts (course, projects, practice, interview) as cards. */
export function ModuleParts({ module: m }: { module: NavModule }) {
  const minutes = m.lessons.reduce((sum, l) => sum + l.estimatedMinutes, 0)
  const parts = [
    {
      href: m.lessons[0] ? `/learn/${m.slug}/${m.lessons[0].slug}` : `/learn/${m.slug}`,
      icon: BookOpen,
      kicker: "Learn",
      title: "Course",
      stat: `${m.lessons.length} lessons · ~${Math.round(minutes / 60)} h`,
      blurb: "Concepts, visuals and verified code, in order.",
    },
    m.projects.length > 0 && {
      href: `/projects/${m.slug}`,
      icon: Hammer,
      kicker: "Build",
      title: "Projects",
      stat: `${m.projects.length} projects`,
      blurb: "Build real apps step by step, with solutions.",
    },
    m.problemCount > 0 && {
      href: `/practice/${m.slug}`,
      icon: ListChecks,
      kicker: "Practise",
      title: "Practice",
      stat: `${m.problemCount} problems`,
      blurb: "Easy to hard, with hints and full solutions.",
    },
    m.interviewCount > 0 && {
      href: `/interview/${m.slug}`,
      icon: MessageSquareText,
      kicker: "Prepare",
      title: "Interview",
      stat: `${m.interviewCount} questions`,
      blurb: "Short answer first, then the details.",
    },
  ].filter((p) => !!p)

  return (
    <nav aria-label={`${m.title} parts`} className="mt-8" data-testid="module-parts">
      <ol className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {parts.map((p) => (
          <li key={p.title}>
            <Link
              href={p.href}
              className="group border-rule bg-surface hover:border-accent flex h-full flex-col gap-1 rounded-[var(--radius-card)] border p-4"
            >
              <span className="text-muted flex items-center gap-2 text-xs font-semibold tracking-wide uppercase">
                <p.icon className="text-accent size-4" aria-hidden />
                {p.kicker}
              </span>
              <span className="font-display group-hover:text-accent text-lg font-semibold">
                {p.title}
              </span>
              <span className="text-sm font-medium">{p.stat}</span>
              <span className="text-muted text-sm">{p.blurb}</span>
            </Link>
          </li>
        ))}
      </ol>
    </nav>
  )
}
