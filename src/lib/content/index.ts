import { loadAllContent, type ContentBundle, type LessonSummary } from "./load"
import type { InterviewQuestion, Problem } from "./schema"

/**
 * Cached, app-facing content API. Content is read from disk once per build
 * ('use cache'), so every page built from it is fully static.
 */

async function getContent(): Promise<ContentBundle[]> {
  "use cache"
  return loadAllContent()
}

const strip = <T extends { body?: string; file?: string }>(l: T) => {
  const { body: _body, file: _file, ...rest } = l
  return rest
}

export type NavLesson = Omit<LessonSummary, "file">
export type NavModule = ContentBundle["module"] & {
  lessons: NavLesson[]
  problemCount: number
  interviewCount: number
}

export async function getNavTree(): Promise<NavModule[]> {
  const content = await getContent()
  return content.map(({ module, lessons, problems, interview }) => ({
    ...module,
    lessons: lessons.map(strip),
    problemCount: problems.length,
    interviewCount: interview.length,
  }))
}

export async function getModule(slug: string): Promise<NavModule | undefined> {
  return (await getNavTree()).find((m) => m.slug === slug)
}

export async function getLesson(moduleSlug: string, lessonSlug: string) {
  const content = await getContent()
  const flat = content.flatMap((b) => b.lessons.map((l) => ({ ...l, moduleTitle: b.module.title })))
  const index = flat.findIndex((l) => l.module === moduleSlug && l.slug === lessonSlug)
  if (index === -1) return undefined
  const link = (l: (typeof flat)[number] | undefined) =>
    l && { href: `/learn/${l.module}/${l.slug}`, title: l.title, moduleTitle: l.moduleTitle }
  const { file: _file, ...lesson } = flat[index]!
  return { lesson, prev: link(flat[index - 1]), next: link(flat[index + 1]) }
}

export type ProblemSummary = Pick<Problem, "id" | "title" | "difficulty" | "tags"> & {
  module: string
}
export type InterviewSummary = Pick<
  InterviewQuestion,
  "id" | "question" | "difficulty" | "tags" | "shortAnswer"
> & {
  module: string
}

export async function getProblems(moduleSlug: string): Promise<ProblemSummary[]> {
  const bundle = (await getContent()).find((b) => b.module.slug === moduleSlug)
  return (bundle?.problems ?? []).map(({ id, title, difficulty, tags }) => ({
    id,
    title,
    difficulty,
    tags,
    module: moduleSlug,
  }))
}

export async function getProblem(moduleSlug: string, id: string) {
  const bundle = (await getContent()).find((b) => b.module.slug === moduleSlug)
  const list = bundle?.problems ?? []
  const index = list.findIndex((p) => p.id === id)
  if (index === -1) return undefined
  const { verify: _verify, ...problem } = list[index]!
  const link = (p: Problem | undefined) =>
    p && { href: `/practice/${moduleSlug}/${p.id}`, title: p.title }
  return { problem, prev: link(list[index - 1]), next: link(list[index + 1]) }
}

export async function getInterviewQuestions(moduleSlug: string): Promise<InterviewSummary[]> {
  const bundle = (await getContent()).find((b) => b.module.slug === moduleSlug)
  return (bundle?.interview ?? []).map(({ id, question, difficulty, tags, shortAnswer }) => ({
    id,
    question,
    difficulty,
    tags,
    shortAnswer,
    module: moduleSlug,
  }))
}

export async function getInterviewQuestion(moduleSlug: string, id: string) {
  const bundle = (await getContent()).find((b) => b.module.slug === moduleSlug)
  const list = bundle?.interview ?? []
  const index = list.findIndex((q) => q.id === id)
  if (index === -1) return undefined
  const { verify: _verify, ...question } = list[index]!
  const link = (q: InterviewQuestion | undefined) =>
    q && { href: `/interview/${moduleSlug}/${q.id}`, title: q.question }
  return { question, prev: link(list[index - 1]), next: link(list[index + 1]) }
}

/** Static params helpers for generateStaticParams. */
export async function allLessonParams() {
  return (await getContent()).flatMap((b) =>
    b.lessons.map((l) => ({ module: b.module.slug, lesson: l.slug })),
  )
}
export async function allProblemParams() {
  return (await getContent()).flatMap((b) =>
    b.problems.map((p) => ({ module: b.module.slug, id: p.id })),
  )
}
export async function allInterviewParams() {
  return (await getContent()).flatMap((b) =>
    b.interview.map((q) => ({ module: b.module.slug, id: q.id })),
  )
}
