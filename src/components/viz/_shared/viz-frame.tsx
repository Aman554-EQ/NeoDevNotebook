"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { Pause, Play, RotateCcw, StepBack, StepForward, Eye } from "lucide-react"
import { cn } from "@/lib/utils"
import { useInView, usePrefersReducedMotion, useWebGLSupport } from "./hooks"

/**
 * Shared shell for every visualization (soul.md §8):
 * - mounts the scene only when scrolled near the viewport (lazy JS for 3D)
 * - play / pause / step / reset controls, keyboard operable
 * - per-step narration in an aria-live region (the text alternative)
 * - "What to notice" caption
 * - reduced motion: no autoplay, no animation; 3D scenes show the static fallback
 */

export type VizStep = { label: string; narration: string }
type VizState = { step: number; total: number; reducedMotion: boolean }

const VizContext = createContext<VizState | null>(null)

export function useViz(): VizState {
  const ctx = useContext(VizContext)
  if (!ctx) throw new Error("useViz must be used inside <VizFrame>")
  return ctx
}

type Props = {
  title: string
  /** "What to notice" — one or two sentences. */
  caption: string
  steps: VizStep[]
  /** Interactive scene. For 3D, pass a next/dynamic component so its code loads lazily. */
  children: React.ReactNode
  /** Static (non-animated) version of the same scene, used for reduced motion / no WebGL. */
  fallback?: React.ReactNode
  kind?: "2d" | "3d"
  intervalMs?: number
  /** Replaces the default "Interactive" / "3D · drag to rotate" chip. */
  badge?: string
}

export function VizFrame({
  title,
  caption,
  steps,
  children,
  fallback,
  kind = "2d",
  intervalMs = 1800,
  badge,
}: Props) {
  const [step, setStep] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [force3d, setForce3d] = useState(false)
  const reducedMotion = usePrefersReducedMotion()
  const [ref, inView] = useInView<HTMLElement>()
  const webgl = useWebGLSupport()
  const total = steps.length
  const last = total - 1

  // Autoplay advances one step per interval and stops at the end.
  useEffect(() => {
    if (!playing || step >= last) return
    const t = setTimeout(() => {
      setStep(step + 1)
      if (step + 1 >= last) setPlaying(false)
    }, intervalMs)
    return () => clearTimeout(t)
  }, [playing, step, last, intervalMs])

  const showFallback = kind === "3d" && fallback && (!webgl || (reducedMotion && !force3d))
  const current = steps[step]!

  return (
    <figure
      ref={ref}
      data-testid="viz-frame"
      data-viz-kind={kind}
      data-step={step}
      aria-label={`Visualization: ${title}`}
      className="not-prose border-rule bg-surface my-8 overflow-hidden rounded-[var(--radius-card)] border"
    >
      <div className="border-rule flex flex-wrap items-center justify-between gap-2 border-b px-4 py-2.5">
        <p className="font-display font-semibold">{title}</p>
        <span className="bg-surface-2 text-muted rounded-full px-2 py-0.5 font-mono text-xs">
          {badge ?? (kind === "3d" ? "3D · drag to rotate" : "Interactive")}
        </span>
      </div>

      <VizContext.Provider value={{ step, total, reducedMotion }}>
        <div className="bg-bg/60 relative min-h-[16rem]" data-testid="viz-stage">
          {!inView ? (
            <div
              data-testid="viz-skeleton"
              className="bg-surface-2 absolute inset-4 animate-pulse rounded-lg"
            />
          ) : showFallback ? (
            <div data-testid="viz-fallback">
              {fallback}
              {webgl && (
                <button
                  type="button"
                  onClick={() => setForce3d(true)}
                  className="border-rule bg-surface hover:border-accent absolute top-3 right-3 inline-flex items-center gap-1.5 rounded-[var(--radius-control)] border px-2.5 py-1 text-xs font-medium"
                >
                  <Eye className="size-3.5" aria-hidden /> Load 3D view
                </button>
              )}
            </div>
          ) : (
            <div data-testid="viz-scene">{children}</div>
          )}
        </div>
      </VizContext.Provider>

      <div className="border-rule border-t px-4 py-3">
        <p className="text-sm" aria-live="polite" data-testid="viz-narration">
          <span className="text-muted font-mono text-xs">
            Step {step + 1}/{total} ·{" "}
          </span>
          <span className="font-semibold">{current.label}</span> — {current.narration}
        </p>
        <div
          className="mt-3 flex flex-wrap items-center gap-1.5"
          role="group"
          aria-label="Visualization controls"
        >
          <ControlButton
            label={playing ? "Pause" : step >= last ? "Replay" : "Play"}
            onClick={() => {
              if (step >= last && !playing) setStep(0)
              setPlaying((p) => !p)
            }}
            testId="viz-play"
            primary
          >
            {playing ? (
              <Pause className="size-4" aria-hidden />
            ) : (
              <Play className="size-4" aria-hidden />
            )}
          </ControlButton>
          <ControlButton
            label="Previous step"
            onClick={() => {
              setPlaying(false)
              setStep((s) => Math.max(s - 1, 0))
            }}
            disabled={step === 0}
            testId="viz-prev"
          >
            <StepBack className="size-4" aria-hidden />
          </ControlButton>
          <ControlButton
            label="Next step"
            onClick={() => {
              setPlaying(false)
              setStep((s) => Math.min(s + 1, last))
            }}
            disabled={step >= last}
            testId="viz-step"
          >
            <StepForward className="size-4" aria-hidden />
          </ControlButton>
          <ControlButton
            label="Reset"
            onClick={() => {
              setPlaying(false)
              setStep(0)
            }}
            testId="viz-reset"
          >
            <RotateCcw className="size-4" aria-hidden />
          </ControlButton>
          {total <= 12 ? (
            <ol className="ml-auto flex gap-1" aria-hidden>
              {steps.map((_, i) => (
                <li
                  key={i}
                  className={cn("bg-rule h-1.5 w-5 rounded-full", i <= step && "bg-accent")}
                />
              ))}
            </ol>
          ) : (
            // Long sequences (e.g. execution traces) get a bar instead of one dot per step.
            <div className="bg-rule ml-auto h-1.5 w-32 overflow-hidden rounded-full" aria-hidden>
              <div
                className="bg-accent h-full rounded-full"
                style={{ width: `${((step + 1) / total) * 100}%` }}
              />
            </div>
          )}
        </div>
      </div>

      <figcaption className="border-rule bg-highlight/40 border-t px-4 py-3 text-sm">
        <span className="font-semibold">What to notice: </span>
        {caption}
      </figcaption>
    </figure>
  )
}

function ControlButton({
  label,
  onClick,
  disabled,
  children,
  testId,
  primary,
}: {
  label: string
  onClick: () => void
  disabled?: boolean
  children: React.ReactNode
  testId: string
  primary?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      data-testid={testId}
      className={cn(
        "inline-flex h-9 items-center gap-1.5 rounded-[var(--radius-control)] border px-3 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-40",
        primary
          ? "border-accent bg-accent text-accent-ink hover:opacity-90"
          : "border-rule bg-surface hover:border-accent",
      )}
    >
      {children}
      <span className={primary ? "" : "sr-only"}>{label}</span>
    </button>
  )
}
