import Link from "next/link"
import type { NavModule } from "@/lib/content"
import { ModuleIcon } from "./module-icon"

/** Module summary card used on the Learn / Practice / Interview hubs. */
export function ModuleCard({
  module: m,
  href,
  stat,
}: {
  module: NavModule
  href: string
  stat: string
}) {
  return (
    <Link
      href={href}
      className="group border-rule bg-surface hover:border-accent flex flex-col rounded-[var(--radius-card)] border p-5"
    >
      <span className="font-display group-hover:text-accent flex items-center gap-3 text-xl font-semibold">
        <ModuleIcon icon={m.icon} className="text-accent size-7" />
        {m.title}
      </span>
      <span className="text-muted mt-2 flex-1 text-[0.95rem]">{m.description}</span>
      <span className="mt-4 text-sm font-medium">{stat}</span>
    </Link>
  )
}
