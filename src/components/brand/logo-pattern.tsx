import { useId } from "react"
import { cn } from "@/lib/utils"
import { BRAND_PATHS } from "./logo-paths"
import { LlmGlyph, MlGlyph } from "./tech-logo"

type Name = keyof typeof BRAND_PATHS

// One 480×360 tile: logos scattered on a loose grid, each turned a little.
const TILE: { n: Name | "ml" | "llm"; x: number; y: number; r: number; s: number }[] = [
  { n: "python", x: 24, y: 28, r: -12, s: 1.2 },
  { n: "django", x: 150, y: 70, r: 8, s: 1 },
  { n: "fastapi", x: 280, y: 22, r: -6, s: 1.1 },
  { n: "git", x: 404, y: 64, r: 14, s: 1 },
  { n: "docker", x: 64, y: 150, r: 6, s: 1.2 },
  { n: "ml", x: 198, y: 176, r: -10, s: 1.1 },
  { n: "typescript", x: 330, y: 150, r: 10, s: 1 },
  { n: "github", x: 440, y: 196, r: -8, s: 1 },
  { n: "pytorch", x: 22, y: 268, r: -14, s: 1.1 },
  { n: "javascript", x: 130, y: 300, r: 6, s: 1 },
  { n: "llm", x: 262, y: 276, r: 12, s: 1.1 },
  { n: "react", x: 372, y: 300, r: -6, s: 1.1 },
  { n: "shell", x: 300, y: 92, r: 0, s: 0.9 },
  { n: "nextjs", x: 96, y: 224, r: 10, s: 0.9 },
]

function Glyph({ n }: { n: (typeof TILE)[number]["n"] }) {
  if (n === "ml") return <MlGlyph />
  if (n === "llm") return <LlmGlyph />
  return <path d={BRAND_PATHS[n].path} />
}

/**
 * A faint, repeating wallpaper of tech logos (like a notebook's printed paper). Purely
 * decorative: hidden from assistive tech, never above ~7% opacity, faded out at the edges.
 */
export function LogoPattern({ className }: { className?: string }) {
  const id = useId().replace(/:/g, "")
  return (
    <svg
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 h-full w-full", className)}
      style={{
        color: "var(--backdrop-ink)",
        opacity: "var(--backdrop-opacity)",
        maskImage: "linear-gradient(to bottom, #000 55%, transparent)",
      }}
      data-testid="logo-pattern"
    >
      <defs>
        <pattern id={`p${id}`} width="480" height="360" patternUnits="userSpaceOnUse">
          {TILE.map((t) => (
            <g
              key={t.n}
              fill="currentColor"
              transform={`translate(${t.x} ${t.y}) rotate(${t.r} 12 12) scale(${t.s})`}
            >
              <Glyph n={t.n} />
            </g>
          ))}
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#p${id})`} />
    </svg>
  )
}
