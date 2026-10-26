import { Lightbulb, Sigma, Sparkles, TriangleAlert } from "lucide-react"
import { cn } from "@/lib/utils"

const VARIANTS = {
  tip: { icon: Lightbulb, label: "Tip", color: "text-tip", border: "border-l-tip" },
  warning: {
    icon: TriangleAlert,
    label: "Watch out",
    color: "text-warning",
    border: "border-l-warning",
  },
  intuition: {
    icon: Sparkles,
    label: "Intuition",
    color: "text-intuition",
    border: "border-l-intuition",
  },
  math: { icon: Sigma, label: "The math", color: "text-math", border: "border-l-math" },
} as const

export type CalloutType = keyof typeof VARIANTS

export function Callout({
  type = "tip",
  title,
  children,
}: {
  type?: CalloutType
  title?: string
  children: React.ReactNode
}) {
  const v = VARIANTS[type]
  const Icon = v.icon
  return (
    <aside
      data-testid={`callout-${type}`}
      className={cn(
        "border-rule bg-surface my-6 rounded-r-[var(--radius-card)] border border-l-4 px-5 py-4",
        v.border,
      )}
    >
      <p className={cn("flex items-center gap-2 font-semibold", v.color)}>
        <Icon className="size-4" aria-hidden />
        {title ?? v.label}
      </p>
      <div className="mt-2 space-y-3 [&_p]:m-0">{children}</div>
    </aside>
  )
}
