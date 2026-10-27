import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { Breadcrumbs } from "@/components/layout/breadcrumbs"
import { ProjectCard } from "@/components/project/project-card"
import { getModule, getNavTree } from "@/lib/content"

export const ensureStatic = "navigation"
// Fully prerendered, so the complete page is in the first paint. Opting out of instant-navigation
// validation avoids a Suspense skeleton that would flash (and shift the layout) on every page load.
export const instant = false

export async function generateStaticParams() {
  return (await getNavTree()).filter((m) => m.projects.length).map((m) => ({ module: m.slug }))
}

export async function generateMetadata({
  params,
}: PageProps<"/projects/[module]">): Promise<Metadata> {
  const m = await getModule((await params).module)
  return { title: m ? `${m.title} projects` : undefined }
}

export default async function ModuleProjectsPage({ params }: PageProps<"/projects/[module]">) {
  const m = await getModule((await params).module)
  if (!m || !m.projects.length) notFound()
  return (
    <main>
      <Breadcrumbs items={[{ href: "/projects", label: "Projects" }, { label: m.title }]} />
      <h1 className="font-display text-3xl font-semibold sm:text-4xl">{m.title}: projects</h1>
      <p className="text-muted mt-2 mb-8 max-w-2xl">
        {m.projects.length} projects, from a first small app to a production-shaped capstone. Do
        them in order: each one adds the ideas of the lessons before it.
      </p>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {m.projects.map((p) => (
          <ProjectCard key={p.slug} project={p} />
        ))}
      </div>
    </main>
  )
}
