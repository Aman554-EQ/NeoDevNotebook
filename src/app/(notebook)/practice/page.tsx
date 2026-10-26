import type { Metadata } from "next"
import { ModuleCard } from "@/components/layout/module-card"
import { getNavTree } from "@/lib/content"

export const metadata: Metadata = { title: "Practice" }

export default async function PracticeHub() {
  const modules = (await getNavTree()).filter((m) => m.problemCount > 0)
  return (
    <main>
      <h1 className="font-display text-3xl font-semibold sm:text-4xl">Practice</h1>
      <p className="text-muted mt-2 max-w-2xl">
        Problems climb a four-step ladder: easy → simple → medium → hard. Try first, then use the
        hints, then compare with the solution and read the explanation under the code.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {modules.map((m) => (
          <ModuleCard
            key={m.slug}
            module={m}
            href={`/practice/${m.slug}`}
            stat={`${m.problemCount} problems`}
          />
        ))}
      </div>
    </main>
  )
}
