import { ChevronRight, Eye } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * Hidden-by-default hint/solution. Built on <details>, so it needs no JavaScript,
 * works with keyboard and screen readers, and is searchable with Ctrl+F when open.
 */
export function Reveal({
  label,
  kind = "solution",
  children,
}: {
  label: string
  kind?: "hint" | "solution"
  children: React.ReactNode
}) {
  return (
    <details
      data-testid={`reveal-${kind}`}
      className={cn(
        "group border-rule bg-surface my-4 rounded-[var(--radius-card)] border",
        kind === "solution" && "border-accent/40",
      )}
    >
      <summary className="hover:bg-surface-2 flex cursor-pointer list-none items-center gap-2 px-4 py-3 font-medium select-none [&::-webkit-details-marker]:hidden">
        <ChevronRight className="size-4 transition-transform group-open:rotate-90" aria-hidden />
        {kind === "solution" && <Eye className="text-accent size-4" aria-hidden />}
        {/* Long labels (inline code without spaces) wrap instead of widening the page. */}
        <span className="min-w-0 [overflow-wrap:anywhere]">{label}</span>
      </summary>
      <div className="border-rule border-t px-4 py-3">{children}</div>
    </details>
  )
}
