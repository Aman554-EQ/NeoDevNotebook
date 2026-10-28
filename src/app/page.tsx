import Link from "next/link"
import { ArrowRight, BookOpen, ListChecks, MessageSquareText } from "lucide-react"
import { LogoPattern } from "@/components/brand/logo-pattern"
import { NodeField } from "@/components/brand/node-field"
import { TechLogo } from "@/components/brand/tech-logo"
import { HeroLab } from "@/components/home/hero-lab"
import { ModuleIcon } from "@/components/layout/module-icon"
import { ContinueCard } from "@/components/progress/continue-card"
import { getNavTree } from "@/lib/content"
import { ROADMAP } from "@/lib/roadmap"

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
    <main className="relative isolate overflow-hidden">
      {/* Backdrop: printed logo wallpaper + drifting graph, both far below text contrast. */}
      <div aria-hidden className="absolute inset-0 -z-10">
        <LogoPattern />
        <div className="absolute inset-x-0 top-0 h-[52rem] [mask-image:linear-gradient(to_bottom,#000_70%,transparent)]">
          <NodeField />
        </div>
        <div className="bg-accent/10 absolute top-20 -left-40 size-[36rem] rounded-full blur-3xl" />
      </div>

      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:py-20">
        <section className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-14">
          <div className="relative" data-backdrop-avoid>
            {/* A soft paper-coloured glow keeps the wallpaper quiet behind the words. */}
            <div
              aria-hidden
              className="bg-bg/80 absolute -inset-x-10 -inset-y-8 -z-10 rounded-[3rem] blur-2xl"
            />
            <p className="text-accent font-mono text-sm font-medium">
              A visual notebook for learners
            </p>
            <h1 className="font-display mt-3 text-4xl leading-[1.08] font-semibold tracking-tight sm:text-5xl lg:text-6xl">
              Understand it. See it. <span className="bg-highlight px-1">Remember it.</span>
            </h1>
            <p className="text-muted mt-5 max-w-xl text-lg sm:text-xl">
              Python, Django, FastAPI, Git, Docker, PyTorch, machine learning and LLMs. Every
              concept comes with a visual, a worked example, practice problems and interview
              answers.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              {first && (
                <Link
                  href={first.href}
                  className="bg-accent text-accent-ink inline-flex items-center gap-2 rounded-[var(--radius-control)] px-5 py-3 font-medium shadow-sm hover:opacity-90"
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
            <dl className="mt-10 grid max-w-md grid-cols-3 gap-3">
              {[
                { label: "Lessons", value: totals.lessons, icon: BookOpen },
                { label: "Problems", value: totals.problems, icon: ListChecks },
                { label: "Interview Qs", value: totals.interview, icon: MessageSquareText },
              ].map(({ label, value, icon: Icon }) => (
                <div
                  key={label}
                  className="border-rule bg-surface/90 rounded-[var(--radius-card)] border p-3"
                >
                  <dt className="text-muted flex items-center gap-1.5 text-xs sm:text-sm">
                    <Icon className="size-4 shrink-0" aria-hidden /> {label}
                  </dt>
                  <dd className="font-display mt-1 text-2xl font-semibold">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
          <HeroLab />
        </section>

        <ContinueCard lessons={lessons} />

        <section aria-labelledby="path" className="mt-20">
          <p className="text-accent font-mono text-sm font-medium">The learning path</p>
          <h2 id="path" className="font-display mt-2 text-2xl font-semibold sm:text-3xl">
            From your first script to deep dives into web, ML, LLMs and AI infrastructure
          </h2>
          <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {ROADMAP.map((track) => {
              const m = modules.find((x) => x.slug === track.slug)
              return (
                <li
                  key={track.slug}
                  data-testid={`track-${track.slug}`}
                  className="border-rule bg-surface/95 has-[a:hover]:border-accent relative flex flex-col rounded-[var(--radius-card)] border p-5 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    {track.logos.length ? (
                      track.logos.map((l) => <TechLogo key={l} name={l} className="size-7" />)
                    ) : (
                      <ModuleIcon icon={m?.icon ?? "compass"} className="text-accent size-7" />
                    )}
                  </div>
                  <h3 className="font-display mt-3 text-xl font-semibold">
                    {m ? (
                      <Link
                        href={`/learn/${m.slug}`}
                        className="after:absolute after:inset-0 hover:underline"
                      >
                        {track.title}
                      </Link>
                    ) : (
                      track.title
                    )}
                  </h3>
                  <p className="text-muted mt-2 flex-1 text-[0.95rem]">{track.blurb}</p>
                  <p className="mt-4 text-sm font-medium">
                    {m ? (
                      <span className="text-accent inline-flex items-center gap-1">
                        {m.lessons.length} lessons
                        {m.problemCount > 0 && ` · ${m.problemCount} problems`}
                        <ArrowRight className="size-3.5" aria-hidden />
                      </span>
                    ) : (
                      <span className="text-muted">Coming soon</span>
                    )}
                  </p>
                </li>
              )
            })}
          </ol>
        </section>
      </div>
    </main>
  )
}
