"use client"

import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { Suspense, useMemo, useState } from "react"
import { CircleCheck, Search } from "lucide-react"
import { DifficultyBadge, TagChip } from "@/components/lesson/badges"
import { InlineCode } from "@/components/lesson/inline-code"
import { DIFFICULTIES, type Difficulty } from "@/lib/content/difficulty"
import { useProgress, type ItemKey } from "@/lib/progress/store"
import { cn } from "@/lib/utils"

export type BrowserItem = {
  key: ItemKey
  id: string
  title: string
  difficulty: Difficulty
  tags: string[]
  href: string
  /** Shown when the row is expanded (interview questions). */
  preview?: string
}

export type Filters = {
  q: string
  difficulty: Difficulty[]
  tag: string | null
  status: "all" | "todo" | "done"
}

export function parseFilters(params: URLSearchParams): Filters {
  const difficulty = (params.get("difficulty") ?? "")
    .split(",")
    .filter((d): d is Difficulty => (DIFFICULTIES as readonly string[]).includes(d))
  const status = params.get("status")
  return {
    q: params.get("q") ?? "",
    difficulty,
    tag: params.get("tag"),
    status: status === "todo" || status === "done" ? status : "all",
  }
}

export function applyFilters(items: BrowserItem[], f: Filters, isDone: (k: ItemKey) => boolean) {
  const q = f.q.trim().toLowerCase()
  return items.filter(
    (i) =>
      (!q || i.title.toLowerCase().includes(q) || i.id.includes(q)) &&
      (!f.difficulty.length || f.difficulty.includes(i.difficulty)) &&
      (!f.tag || i.tags.includes(f.tag)) &&
      (f.status === "all" || (f.status === "done") === isDone(i.key)),
  )
}

/**
 * Filterable list. Filters live in the URL (?difficulty=easy,hard&tag=lists&q=…&status=todo),
 * so a filtered view can be shared and survives reloads. Before hydration the full list renders.
 */
export function ItemBrowser(props: { items: BrowserItem[]; doneLabel: string }) {
  return (
    <Suspense fallback={<ItemList items={props.items} />}>
      <FilteredBrowser {...props} />
    </Suspense>
  )
}

const TOP_TAGS = 10

function FilteredBrowser({ items, doneLabel }: { items: BrowserItem[]; doneLabel: string }) {
  const params = useSearchParams()
  const pathname = usePathname()
  const { isDone } = useProgress()
  const filters = parseFilters(new URLSearchParams(params.toString()))
  const visible = applyFilters(items, filters, isDone)
  // Most-used tags first (ties alphabetical). Long lists are collapsed so the results stay in view.
  const allTags = useMemo(() => {
    const counts = new Map<string, number>()
    for (const t of items.flatMap((i) => i.tags)) counts.set(t, (counts.get(t) ?? 0) + 1)
    return [...counts].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).map(([t]) => t)
  }, [items])
  const [showAllTags, setShowAllTags] = useState(false)
  const shownTags =
    showAllTags || allTags.length <= TOP_TAGS
      ? allTags
      : [
          ...allTags.slice(0, TOP_TAGS),
          ...(filters.tag && !allTags.slice(0, TOP_TAGS).includes(filters.tag)
            ? [filters.tag]
            : []),
        ]

  function update(patch: Partial<Filters>) {
    // Read the live URL, not the rendered params: two quick clicks must not lose the first change.
    const next = { ...parseFilters(new URLSearchParams(window.location.search)), ...patch }
    const sp = new URLSearchParams()
    if (next.q) sp.set("q", next.q)
    if (next.difficulty.length) sp.set("difficulty", next.difficulty.join(","))
    if (next.tag) sp.set("tag", next.tag)
    if (next.status !== "all") sp.set("status", next.status)
    const qs = sp.toString()
    // Native replaceState updates the URL synchronously and Next syncs useSearchParams (no server round-trip).
    window.history.replaceState(null, "", qs ? `${pathname}?${qs}` : pathname)
  }

  const chip = (active: boolean) =>
    cn(
      "rounded-full border px-3 py-1 text-sm font-medium",
      active
        ? "border-accent bg-accent-soft text-accent"
        : "border-rule bg-surface text-muted hover:text-ink",
    )

  return (
    <div>
      <div
        className="border-rule bg-surface space-y-3 rounded-[var(--radius-card)] border p-4"
        role="search"
      >
        <label className="border-rule bg-bg flex items-center gap-2 rounded-[var(--radius-control)] border px-3">
          <Search className="text-muted size-4" aria-hidden />
          <span className="sr-only">Filter by title</span>
          <input
            value={filters.q}
            onChange={(e) => update({ q: e.target.value })}
            placeholder="Filter by title or id…"
            className="placeholder:text-muted h-10 flex-1 bg-transparent outline-none"
            data-testid="filter-q"
          />
        </label>
        <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Difficulty">
          <span className="text-muted w-20 text-sm">Difficulty</span>
          {DIFFICULTIES.map((d) => {
            const on = filters.difficulty.includes(d)
            return (
              <button
                key={d}
                type="button"
                aria-pressed={on}
                data-testid={`filter-difficulty-${d}`}
                onClick={() =>
                  update({
                    difficulty: on
                      ? filters.difficulty.filter((x) => x !== d)
                      : [...filters.difficulty, d],
                  })
                }
                className={cn(chip(on), "capitalize")}
              >
                {d}
              </button>
            )
          })}
        </div>
        <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Status">
          <span className="text-muted w-20 text-sm">Status</span>
          {(["all", "todo", "done"] as const).map((s) => (
            <button
              key={s}
              type="button"
              aria-pressed={filters.status === s}
              onClick={() => update({ status: s })}
              className={chip(filters.status === s)}
            >
              {s === "all" ? "All" : s === "todo" ? "To do" : doneLabel}
            </button>
          ))}
        </div>
        {allTags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Tag">
            <span className="text-muted w-20 text-sm">Tag</span>
            {shownTags.map((t) => (
              <button
                key={t}
                type="button"
                aria-pressed={filters.tag === t}
                data-testid={`filter-tag-${t}`}
                onClick={() => update({ tag: filters.tag === t ? null : t })}
                className={cn(chip(filters.tag === t), "font-mono text-xs")}
              >
                #{t}
              </button>
            ))}
            {allTags.length > TOP_TAGS && (
              <button
                type="button"
                onClick={() => setShowAllTags((v) => !v)}
                aria-expanded={showAllTags}
                data-testid="toggle-all-tags"
                className="text-accent text-sm font-medium underline-offset-2 hover:underline"
              >
                {showAllTags ? "Fewer tags" : `All ${allTags.length} tags`}
              </button>
            )}
          </div>
        )}
      </div>
      <p className="text-muted mt-4 text-sm" aria-live="polite" data-testid="result-count">
        Showing {visible.length} of {items.length}
      </p>
      <ItemList items={visible} isDone={isDone} />
    </div>
  )
}

function ItemList({ items, isDone }: { items: BrowserItem[]; isDone?: (k: ItemKey) => boolean }) {
  if (!items.length) {
    return <p className="text-muted mt-6">Nothing matches these filters.</p>
  }
  return (
    <ul className="mt-3 space-y-2" data-testid="item-list">
      {items.map((i) => (
        <li
          key={i.id}
          className="border-rule bg-surface rounded-[var(--radius-card)] border"
          data-testid="item-row"
        >
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 p-4">
            <span className="text-muted font-mono text-xs">{i.id}</span>
            <Link
              href={i.href}
              className="hover:text-accent min-w-0 flex-1 font-medium hover:underline"
            >
              <InlineCode text={i.title} />
            </Link>
            {isDone?.(i.key) && <CircleCheck className="text-easy size-4" aria-label="done" />}
            <DifficultyBadge level={i.difficulty} />
            <span className="flex w-full flex-wrap gap-1 sm:w-auto">
              {i.tags.map((t) => (
                <TagChip key={t} tag={t} />
              ))}
            </span>
          </div>
          {i.preview && (
            <details className="group border-rule border-t">
              <summary className="text-muted hover:text-ink cursor-pointer px-4 py-2 text-sm">
                Quick answer
              </summary>
              <p className="px-4 pb-4 text-[0.95rem]">
                {i.preview}{" "}
                <Link href={i.href} className="text-accent underline">
                  Full answer →
                </Link>
              </p>
            </details>
          )}
        </li>
      ))}
    </ul>
  )
}
