import type { Metadata } from "next"
import { ModuleCard } from "@/components/layout/module-card"
import { getNavTree } from "@/lib/content"
import { HubBackdrop } from "@/components/brand/hub-backdrop"

export const metadata: Metadata = { title: "Interview" }

export default async function InterviewHub() {
  const modules = (await getNavTree()).filter((m) => m.interviewCount > 0)
  return (
    <main className="relative isolate">
      <HubBackdrop />
      <h1 className="font-display text-3xl font-semibold sm:text-4xl">Interview questions</h1>
      <p className="text-muted mt-2 max-w-2xl">
        Each question has a short answer you can say aloud, a detailed answer, code where it helps,
        the pitfalls interviewers listen for, and likely follow-ups.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {modules.map((m) => (
          <ModuleCard
            key={m.slug}
            module={m}
            href={`/interview/${m.slug}`}
            stat={`${m.interviewCount} questions`}
          />
        ))}
      </div>
    </main>
  )
}
