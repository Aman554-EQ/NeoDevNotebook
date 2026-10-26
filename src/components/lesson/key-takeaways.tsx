import { Target } from "lucide-react"

/** End-of-lesson summary box (soul.md lesson template §8). Pass a markdown list as children. */
export function KeyTakeaways({ children }: { children: React.ReactNode }) {
  return (
    <section
      aria-labelledby="key-takeaways"
      data-testid="key-takeaways"
      className="border-rule bg-accent-soft my-8 rounded-[var(--radius-card)] border px-5 py-4"
    >
      <h2
        id="key-takeaways"
        className="font-display !mt-0 flex items-center gap-2 !border-0 !p-0 !text-lg font-semibold"
      >
        <Target className="text-accent size-5" aria-hidden /> Key takeaways
      </h2>
      <div className="mt-2 [&_ul]:mt-0">{children}</div>
    </section>
  )
}
