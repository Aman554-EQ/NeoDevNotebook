import { cn } from "@/lib/utils"
import { BRAND_PATHS } from "./logo-paths"

/** Every tech the notebook teaches or touches: brand marks plus two drawn glyphs (ML, LLM). */
export const TECH_LOGOS = [
  ...(Object.keys(BRAND_PATHS) as (keyof typeof BRAND_PATHS)[]),
  "ml",
  "llm",
] as const
export type TechLogoName = (typeof TECH_LOGOS)[number]

export const TECH_TITLES: Record<TechLogoName, string> = {
  ...Object.fromEntries(Object.entries(BRAND_PATHS).map(([k, v]) => [k, v.title])),
  ml: "Machine learning",
  llm: "Large language models",
} as Record<TechLogoName, string>

/** A small neural network: three layers of nodes joined by their weights. */
export function MlGlyph() {
  const a = [6, 18]
  const b = [4, 12, 20]
  return (
    <>
      <g stroke="currentColor" strokeWidth="1.1" opacity="0.7">
        {a.flatMap((y1) =>
          b.map((y2) => <line key={`${y1}-${y2}`} x1="3.5" y1={y1} x2="12" y2={y2} />),
        )}
        {b.map((y1) => (
          <line key={y1} x1="12" y1={y1} x2="20.5" y2="12" />
        ))}
      </g>
      {a.map((y) => (
        <circle key={y} cx="3.5" cy={y} r="2.2" />
      ))}
      {b.map((y) => (
        <circle key={y} cx="12" cy={y} r="2.2" />
      ))}
      <circle cx="20.5" cy="12" r="2.6" />
    </>
  )
}

/** A chat bubble with a spark cut out of it. */
export function LlmGlyph() {
  return (
    <path
      fillRule="evenodd"
      d="M4 3h16a2 2 0 0 1 2 2v10.5a2 2 0 0 1-2 2h-9.2L5.5 21.6V17.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Zm8 2.6-1.25 3.15L7.6 10l3.15 1.25L12 14.4l1.25-3.15L16.4 10l-3.15-1.25L12 5.6Z"
    />
  )
}

/**
 * A tech logo as inline SVG. `tone="brand"` paints it in its brand token (light and dark
 * versions in globals.css); `tone="current"` uses the surrounding text colour.
 */
export function TechLogo({
  name,
  tone = "brand",
  className,
  title,
}: {
  name: TechLogoName
  tone?: "brand" | "current"
  className?: string
  /** Give a title only when the logo stands alone; next to its name it stays decorative. */
  title?: string
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={cn("shrink-0", className)}
      style={tone === "brand" ? { color: `var(--brand-${name})` } : undefined}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      data-logo={name}
    >
      {name === "ml" ? (
        <MlGlyph />
      ) : name === "llm" ? (
        <LlmGlyph />
      ) : (
        <path d={BRAND_PATHS[name].path} />
      )}
    </svg>
  )
}
