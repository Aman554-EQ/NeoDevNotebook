import Link from "next/link"
import { ArrowRight, BookOpen, ListChecks, MessageSquareText } from "lucide-react"
import { ModuleIcon } from "@/components/layout/module-icon"
import { ContinueCard } from "@/components/progress/continue-card"
import { getNavTree } from "@/lib/content"
import { ROADMAP } from "@/lib/roadmap"
import { SITE_NAME } from "@/lib/utils"

export default async function HomePage() {
  const modules = await getNavTree()
  const lessons = modules.flatMap((m) =>
    m.lessons.map((l) => ({
      key: `lesson:${m.slug}/${l.slug}` as const,
      href: `/learn/${m.slug}/${l.slug}`,
      title: l.title,
    })),
  )
  const first = lessons[0]
  const totals = {
    lessons: lessons.length,
    problems: modules.reduce((n, m) => n + m.problemCount, 0),
    interview: modules.reduce((n, m) => n + m.interviewCount, 0),
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <section className="max-w-3xl">
        <p className="text-accent font-mono text-sm">{SITE_NAME}</p>
        <h1 className="font-display mt-3 text-4xl leading-[1.1] font-semibold tracking-tight sm:text-5xl">
          Understand it. See it. <span className="bg-highlight px-1">Remember it.</span>
        </h1>
        <p className="text-muted mt-5 text-lg sm:text-xl">
          A tutor-style digital notebook for Python, web frameworks, Git, Docker, PyTorch, machine
          learning and LLMs — every concept with a visual, a worked example, practice problems and
          interview answers.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          {first && (
            <Link
              href={first.href}
              className="bg-accent text-accent-ink inline-flex items-center gap-2 rounded-[var(--radius-control)] px-5 py-3 font-medium hover:opacity-90"
            >
              Start learning <ArrowRight className="size-4" aria-hidden />
            </Link>
          )}
          <Link
            href="/practice"
            className="border-rule bg-surface hover:border-accent inline-flex items-center gap-2 rounded-[var(--radius-control)] border px-5 py-3 font-medium"
          >
            Browse practice problems
          </Link>
        </div>
      </section>

      <ContinueCard lessons={lessons} />

      <dl className="mt-12 grid grid-cols-3 gap-3 sm:max-w-xl">
        {[
          { label: "Lessons", value: totals.lessons, icon: BookOpen },
          { label: "Problems", value: totals.problems, icon: ListChecks },
          { label: "Interview Qs", value: totals.interview, icon: MessageSquareText },
        ].map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            className="border-rule bg-surface rounded-[var(--radius-card)] border p-3 sm:p-4"
          >
            <dt className="text-muted flex items-center gap-1.5 text-xs sm:text-sm">
              <Icon className="size-4 shrink-0" aria-hidden /> {label}
            </dt>
            <dd className="font-display mt-1 text-2xl font-semibold">{value}</dd>
          </div>
        ))}
      </dl>

      <section aria-labelledby="path" className="mt-16">
        <h2 id="path" className="font-display text-2xl font-semibold sm:text-3xl">
          The learning path
        </h2>
        <ol className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ROADMAP.map((part) => {
            const built = modules.filter((m) => m.part === part.part)
            return (
              <li
                key={part.part}
                data-testid={`part-${part.part}`}
                className="border-rule bg-surface flex flex-col rounded-[var(--radius-card)] border p-5"
              >
                <p className="text-muted font-mono text-xs">Part {part.part}</p>
                <h3 className="font-display mt-1 text-xl font-semibold">{part.title}</h3>
                <p className="text-muted mt-2 flex-1 text-[0.95rem]">{part.blurb}</p>
                {built.length ? (
                  <ul className="mt-4 space-y-1">
                    {built.map((m) => (
                      <li key={m.slug}>
                        <Link
                          href={`/learn/${m.slug}`}
                          className="text-accent inline-flex items-center gap-2 font-medium hover:underline"
                        >
                          <ModuleIcon icon={m.icon} className="size-4" />
                          {m.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted mt-4 text-sm font-medium">Coming soon</p>
                )}
              </li>
            )
          })}
        </ol>
      </section>
    </main>
  )
}
