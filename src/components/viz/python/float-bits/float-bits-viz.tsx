"use client"

import { VizFrame, useViz, type VizStep } from "../../_shared/viz-frame"
import { cn } from "@/lib/utils"

/**
 * Why 0.1 + 0.2 != 0.3. Every number below was printed by CPython 3.13
 * (Decimal(x) shows the exact value a float stores; float.hex shows its bits).
 */
type Row = { label: string; typed: string; stored: string; hex: string; tone?: "bad" | "good" }

const R01: Row = {
  label: "0.1",
  typed: "0.1",
  stored: "0.1000000000000000055511151231257827021181583404541015625",
  hex: "0x1.999999999999ap-4",
}
const R02: Row = {
  label: "0.2",
  typed: "0.2",
  stored: "0.200000000000000011102230246251565404236316680908203125",
  hex: "0x1.999999999999ap-3",
}
const RSUM: Row = {
  label: "0.1 + 0.2",
  typed: "0.30000000000000004",
  stored: "0.3000000000000000444089209850062616169452667236328125",
  hex: "0x1.3333333333334p-2",
  tone: "bad",
}
const R03: Row = {
  label: "0.3",
  typed: "0.3",
  stored: "0.299999999999999988897769753748434595763683319091796875",
  hex: "0x1.3333333333333p-2",
  tone: "bad",
}

const FRAMES: { rows: Row[]; binary?: boolean; fix?: boolean }[] = [
  { rows: [], binary: true },
  { rows: [R01] },
  { rows: [R01, R02] },
  { rows: [R01, R02, RSUM] },
  { rows: [R01, R02, RSUM, R03] },
  { rows: [R01, R02, RSUM, R03], fix: true },
]

const STEPS: VizStep[] = [
  {
    label: "Binary fractions",
    narration:
      "Floats are stored in binary. 1/10 has no finite binary expansion: it's 0.000110011001100… repeating forever, like 1/3 in decimal.",
  },
  {
    label: "0.1 is rounded",
    narration:
      "A float keeps 53 significant bits, so 0.1 is rounded to the nearest representable value, slightly MORE than 0.1.",
  },
  {
    label: "0.2 is rounded",
    narration: "0.2 is also stored slightly above its true value.",
  },
  {
    label: "Add",
    narration:
      "Adding the two stored values and rounding the result gives 0.30000000000000004 when printed.",
  },
  {
    label: "Compare",
    narration:
      "But the literal 0.3 is stored slightly BELOW 0.3. The two floats differ in their last bit, so 0.1 + 0.2 == 0.3 is False.",
  },
  {
    label: "Compare safely",
    narration:
      "Compare floats with math.isclose, or use Decimal('0.1') or Fraction for exact decimal arithmetic such as money.",
  },
]

function Scene() {
  const { step } = useViz()
  const f = FRAMES[step]!
  return (
    <div className="space-y-3 p-4" data-testid="float-bits">
      {f.binary && (
        <div className="bg-surface border-rule rounded-lg border p-4 font-mono text-sm">
          <p>
            1/10 in binary = 0.0
            <span className="bg-highlight rounded px-0.5">0011</span>
            <span className="bg-highlight rounded px-0.5">0011</span>
            <span className="bg-highlight rounded px-0.5">0011</span>
            <span className="bg-highlight rounded px-0.5">0011</span>…
          </p>
          <p className="text-muted mt-2 text-xs">
            Like 1/3 = 0.3333… in decimal, the pattern never ends, so it has to be cut off
            somewhere.
          </p>
        </div>
      )}
      {f.rows.map((r) => (
        <div
          key={r.label}
          className={cn(
            "bg-surface rounded-lg border p-3",
            r.tone === "bad" ? "border-hard" : "border-rule",
          )}
        >
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="font-mono text-sm font-semibold">{r.label}</p>
            <p className="text-muted font-mono text-xs">bits: {r.hex}</p>
          </div>
          <p className="mt-1 font-mono text-xs break-all">
            <span className="text-muted">stored exactly: </span>
            {r.stored}
          </p>
          <p className="mt-1 font-mono text-xs">
            <span className="text-muted">print() shows: </span>
            {r.typed}
          </p>
        </div>
      ))}
      {f.fix && (
        <pre className="border-easy bg-easy-soft overflow-x-auto rounded-lg border p-3 font-mono text-xs">
          {`math.isclose(0.1 + 0.2, 0.3)          # True
Decimal("0.1") + Decimal("0.2")       # Decimal('0.3')
Fraction(1, 10) + Fraction(2, 10)     # Fraction(3, 10)`}
        </pre>
      )}
    </div>
  )
}

export function FloatBitsViz() {
  return (
    <VizFrame
      title="Why 0.1 + 0.2 is not 0.3"
      caption="Floats are binary approximations. Each value is rounded once when stored and again after each operation, so tiny errors appear in the last digit. Never test floats with ==."
      steps={STEPS}
      intervalMs={2800}
    >
      <Scene />
    </VizFrame>
  )
}
