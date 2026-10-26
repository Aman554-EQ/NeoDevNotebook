"use client"

import { VizFrame, useViz, type VizStep } from "../../_shared/viz-frame"
import { cn } from "@/lib/utils"

/** How `import shop` is resolved (CPython's import system, simplified to the steps you can observe). */
const PATHS = ["script folder", "PYTHONPATH entries", "standard library", "site-packages"]
type Frame = {
  code: string
  cache: string[]
  checkCache?: "miss" | "hit"
  searched: number
  found?: number
  run?: boolean
  bound?: string
  error?: string
}
const FRAMES: Frame[] = [
  { code: "import shop", cache: ["sys", "builtins", "…"], checkCache: "miss", searched: 0 },
  { code: "import shop", cache: ["sys", "builtins", "…"], searched: 1, found: 0 },
  {
    code: "import shop",
    cache: ["sys", "builtins", "…", "shop"],
    searched: 1,
    found: 0,
    run: true,
  },
  {
    code: "import shop",
    cache: ["sys", "builtins", "…", "shop"],
    searched: 1,
    found: 0,
    bound: "shop",
  },
  {
    code: "import shop   # again, anywhere",
    cache: ["sys", "builtins", "…", "shop"],
    checkCache: "hit",
    searched: 0,
    bound: "shop",
  },
  {
    code: "import shopp   # typo",
    cache: ["sys", "builtins", "…", "shop"],
    checkCache: "miss",
    searched: 4,
    error: "ModuleNotFoundError: No module named 'shopp'",
  },
]
const STEPS: VizStep[] = [
  {
    label: "Cache?",
    narration:
      "Python first checks sys.modules, the cache of already-imported modules. shop isn't there yet.",
  },
  {
    label: "Search sys.path",
    narration:
      "It searches the folders in sys.path in order. The script's own folder comes first, and shop.py is found there.",
  },
  {
    label: "Run once",
    narration:
      "The module's top-level code runs ONCE, and the new module object is stored in sys.modules['shop'].",
  },
  {
    label: "Bind",
    narration:
      "Finally the name shop is bound in the importing file's namespace, pointing at the module object.",
  },
  {
    label: "Cached",
    narration:
      "Any later import of shop, from any file, finds it in sys.modules and returns it immediately. The code does not run again.",
  },
  {
    label: "Not found",
    narration:
      "A name found in no sys.path folder raises ModuleNotFoundError, usually a typo or a package installed in a different environment.",
  },
]

function Scene() {
  const { step } = useViz()
  const f = FRAMES[step]!
  return (
    <div className="space-y-3 p-4">
      <p className="text-center">
        <code className="bg-surface-2 rounded-md px-3 py-1 font-mono text-sm">{f.code}</code>
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <section
          className={cn(
            "rounded-lg border-2 p-3",
            f.checkCache === "hit"
              ? "border-easy bg-easy-soft"
              : f.checkCache === "miss"
                ? "border-medium bg-medium-soft"
                : "border-rule bg-surface",
          )}
        >
          <h3 className="text-xs font-semibold uppercase">1 · sys.modules (cache)</h3>
          <p className="mt-1 font-mono text-sm">{f.cache.join(", ")}</p>
          {f.checkCache && (
            <p className="mt-1 text-xs font-semibold">
              {f.checkCache === "hit" ? "hit: reuse it" : "miss: go and find it"}
            </p>
          )}
        </section>
        <section className="border-rule bg-surface rounded-lg border p-3">
          <h3 className="text-xs font-semibold uppercase">2 · sys.path (searched in order)</h3>
          <ol className="mt-1 space-y-1 text-sm">
            {PATHS.map((p, i) => (
              <li
                key={p}
                className={cn(
                  "rounded px-2 py-0.5 font-mono",
                  f.found === i
                    ? "bg-easy-soft text-easy font-bold"
                    : i < f.searched
                      ? "bg-surface-2"
                      : "",
                )}
              >
                {i + 1}. {p}
                {f.found === i && "  → shop.py"}
              </li>
            ))}
          </ol>
        </section>
      </div>
      {f.run && (
        <p className="text-center text-sm">3 · runs shop.py top to bottom once → module object</p>
      )}
      {f.bound && (
        <p className="text-center font-mono text-sm">
          name <span className="bg-highlight rounded px-1">{f.bound}</span> → module
          &apos;shop&apos;
        </p>
      )}
      {f.error && <p className="text-hard text-center font-mono text-sm">{f.error}</p>}
    </div>
  )
}

export function ImportViz() {
  return (
    <VizFrame
      title="What import actually does"
      caption="import checks a cache, searches sys.path in order, runs the module once, caches it, and binds a name. That's why module-level code runs only once, and why the 'wrong' file with the same name can shadow a library."
      steps={STEPS}
      intervalMs={2600}
    >
      <Scene />
    </VizFrame>
  )
}
