import type { Metadata } from "next"
import { ProjectCard } from "@/components/project/project-card"
import { getNavTree } from "@/lib/content"
import { HubBackdrop } from "@/components/brand/hub-backdrop"

export const metadata: Metadata = { title: "Projects" }

export default async function ProjectsHub() {
  const modules = (await getNavTree()).filter((m) => m.projects.length > 0)
  return (
    <main className="relative isolate">
      <HubBackdrop />
      <h1 className="font-display text-3xl font-semibold sm:text-4xl">Projects</h1>
      <p className="text-muted mt-2 max-w-2xl">
        Build real applications step by step: read the brief, try each milestone yourself, use the
        hints, then compare with the solution. Every solution is the code of a working project whose
        tests pass, so you can run it on your own machine.
      </p>
      {modules.map((m) => (
        <section key={m.slug} aria-labelledby={`projects-${m.slug}`} className="mt-10">
          <h2 id={`projects-${m.slug}`} className="font-display mb-4 text-xl font-semibold">
            {m.title}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {m.projects.map((p) => (
              <ProjectCard key={p.slug} project={p} />
            ))}
          </div>
        </section>
      ))}
    </main>
  )
}
