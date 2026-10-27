import { cn } from "@/lib/utils"

/** Pre-highlighted (Shiki) code inside a visual. Scrolls sideways itself, never the page. */
export function CodeHtml({
  html,
  label,
  className,
}: {
  html: string
  label: string
  className?: string
}) {
  return (
    <div
      tabIndex={0}
      role="region"
      aria-label={label}
      className={cn(
        "bg-code-bg border-rule overflow-x-auto rounded-md border py-2 font-mono text-xs leading-relaxed sm:text-[0.8rem] [&_.line]:px-3 [&_pre]:min-w-max",
        className,
      )}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}

const METHOD_TONE: Record<string, string> = {
  GET: "bg-easy-soft text-easy",
  POST: "bg-accent-soft text-accent",
  PUT: "bg-medium-soft text-medium",
  PATCH: "bg-medium-soft text-medium",
  DELETE: "bg-hard-soft text-hard",
}

export function MethodPill({ method }: { method: string }) {
  return (
    <span
      className={cn(
        "rounded px-1.5 py-0.5 font-mono text-xs font-bold",
        METHOD_TONE[method] ?? "bg-surface-2 text-muted",
      )}
    >
      {method}
    </span>
  )
}

export function statusTone(status: number) {
  if (status < 300) return "bg-easy-soft text-easy"
  if (status < 400) return "bg-simple-soft text-simple"
  if (status < 500) return "bg-medium-soft text-medium"
  return "bg-hard-soft text-hard"
}

export function HeaderList({ headers, empty }: { headers: Record<string, string>; empty: string }) {
  const entries = Object.entries(headers)
  if (!entries.length) return <p className="text-muted text-xs italic">{empty}</p>
  return (
    <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-0.5 font-mono text-xs">
      {entries.map(([k, v]) => (
        <div key={k} className="contents">
          <dt className="text-muted">{k}</dt>
          <dd className="break-all">{v}</dd>
        </div>
      ))}
    </dl>
  )
}
