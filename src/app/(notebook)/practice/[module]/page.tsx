import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { Breadcrumbs } from "@/components/layout/breadcrumbs"
import { ItemBrowser } from "@/components/problem/item-browser"
import { getModule, getNavTree, getProblems } from "@/lib/content"

export const ensureStatic = "navigation"

export async function generateStaticParams() {
  return (await getNavTree()).filter((m) => m.problemCount > 0).map((m) => ({ module: m.slug }))
}

export async function generateMetadata({
  params,
}: PageProps<"/practice/[module]">): Promise<Metadata> {
  const m = await getModule((await params).module)
  return { title: m ? `${m.title} practice` : undefined }
}

export default async function ProblemListPage({ params }: PageProps<"/practice/[module]">) {
  const { module } = await params
  const m = await getModule(module)
  if (!m || !m.problemCount) notFound()
  const problems = await getProblems(module)
  return (
    <main>
      <Breadcrumbs items={[{ href: "/practice", label: "Practice" }, { label: m.title }]} />
      <h1 className="font-display text-3xl font-semibold sm:text-4xl">
        {m.title}: practice problems
      </h1>
      <p className="text-muted mt-2 mb-6 max-w-2xl">
        {problems.length} problems. Filter by difficulty, tag or status — the filters are kept in
        the URL so you can bookmark a view.
      </p>
      <ItemBrowser
        doneLabel="Solved"
        items={problems.map((p) => ({
          key: `problem:${p.id}`,
          id: p.id,
          title: p.title,
          difficulty: p.difficulty,
          tags: p.tags,
          href: `/practice/${module}/${p.id}`,
        }))}
      />
    </main>
  )
}
