import type { Metadata } from "next"
import { Suspense } from "react"
import { notFound } from "next/navigation"
import { Breadcrumbs } from "@/components/layout/breadcrumbs"
import { PageSkeleton } from "@/components/layout/page-skeleton"
import { ItemBrowser } from "@/components/problem/item-browser"
import { getInterviewQuestions, getModule, getNavTree } from "@/lib/content"

export const ensureStatic = "navigation"

export async function generateStaticParams() {
  return (await getNavTree()).filter((m) => m.interviewCount > 0).map((m) => ({ module: m.slug }))
}

export async function generateMetadata({
  params,
}: PageProps<"/interview/[module]">): Promise<Metadata> {
  const m = await getModule((await params).module)
  return { title: m ? `${m.title} interview questions` : undefined }
}

export default function InterviewListPage({ params }: PageProps<"/interview/[module]">) {
  // params are read inside the boundary so the shared App Shell stays URL-independent.
  return (
    <Suspense fallback={<PageSkeleton />}>
      <InterviewListContent params={params} />
    </Suspense>
  )
}

async function InterviewListContent({ params }: Pick<PageProps<"/interview/[module]">, "params">) {
  const { module } = await params
  const m = await getModule(module)
  if (!m || !m.interviewCount) notFound()
  const questions = await getInterviewQuestions(module)
  return (
    <main>
      <Breadcrumbs items={[{ href: "/interview", label: "Interview" }, { label: m.title }]} />
      <h1 className="font-display text-3xl font-semibold sm:text-4xl">
        {m.title}: interview questions
      </h1>
      <p className="text-muted mt-2 mb-6 max-w-2xl">
        {questions.length} questions. Expand “Quick answer” for a one-breath summary, or open a
        question for the full answer.
      </p>
      <ItemBrowser
        doneLabel="Reviewed"
        items={questions.map((q) => ({
          key: `interview:${q.id}`,
          id: q.id,
          title: q.question,
          difficulty: q.difficulty,
          tags: q.tags,
          href: `/interview/${module}/${q.id}`,
          preview: q.shortAnswer,
        }))}
      />
    </main>
  )
}
