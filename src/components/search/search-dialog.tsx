"use client"

import { useRouter } from "next/navigation"
import { useEffect, useId, useState } from "react"
import { Dialog } from "radix-ui"
import { Search } from "lucide-react"
import type { SearchHit } from "@/lib/search/query"
import { cn } from "@/lib/utils"

/** The latest finished response, tagged with the query it answers. */
type Result = { query: string; hits: SearchHit[] } | { query: string; error: string }

type State =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "done"; hits: SearchHit[] }
  | { status: "error"; message: string }

function deriveState(q: string, result: Result | undefined): State {
  if (q.length < 2) return { status: "idle" }
  if (!result || result.query !== q) return { status: "loading" }
  return "error" in result
    ? { status: "error", message: result.error }
    : { status: "done", hits: result.hits }
}

const TYPE_LABEL: Record<SearchHit["type"], string> = {
  lesson: "Lesson",
  problem: "Problem",
  interview: "Interview",
}

/** Renders ts_headline output safely: only the <b> markers become <mark>, everything else is text. */
export function Snippet({ text }: { text: string }) {
  const parts = text.split(/<\/?b>/)
  return (
    <>
      {parts.map((p, i) =>
        i % 2 === 1 ? (
          <mark key={i} className="bg-highlight text-ink">
            {p}
          </mark>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </>
  )
}

export function SearchDialog() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [result, setResult] = useState<Result>()
  const [active, setActive] = useState(0)
  const router = useRouter()
  const listId = useId()

  // Ctrl/⌘ K opens search from anywhere.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        setOpen((o) => !o)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  // Debounced fetch. A response only shows while its query is still the current one.
  const q = query.trim()
  useEffect(() => {
    if (q.length < 2) return
    const controller = new AbortController()
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`, {
          signal: controller.signal,
        })
        const body = (await res.json()) as { hits?: SearchHit[]; error?: string }
        setActive(0)
        setResult(
          res.ok
            ? { query: q, hits: body.hits ?? [] }
            : { query: q, error: body.error ?? "Search failed" },
        )
      } catch (err) {
        if (!controller.signal.aborted) setResult({ query: q, error: (err as Error).message })
      }
    }, 150)
    return () => {
      clearTimeout(t)
      controller.abort()
    }
  }, [q])

  const state = deriveState(q, result)
  const hits = state.status === "done" ? state.hits : []

  function go(hit: SearchHit) {
    setOpen(false)
    setQuery("")
    router.push(hit.href)
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (!hits.length) return
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setActive((a) => (a + 1) % hits.length)
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setActive((a) => (a - 1 + hits.length) % hits.length)
    } else if (e.key === "Enter") {
      e.preventDefault()
      const hit = hits[active]
      if (hit) go(hit)
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger
        data-testid="search-trigger"
        className="border-rule bg-surface text-muted hover:text-ink inline-flex h-10 items-center gap-2 rounded-[var(--radius-control)] border px-3 text-sm"
      >
        <Search className="size-4" aria-hidden />
        <span className="hidden sm:inline">Search</span>
        <kbd className="border-rule bg-surface-2 hidden rounded border px-1.5 font-mono text-xs sm:inline">
          Ctrl K
        </kbd>
        <span className="sr-only sm:hidden">Search</span>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/40" />
        <Dialog.Content
          data-testid="search-dialog"
          className="border-rule bg-surface fixed top-[10vh] left-1/2 z-50 w-[min(40rem,calc(100vw-2rem))] -translate-x-1/2 overflow-hidden rounded-[var(--radius-card)] border shadow-2xl"
        >
          <Dialog.Title className="sr-only">Search the notebook</Dialog.Title>
          <Dialog.Description className="sr-only">
            Type to search lessons, problems and interview questions. Use arrow keys and Enter.
          </Dialog.Description>
          {/* Focus shows as an accent underline inside the panel (an outline would be clipped). */}
          <div className="border-rule focus-within:border-accent flex items-center gap-3 border-b-2 px-4">
            <Search className="text-muted size-5" aria-hidden />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Search lessons, problems, interview questions…"
              aria-label="Search"
              role="combobox"
              aria-expanded={hits.length > 0}
              aria-controls={listId}
              aria-activedescendant={hits.length ? `${listId}-${active}` : undefined}
              className="search-input placeholder:text-muted h-14 min-w-0 flex-1 bg-transparent text-base"
            />
          </div>
          <div className="max-h-[60vh] overflow-y-auto p-2" aria-live="polite">
            {state.status === "idle" && (
              <p className="text-muted px-3 py-6 text-center text-sm">
                Type at least 2 characters.
              </p>
            )}
            {state.status === "loading" && (
              <p className="text-muted px-3 py-6 text-center text-sm">Searching…</p>
            )}
            {state.status === "error" && (
              <p className="text-hard px-3 py-6 text-center text-sm">
                Search is unavailable right now ({state.message}).
              </p>
            )}
            {state.status === "done" && !hits.length && (
              <p className="text-muted px-3 py-6 text-center text-sm">No results for “{q}”.</p>
            )}
            {hits.length > 0 && (
              <ul id={listId} role="listbox" aria-label="Search results">
                {hits.map((h, i) => (
                  <li
                    key={h.href}
                    id={`${listId}-${i}`}
                    role="option"
                    aria-selected={i === active}
                    onMouseEnter={() => setActive(i)}
                    onClick={() => go(h)}
                    className={cn(
                      "cursor-pointer rounded-[var(--radius-control)] px-3 py-2.5",
                      i === active && "bg-accent-soft",
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <span className="bg-surface-2 text-muted rounded px-1.5 py-0.5 text-xs font-medium">
                        {TYPE_LABEL[h.type]}
                      </span>
                      <span className="font-medium" data-testid="search-hit-title">
                        {h.title}
                      </span>
                    </div>
                    <p className="text-muted mt-1 line-clamp-2 text-sm">
                      <Snippet text={h.snippet} />
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
