import { FlaskConical } from "lucide-react"
import { CodeBlock } from "@/components/lesson/code-block"
import type { ItemKey } from "@/lib/progress/store"
import { CheckpointToggle } from "./checkpoint-toggle"

/**
 * End of a milestone: the command that proves it works (usually a test file of the real project),
 * and a toggle the learner flips once it passes on their machine. Progress stays in the browser.
 */
export function Checkpoint({
  itemKey,
  command,
  children,
}: {
  itemKey: ItemKey
  command: string
  children?: React.ReactNode
}) {
  return (
    <section
      data-testid="checkpoint"
      aria-label="Checkpoint"
      className="not-prose border-easy/40 bg-easy-soft/40 my-6 rounded-[var(--radius-card)] border px-4 py-3"
    >
      <p className="text-easy flex items-center gap-2 font-semibold">
        <FlaskConical className="size-4" aria-hidden /> Checkpoint
      </p>
      {children && <div className="mt-1 text-sm">{children}</div>}
      <CodeBlock code={command} language="bash" />
      <CheckpointToggle itemKey={itemKey} />
    </section>
  )
}
