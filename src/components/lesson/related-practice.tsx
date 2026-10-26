import Link from "next/link"
import { ListChecks, MessageSquareText } from "lucide-react"
import type { InterviewSummary, ProblemSummary } from "@/lib/content"
import { DifficultyBadge } from "./badges"
import { InlineCode } from "./inline-code"

/** "Practise this lesson": the problems and interview questions a lesson links to in its front matter. */
export function RelatedPractice({
  problems,
  questions,
}: {
  problems: ProblemSummary[]
  questions: InterviewSummary[]
}) {
  if (!problems.length && !questions.length) return null
  const row = (
    href: string,
    title: string,
    difficulty: ProblemSummary["difficulty"],
    id: string,
  ) => (
    <li key={id}>
      <Link
        href={href}
        className="border-rule bg-surface hover:border-accent flex items-center justify-between gap-3 rounded-[var(--radius-control)] border px-3 py-2"
      >
        <span className="min-w-0">
          <span className="text-muted mr-2 font-mono text-xs">{id}</span>
          <InlineCode text={title} />
        </span>
        <DifficultyBadge level={difficulty} />
      </Link>
    </li>
  )
  return (
    <section
      aria-labelledby="related-practice"
      className="border-rule mt-12 rounded-[var(--radius-card)] border p-4"
      data-testid="related-practice"
    >
      <h2 id="related-practice" className="font-display text-xl font-semibold">
        Practise this lesson
      </h2>
      {problems.length > 0 && (
        <>
          <h3 className="text-muted mt-4 mb-2 flex items-center gap-2 text-sm font-semibold">
            <ListChecks className="size-4" aria-hidden /> Problems
          </h3>
          <ul className="space-y-1.5">
            {problems.map((p) => row(`/practice/${p.module}/${p.id}`, p.title, p.difficulty, p.id))}
          </ul>
        </>
      )}
      {questions.length > 0 && (
        <>
          <h3 className="text-muted mt-4 mb-2 flex items-center gap-2 text-sm font-semibold">
            <MessageSquareText className="size-4" aria-hidden /> Interview questions
          </h3>
          <ul className="space-y-1.5">
            {questions.map((q) =>
              row(`/interview/${q.module}/${q.id}`, q.question, q.difficulty, q.id),
            )}
          </ul>
        </>
      )}
    </section>
  )
}
