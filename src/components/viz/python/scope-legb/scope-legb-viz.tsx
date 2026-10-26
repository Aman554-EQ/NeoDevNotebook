"use client"

import { VizFrame, useViz, type VizStep } from "../../_shared/viz-frame"
import { cn } from "@/lib/utils"

type Scope = "L" | "E" | "G" | "B"
const SCOPES: { id: Scope; title: string }[] = [
  { id: "B", title: "Built-in" },
  { id: "G", title: "Global (module)" },
  { id: "E", title: "Enclosing: outer()" },
  { id: "L", title: "Local: inner()" },
]

type Frame = {
  code: string
  /** Names visible in each scope at this moment. */
  names: Record<Scope, string[]>
  /** Scopes searched in order; the last one found the name (unless `error`). */
  path: Scope[]
  found?: string
  error?: string
  /** Assignments bind rather than look up. */
  binds?: boolean
}

const BASE: Record<Scope, string[]> = {
  B: ["len", "print", "range", "…"],
  G: ["x = 'global'", "outer"],
  E: ["x = 'enclosing'", "inner"],
  L: [],
}

const FRAMES: Frame[] = [
  { code: "print(x)   # inside inner()", names: BASE, path: ["L", "E"], found: "x = 'enclosing'" },
  { code: "print(len)   # inside inner()", names: BASE, path: ["L", "E", "G", "B"], found: "len" },
  {
    code: "print(y)   # inside inner()",
    names: BASE,
    path: ["L", "E", "G", "B"],
    error: "NameError: name 'y' is not defined",
  },
  {
    code: "x = 'local'   # assignment inside inner()",
    names: { ...BASE, L: ["x = 'local'"] },
    path: ["L"],
    found: "x = 'local'",
    binds: true,
  },
  {
    code: "nonlocal x; x = 'changed'   # inside inner()",
    names: { ...BASE, E: ["x = 'changed'", "inner"] },
    path: ["L", "E"],
    found: "x = 'changed'",
    binds: true,
  },
]

const STEPS: VizStep[] = [
  {
    label: "Find x",
    narration:
      "Python looks for x in the Local scope first, doesn't find it, then finds it in the Enclosing function: 'enclosing'.",
  },
  {
    label: "Find len",
    narration: "len isn't in Local, Enclosing or Global, so Python finds it in the Built-in scope.",
  },
  {
    label: "Not found",
    narration: "y is in no scope at all, so the lookup fails with NameError.",
  },
  {
    label: "Assign = local",
    narration:
      "Assigning to x inside inner creates a NEW local x that shadows the outer one. The enclosing x is unchanged.",
  },
  {
    label: "nonlocal",
    narration:
      "With nonlocal x, the assignment rebinds the Enclosing x instead of creating a local. Use global x for module-level names.",
  },
]

function Scene() {
  const { step } = useViz()
  const f = FRAMES[step]!
  const last = f.path.at(-1)

  // Render the scopes as nested boxes: Built-in contains Global contains Enclosing contains Local.
  const box = (i: number): React.ReactNode => {
    const s = SCOPES[i]
    if (!s) return null
    const order = f.path.indexOf(s.id)
    const searched = order !== -1
    const hit = s.id === last && !f.error
    return (
      <div
        className={cn(
          "rounded-lg border-2 p-2 transition-colors duration-300 sm:p-3",
          hit
            ? "border-easy bg-easy-soft"
            : searched
              ? "border-accent bg-surface"
              : "border-rule bg-surface",
          f.error && s.id === "B" && "border-hard",
        )}
        data-scope={s.id}
      >
        <div className="flex flex-wrap items-center gap-2">
          {searched && (
            <span className="bg-ink text-bg grid size-5 shrink-0 place-items-center rounded-full font-mono text-[0.65rem]">
              {order + 1}
            </span>
          )}
          <span className="text-xs font-semibold tracking-wide uppercase">
            {s.id} · {s.title}
          </span>
          <span className="text-muted font-mono text-xs">
            {f.names[s.id].length ? f.names[s.id].join(", ") : "(no names yet)"}
          </span>
        </div>
        {i < SCOPES.length - 1 && <div className="mt-2">{box(i + 1)}</div>}
      </div>
    )
  }

  return (
    <div className="space-y-3 p-4">
      <p className="text-center">
        <code className="bg-surface-2 rounded-md px-3 py-1 font-mono text-sm">{f.code}</code>
      </p>
      {box(0)}
      <p
        className={cn("text-center font-mono text-sm", f.error ? "text-hard" : "text-easy")}
        data-testid="legb-result"
      >
        {f.error ?? `${f.binds ? "binds" : "found"}: ${f.found}`}
      </p>
    </div>
  )
}

export function ScopeLegbViz() {
  return (
    <VizFrame
      title="How Python finds a name: LEGB"
      caption="Lookups search outward: Local, then Enclosing, then Global, then Built-in, and stop at the first match. Assignment is different: it creates a local name unless you declare nonlocal or global."
      steps={STEPS}
      intervalMs={2800}
    >
      <Scene />
    </VizFrame>
  )
}
