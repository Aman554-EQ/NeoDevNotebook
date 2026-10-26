import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"

type Target = { href: string; title: string; moduleTitle?: string } | undefined

export function PrevNext({ prev, next }: { prev: Target; next: Target }) {
  if (!prev && !next) return null
  return (
    <nav
      aria-label="Previous and next"
      className="border-rule mt-14 grid gap-3 border-t pt-6 sm:grid-cols-2"
    >
      {prev ? (
        <Link
          href={prev.href}
          rel="prev"
          data-testid="prev-link"
          className="group border-rule bg-surface hover:border-accent rounded-[var(--radius-card)] border p-4"
        >
          <span className="text-muted flex items-center gap-1 text-sm">
            <ChevronLeft className="size-4" aria-hidden /> Previous
          </span>
          <span className="group-hover:text-accent mt-1 block font-medium">{prev.title}</span>
        </Link>
      ) : (
        <span className="hidden sm:block" />
      )}
      {next && (
        <Link
          href={next.href}
          rel="next"
          prefetch
          data-testid="next-link"
          className="group border-rule bg-surface hover:border-accent rounded-[var(--radius-card)] border p-4 text-right"
        >
          <span className="text-muted flex items-center justify-end gap-1 text-sm">
            Next <ChevronRight className="size-4" aria-hidden />
          </span>
          <span className="group-hover:text-accent mt-1 block font-medium">{next.title}</span>
          {next.moduleTitle && <span className="text-muted block text-xs">{next.moduleTitle}</span>}
        </Link>
      )}
    </nav>
  )
}
