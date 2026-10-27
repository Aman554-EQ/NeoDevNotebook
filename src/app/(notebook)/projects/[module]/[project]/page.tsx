import fs from "node:fs"
import path from "node:path"
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { Download, Hammer, Trophy } from "lucide-react"
import { Breadcrumbs } from "@/components/layout/breadcrumbs"
import { PrevNext } from "@/components/layout/prev-next"
import { ReadingAids } from "@/components/layout/reading-aids"
import { Toc } from "@/components/layout/toc"
import { DifficultyBadge } from "@/components/lesson/badges"
import { BookmarkButton, DoneToggle } from "@/components/progress/progress-buttons"
import { allProjectParams, getProject } from "@/lib/content"
import { moduleComponents } from "@/lib/mdx/module-components"
import { renderMdx } from "@/lib/mdx/render"

export const ensureStatic = "navigation"
// Fully prerendered, so the complete page is in the first paint. Opting out of instant-navigation
// validation avoids a Suspense skeleton that would flash (and shift the layout) on every page load.
export const instant = false

export async function generateStaticParams() {
  return allProjectParams()
}

export async function generateMetadata({
  params,
}: PageProps<"/projects/[module]/[project]">): Promise<Metadata> {
  const { module, project } = await params
  const data = await getProject(module, project)
  return { title: data?.project.title, description: data?.project.summary }
}

/** public/postman/<module>-<code>.postman_collection.json, made by `pnpm gen:postman`. */
function postmanHref(module: string, code: string) {
  const name = `${module}-${code}.postman_collection.json`
  const file = path.join(process.cwd(), "public", "postman", name)
  return fs.existsSync(/*turbopackIgnore: true*/ file) ? `/postman/${name}` : undefined
}

export default async function ProjectPage({ params }: PageProps<"/projects/[module]/[project]">) {
  const { module, project: slug } = await params
  const data = await getProject(module, slug)
  if (!data) notFound()
  const { project, moduleTitle, prev, next } = data
  const { content, toc } = await renderMdx(project.body, {
    components: moduleComponents(module, project.code),
  })
  const href = `/projects/${module}/${slug}`
  const postman = postmanHref(module, project.code)
  const capstone = project.kind === "capstone"
  const Icon = capstone ? Trophy : Hammer

  return (
    <div className="xl:grid xl:grid-cols-[minmax(0,1fr)_14rem] xl:gap-10">
      <main className="min-w-0">
        <Breadcrumbs
          items={[
            { href: "/projects", label: "Projects" },
            { href: `/projects/${module}`, label: moduleTitle },
            { label: project.title },
          ]}
        />
        <article>
          <header className="mb-8">
            <p className="text-muted flex items-center gap-2 text-sm font-semibold tracking-wide uppercase">
              <Icon className="text-accent size-4" aria-hidden />
              {capstone ? "Capstone project" : `Guided project ${project.order}`}
            </p>
            <h1 className="font-display mt-2 text-3xl font-semibold sm:text-4xl">
              {project.title}
            </h1>
            <p className="text-muted mt-3 max-w-2xl text-lg">{project.summary}</p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <DifficultyBadge level={project.difficulty} />
              <span className="text-muted text-sm">~{project.estimatedHours} hours</span>
              {postman && (
                <a
                  href={postman}
                  download
                  data-testid="postman-download"
                  className="border-rule bg-surface hover:border-accent inline-flex items-center gap-2 rounded-[var(--radius-control)] border px-3 py-1.5 text-sm font-medium"
                >
                  <Download className="size-4" aria-hidden /> Postman collection
                </a>
              )}
            </div>
            <ul className="mt-4 flex flex-wrap gap-2" aria-label="Skills you practise">
              {project.skills.map((s) => (
                <li
                  key={s}
                  className="border-rule text-muted rounded-full border px-2.5 py-0.5 text-xs"
                >
                  {s}
                </li>
              ))}
            </ul>
          </header>
          <div className="prose-notebook" data-testid="project-body">
            {content}
          </div>
        </article>
        <div className="mt-10 flex flex-wrap gap-2">
          <DoneToggle itemKey={`project:${module}/${slug}`} />
          <BookmarkButton itemKey={`project:${module}/${slug}`} title={project.title} href={href} />
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
