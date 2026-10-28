import { cn, SITE_NAME } from "@/lib/utils"

/**
 * The NeoDevNotebook mark: a notebook page (binder holes on the left) with an "N" drawn as a
 * small graph, nodes at its corners. Same geometry as src/app/icon.svg.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden className={cn("shrink-0", className)}>
      <rect x="1" y="1" width="30" height="30" rx="8" className="fill-accent" />
      <g className="fill-accent-ink" opacity="0.55">
        <circle cx="6.5" cy="10" r="1.4" />
        <circle cx="6.5" cy="16" r="1.4" />
        <circle cx="6.5" cy="22" r="1.4" />
      </g>
      <path
        d="M12 22.5V9.5l10 13V9.5"
        fill="none"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="stroke-accent-ink"
      />
      <g className="fill-accent-ink">
        <circle cx="12" cy="9.5" r="2.4" />
        <circle cx="22" cy="22.5" r="2.4" />
        <circle cx="12" cy="22.5" r="1.7" />
        <circle cx="22" cy="9.5" r="1.7" />
      </g>
    </svg>
  )
}

/** Mark + wordmark ("Neo" in the accent colour). */
export function Logo({ className, compact }: { className?: string; compact?: boolean }) {
  return (
    <span
      className={cn("font-display flex items-center gap-2 font-semibold tracking-tight", className)}
    >
      <LogoMark className="size-8" />
      <span className={cn(compact && "max-[380px]:sr-only")}>
        <span className="text-accent">Neo</span>
        {SITE_NAME.slice(3)}
      </span>
    </span>
  )
}
