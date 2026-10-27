import type { Metadata } from "next"
import { notFound } from "next/navigation"
import "katex/dist/katex.min.css"
import { Breadcrumbs } from "@/components/layout/breadcrumbs"
import { PrevNext } from "@/components/layout/prev-next"
import { ReadingAids } from "@/components/layout/reading-aids"
import { Toc } from "@/components/layout/toc"
import { LessonHeader } from "@/components/lesson/lesson-header"
import { RelatedPractice } from "@/components/lesson/related-practice"
import { BookmarkButton, DoneToggle } from "@/components/progress/progress-buttons"
import { allLessonParams, getInterviewQuestions, getLesson, getProblems } from "@/lib/content"
import { moduleComponents } from "@/lib/mdx/module-components"
import { renderMdx } from "@/lib/mdx/render"

export const ensureStatic = "navigation"
// Fully prerendered, so the complete page is in the first paint. Opting out of instant-navigation
// validation avoids a Suspense skeleton that would flash (and shift the layout) on every page load.
export const instant = false

export async function generateStaticParams() {
  return allLessonParams()
}

export async function generateMetadata({
  params,
}: PageProps<"/learn/[module]/[lesson]">): Promise<Metadata> {
  const { module, lesson } = await params
  const data = await getLesson(module, lesson)
  return { title: data?.lesson.title, description: data?.lesson.summary }
}

export default async function LessonPage({ params }: PageProps<"/learn/[module]/[lesson]">) {
  const { module, lesson: slug } = await params
  const data = await getLesson(module, slug)
  if (!data) notFound()
  const { lesson, prev, next } = data
  const { content, toc } = await renderMdx(lesson.body, {
    components: moduleComponents(module),
  })
  const href = `/learn/${module}/${slug}`
  const [allProblems, allQuestions] = await Promise.all([
    getProblems(module),
    getInterviewQuestions(module),
  ])
  // Keep the order the lesson lists them in.
  const related = {
    problems: lesson.practice.flatMap((id) => allProblems.filter((p) => p.id === id)),
    questions: lesson.interview.flatMap((id) => allQuestions.filter((q) => q.id === id)),
  }

  return (
    <div className="xl:grid xl:grid-cols-[minmax(0,1fr)_14rem] xl:gap-10">
      <main className="min-w-0">
        <Breadcrumbs
          items={[
            { href: "/learn", label: "Learn" },
            { href: `/learn/${module}`, label: lesson.moduleTitle },
            { label: lesson.title },
          ]}
        />
        <article>
          <LessonHeader lesson={lesson} />
          <div className="prose-notebook" data-testid="lesson-body">
            {content}
          </div>
        </article>
        <RelatedPractice problems={related.problems} questions={related.questions} />
        <div className="mt-10 flex flex-wrap gap-2">
          <DoneToggle itemKey={`lesson:${module}/${slug}`} />
          <BookmarkButton itemKey={`lesson:${module}/${slug}`} title={lesson.title} href={href} />
        </div>
        <PrevNext prev={prev} next={next} />
      </main>
      <aside className="sticky top-24 hidden max-h-[calc(100dvh-7rem)] self-start overflow-y-auto xl:block">
        <Toc items={toc} />
      </aside>
      <ReadingAids items={toc} />
    </div>
  )
}
