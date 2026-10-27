import Link from "next/link"
import { Hammer, Trophy } from "lucide-react"
import { DifficultyBadge } from "@/components/lesson/badges"
import type { ProjectSummary } from "@/lib/content"

export function ProjectCard({ project }: { project: ProjectSummary }) {
  const capstone = project.kind === "capstone"
  const Icon = capstone ? Trophy : Hammer
  return (
    <Link
      href={`/projects/${project.module}/${project.slug}`}
      data-testid="project-card"
      className="group border-rule bg-surface hover:border-accent flex h-full flex-col gap-2 rounded-[var(--radius-card)] border p-4"
    >
      <span className="text-muted flex items-center gap-2 text-xs font-semibold tracking-wide uppercase">
        <Icon className="text-accent size-4" aria-hidden />
        {capstone ? "Capstone project" : `Guided project ${project.order}`}
      </span>
      <span className="font-display group-hover:text-accent text-lg font-semibold">
        {project.title}
      </span>
      <span className="text-muted text-[0.95rem]">{project.summary}</span>
      <span className="mt-auto flex flex-wrap items-center gap-3 pt-2">
        <DifficultyBadge level={project.difficulty} />
        <span className="text-muted text-sm">~{project.estimatedHours} h</span>
      </span>
    </Link>
  )
}
