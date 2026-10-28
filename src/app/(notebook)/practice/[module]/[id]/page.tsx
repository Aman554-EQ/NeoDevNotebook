import type { Metadata } from "next"
import { notFound } from "next/navigation"
import "katex/dist/katex.min.css"
import { Breadcrumbs } from "@/components/layout/breadcrumbs"
import { PrevNext } from "@/components/layout/prev-next"
import { DifficultyBadge, TagChip } from "@/components/lesson/badges"
import { CodeBlock } from "@/components/lesson/code-block"
import { Reveal } from "@/components/lesson/reveal"
import { BookmarkButton, DoneToggle } from "@/components/progress/progress-buttons"
import { allProblemParams, getModule, getProblem } from "@/lib/content"
import { Markdown } from "@/lib/mdx/render"

export const ensureStatic = "navigation"
// Fully prerendered, so the complete page is in the first paint. Opting out of instant-navigation
// validation avoids a Suspense skeleton that would flash (and shift the layout) on every page load.
export const instant = false

export async function generateStaticParams() {
  return allProblemParams()
}

export async function generateMetadata({
  params,
}: PageProps<"/practice/[module]/[id]">): Promise<Metadata> {
  const { module, id } = await params
  const data = await getProblem(module, id)
  return { title: data?.problem.title }
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="font-display mb-3 text-xl font-semibold">{title}</h2>
      {children}
    </section>
  )
}

export default async function ProblemPage({ params }: PageProps<"/practice/[module]/[id]">) {
  const { module, id } = await params
  const [data, m] = await Promise.all([getProblem(module, id), getModule(module)])
  if (!data || !m) notFound()
  const { problem: p, prev, next } = data
  const href = `/practice/${module}/${id}`

  return (
    <main className="max-w-3xl">
      <Breadcrumbs
        items={[
          { href: "/practice", label: "Practice" },
          { href: `/practice/${module}`, label: m.title },
          { label: p.id },
        ]}
      />
      <p className="text-muted font-mono text-sm">{p.id}</p>
      <h1 className="font-display mt-1 text-3xl font-semibold sm:text-4xl">{p.title}</h1>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <DifficultyBadge level={p.difficulty} />
        {p.tags.map((t) => (
          <TagChip key={t} tag={t} />
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <DoneToggle itemKey={`problem:${p.id}`} />
        <BookmarkButton itemKey={`problem:${p.id}`} title={p.title} href={href} />
      </div>

      <Section title="Problem">
        <Markdown source={p.statement} />
      </Section>

      {p.constraints.length > 0 && (
        <Section title="Constraints">
          <ul className="list-disc space-y-1 pl-5">
            {p.constraints.map((c) => (
              <li key={c}>
                <Markdown source={c} className="[&_p]:inline" />
              </li>
            ))}
          </ul>
        </Section>
      )}

      <Section title="Examples">
        <div className="space-y-3">
          {p.examples.map((e, i) => (
            <div
              key={i}
              className="border-rule bg-surface rounded-[var(--radius-card)] border p-4 font-mono text-sm [overflow-wrap:anywhere]"
            >
              <p>
                <span className="text-muted">Input: </span>
                {e.input}
              </p>
              <p>
                <span className="text-muted">Output: </span>
                {e.output}
              </p>
              {e.explanation && (
                <p className="text-muted mt-2 font-sans text-[0.95rem]">{e.explanation}</p>
              )}
            </div>
          ))}
        </div>
      </Section>

      <Section title="Hints">
        {p.hints.map((h, i) => (
          <Reveal key={i} kind="hint" label={`Hint ${i + 1}`}>
            <Markdown source={h} />
          </Reveal>
        ))}
      </Section>

      <Section title="Solution">
        <Reveal kind="solution" label="Show solution">
          <CodeBlock code={p.solution.code} language={p.solution.language} title="solution" />
          <h3 className="font-display mt-6 mb-2 text-lg font-semibold">How it works</h3>
          <Markdown source={p.solution.explanation} />
          <dl className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="bg-surface-2 rounded-[var(--radius-control)] p-3">
              <dt className="text-muted text-sm">Time</dt>
              <dd className="font-mono">{p.complexity.time}</dd>
            </div>
            <div className="bg-surface-2 rounded-[var(--radius-control)] p-3">
              <dt className="text-muted text-sm">Space</dt>
              <dd className="font-mono">{p.complexity.space}</dd>
            </div>
          </dl>
        </Reveal>
      </Section>

      {p.variations.length > 0 && (
        <Section title="Variations & follow-ups">
          <ul className="list-disc space-y-1 pl-5">
            {p.variations.map((v) => (
              <li key={v}>
                <Markdown source={v} className="[&_p]:inline" />
              </li>
            ))}
          </ul>
        </Section>
      )}

      <PrevNext prev={prev} next={next} />
    </main>
  )
}
