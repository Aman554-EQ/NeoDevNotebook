/** Lesson grouping by the optional `section` front-matter field. Zod-free so client components can use it. */

export type SectionGroup<T> = { section: string | null; items: T[] }

/** Groups consecutive lessons (already in order) by section. Lessons without a section form unnamed groups. */
export function groupBySection<T extends { section?: string }>(lessons: T[]): SectionGroup<T>[] {
  const groups: SectionGroup<T>[] = []
  for (const lesson of lessons) {
    const section = lesson.section ?? null
    const last = groups.at(-1)
    if (last && last.section === section) last.items.push(lesson)
    else groups.push({ section, items: [lesson] })
  }
  return groups
}

/** A section must be one contiguous run of lessons; returns sections that are split apart. */
export function splitSections<T extends { section?: string }>(lessons: T[]): string[] {
  const seen = new Set<string>()
  const split = new Set<string>()
  for (const g of groupBySection(lessons)) {
    if (g.section === null) continue
    if (seen.has(g.section)) split.add(g.section)
    seen.add(g.section)
  }
  return [...split]
}

export const sectionId = (moduleSlug: string, section: string) =>
  `${moduleSlug}-${section
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")}`
