import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { MessageSquareText } from "lucide-react"
import "katex/dist/katex.min.css"
import { Breadcrumbs } from "@/components/layout/breadcrumbs"
import { PrevNext } from "@/components/layout/prev-next"
import { DifficultyBadge, TagChip } from "@/components/lesson/badges"
import { CodeBlock } from "@/components/lesson/code-block"
import { InlineCode, plainText } from "@/components/lesson/inline-code"
import { Reveal } from "@/components/lesson/reveal"
import { BookmarkButton, DoneToggle } from "@/components/progress/progress-buttons"
import { allInterviewParams, getInterviewQuestion, getModule } from "@/lib/content"
import { Markdown } from "@/lib/mdx/render"

export const ensureStatic = "navigation"
// Fully prerendered, so the complete page is in the first paint. Opting out of instant-navigation
// validation avoids a Suspense skeleton that would flash (and shift the layout) on every page load.
export const instant = false

export async function generateStaticParams() {
  return allInterviewParams()
}

export async function generateMetadata({
  params,
}: PageProps<"/interview/[module]/[id]">): Promise<Metadata> {
  const { module, id } = await params
  const data = await getInterviewQuestion(module, id)
  return { title: data && plainText(data.question.question) }
}

export default async function InterviewQuestionPage({
  params,
}: PageProps<"/interview/[module]/[id]">) {
  const { module, id } = await params
  const [data, m] = await Promise.all([getInterviewQuestion(module, id), getModule(module)])
  if (!data || !m) notFound()
  const { question: q, prev, next } = data
  const href = `/interview/${module}/${id}`

  return (
    <main className="max-w-3xl">
      <Breadcrumbs
        items={[
          { href: "/interview", label: "Interview" },
          { href: `/interview/${module}`, label: m.title },
          { label: q.id },
        ]}
      />
      <p className="text-muted font-mono text-sm">{q.id}</p>
      <h1 className="font-display mt-1 text-2xl leading-snug font-semibold sm:text-3xl">
        <InlineCode text={q.question} />
      </h1>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <DifficultyBadge level={q.difficulty} />
        {q.tags.map((t) => (
          <TagChip key={t} tag={t} />
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <DoneToggle itemKey={`interview:${q.id}`} />
        <BookmarkButton itemKey={`interview:${q.id}`} title={plainText(q.question)} href={href} />
      </div>

      <p className="text-muted mt-8 flex items-center gap-2 text-sm">
        <MessageSquareText className="size-4" aria-hidden />
        Answer it out loud first, then reveal.
      </p>
      <Reveal kind="solution" label="Show answer">
        <div className="border-accent bg-accent-soft rounded-[var(--radius-control)] border-l-4 px-4 py-3">
          <p className="text-accent text-sm font-semibold">Short answer (say this first)</p>
          <Markdown source={q.shortAnswer} className="mt-1" />
        </div>
        <h2 className="font-display mt-6 mb-2 text-xl font-semibold">Detailed answer</h2>
        <Markdown source={q.detailedAnswer} />
        {q.code && <CodeBlock code={q.code.code} language={q.code.language} />}
      </Reveal>

      {q.pitfalls.length > 0 && (
        <section className="mt-8">
          <h2 className="font-display mb-3 text-xl font-semibold">
            Pitfalls & what interviewers listen for
          </h2>
          <ul className="list-disc space-y-1 pl-5">
            {q.pitfalls.map((p) => (
              <li key={p}>
                <Markdown source={p} className="[&_p]:inline" />
              </li>
            ))}
          </ul>
        </section>
      )}
      {q.followUps.length > 0 && (
        <section className="mt-8">
          <h2 className="font-display mb-3 text-xl font-semibold">Likely follow-up questions</h2>
          <ul className="list-disc space-y-1 pl-5">
            {q.followUps.map((f) => (
              <li key={f}>
                <Markdown source={f} className="[&_p]:inline" />
              </li>
            ))}
          </ul>
        </section>
      )}

      <PrevNext prev={prev} next={next} />
    </main>
  )
}
