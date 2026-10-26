/**
 * Placeholder for URL-specific page content. Pages are fully prerendered, so this is only seen
 * for a moment during a client navigation while the route's static output streams in.
 */
export function PageSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading"
      className="animate-pulse"
      data-testid="page-skeleton"
    >
      <div className="bg-surface-2 h-4 w-48 rounded" />
      <div className="bg-surface-2 mt-6 h-9 w-3/4 max-w-xl rounded" />
      <div className="bg-surface-2 mt-4 h-4 w-full max-w-2xl rounded" />
      <div className="bg-surface-2 mt-2 h-4 w-5/6 max-w-2xl rounded" />
      <div className="bg-surface-2 mt-10 h-40 w-full max-w-3xl rounded-[var(--radius-card)]" />
    </div>
  )
}
