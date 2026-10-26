import Link from "next/link"

export default function NotFound() {
  return (
    <main className="mx-auto max-w-xl px-4 py-24 text-center" data-testid="not-found">
      <p className="text-accent font-mono text-sm">404</p>
      <h1 className="font-display mt-2 text-3xl font-semibold">This page isn’t in the notebook</h1>
      <p className="text-muted mt-3">
        The link may be old, or the module hasn’t been written yet. Try search (Ctrl K) or start
        from the learning path.
      </p>
      <div className="mt-8 flex justify-center gap-3">
        <Link
          href="/"
          className="bg-accent text-accent-ink rounded-[var(--radius-control)] px-5 py-2.5 font-medium"
        >
          Go home
        </Link>
        <Link
          href="/learn"
          className="border-rule bg-surface rounded-[var(--radius-control)] border px-5 py-2.5 font-medium"
        >
          Browse modules
        </Link>
      </div>
    </main>
  )
}
