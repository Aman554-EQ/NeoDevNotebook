import type { Metadata } from "next"
import { ModuleCard } from "@/components/layout/module-card"
import { getNavTree } from "@/lib/content"

export const metadata: Metadata = { title: "Learn" }

export default async function LearnHub() {
  const modules = await getNavTree()
  return (
    <main>
      <h1 className="font-display text-3xl font-semibold sm:text-4xl">Learn</h1>
      <p className="text-muted mt-2 max-w-2xl">
        Pick a module. Each lesson goes concept → visual → example → explanation → practice.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {modules.map((m) => (
          <ModuleCard
            key={m.slug}
            module={m}
            href={`/learn/${m.slug}`}
            stat={`${m.lessons.length} lesson${m.lessons.length === 1 ? "" : "s"}`}
          />
        ))}
      </div>
    </main>
  )
}
