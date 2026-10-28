import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ListChecks, MessageSquareText } from "lucide-react"
import { DifficultyBadge, MinutesBadge } from "@/components/lesson/badges"
import { Breadcrumbs } from "@/components/layout/breadcrumbs"
import { ModuleParts } from "@/components/layout/module-parts"
import { getModule, getNavTree } from "@/lib/content"
import { groupBySection, sectionId } from "@/lib/content/sections"

export const ensureStatic = "navigation"
// Fully prerendered, so the complete page is in the first paint. Opting out of instant-navigation
// validation avoids a Suspense skeleton that would flash (and shift the layout) on every page load.
export const instant = false

export async function generateStaticParams() {
  return (await getNavTree()).map((m) => ({ module: m.slug }))
}

export async function generateMetadata({
  params,
}: PageProps<"/learn/[module]">): Promise<Metadata> {
  const m = await getModule((await params).module)
  return { title: m?.title, description: m?.description }
}

export default async function ModulePage({ params }: PageProps<"/learn/[module]">) {
  const m = await getModule((await params).module)
  if (!m) notFound()
  return (
    <main>
      <Breadcrumbs items={[{ href: "/learn", label: "Learn" }, { label: m.title }]} />
      <p className="text-muted font-mono text-sm">Part {m.part}</p>
      <h1 className="font-display mt-1 text-3xl font-semibold sm:text-4xl">{m.title}</h1>
      <p className="text-muted mt-3 max-w-2xl text-lg">{m.description}</p>
      <ModuleParts module={m} />

      <div className="mt-8 space-y-10">
        {groupBySection(m.lessons).map((g, i) => (
          <section
            key={g.section ?? `group-${i}`}
            aria-labelledby={g.section ? sectionId(m.slug, g.section) : undefined}
          >
            {g.section && (
              <h2
                id={sectionId(m.slug, g.section)}
                className="font-display mb-3 text-xl font-semibold"
              >
                {g.section}
                <span className="text-muted ml-2 font-sans text-sm font-normal">
                  {g.items.length} {g.items.length === 1 ? "lesson" : "lessons"}
                </span>
              </h2>
            )}
            <ol className="space-y-3">
              {g.items.map((l) => (
                <li key={l.slug}>
                  <Link
                    href={`/learn/${m.slug}/${l.slug}`}
                    className="group border-rule bg-surface hover:border-accent flex gap-4 rounded-[var(--radius-card)] border p-4"
                  >
                    <span className="text-muted font-mono text-2xl tabular-nums">
                      {String(l.order).padStart(2, "0")}
                    </span>
                    <span className="min-w-0">
                      <span className="font-display group-hover:text-accent block text-lg font-semibold">
                        {l.title}
                      </span>
                      <span className="text-muted mt-1 block text-[0.95rem]">{l.summary}</span>
                      <span className="mt-2 flex items-center gap-3">
                        <DifficultyBadge level={l.difficulty} />
                        <MinutesBadge minutes={l.estimatedMinutes} />
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          </section>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        {m.problemCount > 0 && (
          <Link
            href={`/practice/${m.slug}`}
            className="border-rule bg-surface hover:border-accent inline-flex items-center gap-2 rounded-[var(--radius-control)] border px-4 py-2 font-medium"
          >
            <ListChecks className="size-4" aria-hidden /> {m.problemCount} practice problems
          </Link>
        )}
        {m.interviewCount > 0 && (
          <Link
            href={`/interview/${m.slug}`}
            className="border-rule bg-surface hover:border-accent inline-flex items-center gap-2 rounded-[var(--radius-control)] border px-4 py-2 font-medium"
          >
            <MessageSquareText className="size-4" aria-hidden /> {m.interviewCount} interview
            questions
          </Link>
        )}
      </div>
    </main>
  )
}
