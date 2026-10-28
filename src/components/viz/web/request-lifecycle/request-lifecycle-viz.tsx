"use client"

import dynamic from "next/dynamic"
import { cn } from "@/lib/utils"
import { VizFrame, useViz } from "../../_shared/viz-frame"
import { STACKS, lifecycleFrames, type Framework, type Variant } from "./model"

const Scene3D = dynamic(() => import("./scene-3d"), {
  ssr: false,
  loading: () => <div className="bg-surface-2 h-64 animate-pulse sm:h-72" />,
})

const TITLES: Record<Framework, string> = {
  django: "A request's trip through Django",
  fastapi: "A request's trip through FastAPI",
  flask: "A request's trip through Flask",
}

/** Flat version for reduced motion and devices without WebGL: the same layers as a list. */
function Fallback({ framework, variant }: { framework: Framework; variant: Variant }) {
  const { step } = useViz()
  const f = lifecycleFrames(framework, variant)[step]!
  return (
    <div className="space-y-3 px-4 py-5" data-testid="lifecycle-fallback">
      <p className="text-center">
        <code className="bg-surface-2 rounded-md px-3 py-1 font-mono text-sm">
          {f.direction === "in" ? "→" : "←"} {f.packet}
        </code>
      </p>
      <ol className="mx-auto grid max-w-3xl gap-1.5 sm:grid-cols-7">
        {STACKS[framework].map((l, i) => (
          <li
            key={l.id}
            aria-current={i === f.at ? "step" : undefined}
            className={cn(
              "rounded-md border-2 px-2 py-1.5 text-center",
              i === f.at
                ? f.tone === "error"
                  ? "border-hard bg-hard-soft"
                  : "border-accent bg-accent-soft"
                : "border-rule",
            )}
          >
            <span className="block text-sm font-semibold">{l.label}</span>
            <span className="text-muted block font-mono text-[0.65rem]">{l.detail}</span>
          </li>
        ))}
      </ol>
    </div>
  )
}

export function RequestLifecycleViz({
  framework = "django",
  variant = "normal",
  caption,
}: {
  framework?: Framework
  variant?: Variant
  caption?: string
}) {
  const frames = lifecycleFrames(framework, variant)
  return (
    <VizFrame
      title={variant === "rejected" ? `${TITLES[framework]}: rejected early` : TITLES[framework]}
      caption={
        caption ??
        "Every request crosses the same layers in the same order, and the response comes back through them in reverse. Knowing the order tells you where each kind of code belongs."
      }
      steps={frames.map((f) => ({ label: f.label, narration: f.narration }))}
      kind="3d"
      intervalMs={2600}
      fallback={<Fallback framework={framework} variant={variant} />}
    >
      <Scene3D framework={framework} frames={frames} />
    </VizFrame>
  )
}
