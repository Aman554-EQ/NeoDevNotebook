import type { Metadata } from "next"
import { ProgressOverview } from "@/components/progress/progress-overview"
import { getInterviewQuestions, getNavTree, getProblems } from "@/lib/content"

export const metadata: Metadata = { title: "Progress" }

export default async function ProgressPage() {
  const modules = await getNavTree()
  const input = await Promise.all(
    modules.map(async (m) => ({
      slug: m.slug,
      title: m.title,
      lessons: m.lessons.map((l) => `lesson:${m.slug}/${l.slug}` as const),
      problems: (await getProblems(m.slug)).map((p) => `problem:${p.id}` as const),
      interview: (await getInterviewQuestions(m.slug)).map((q) => `interview:${q.id}` as const),
    })),
  )
  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-3xl font-semibold sm:text-4xl">Your progress</h1>
      <p className="text-muted mt-2 mb-8">Saved in this browser only (no account needed).</p>
      <ProgressOverview modules={input} />
    </main>
  )
}
