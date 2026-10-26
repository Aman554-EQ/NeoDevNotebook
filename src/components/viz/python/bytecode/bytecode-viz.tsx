"use client"

import { VizFrame, useViz, type VizStep } from "../../_shared/viz-frame"
import { cn } from "@/lib/utils"

/**
 * Source → bytecode → interpreter, for a 4-line program. The bytecode is the real
 * `dis` output of CPython 3.13 (RESUME omitted); the stack states follow from it.
 */
const SOURCE = ["price = 4", "qty = 3", "total = price * qty", "print(total)"]
const BYTECODE: { line: number; op: string; arg: string }[] = [
  { line: 1, op: "LOAD_CONST", arg: "4" },
  { line: 1, op: "STORE_NAME", arg: "price" },
  { line: 2, op: "LOAD_CONST", arg: "3" },
  { line: 2, op: "STORE_NAME", arg: "qty" },
  { line: 3, op: "LOAD_NAME", arg: "price" },
  { line: 3, op: "LOAD_NAME", arg: "qty" },
  { line: 3, op: "BINARY_OP", arg: "*" },
  { line: 3, op: "STORE_NAME", arg: "total" },
  { line: 4, op: "LOAD_NAME", arg: "print" },
  { line: 4, op: "PUSH_NULL", arg: "" },
  { line: 4, op: "LOAD_NAME", arg: "total" },
  { line: 4, op: "CALL", arg: "1" },
  { line: 4, op: "POP_TOP", arg: "" },
  { line: 4, op: "RETURN_CONST", arg: "None" },
]

type Frame = {
  stage: "source" | "compile" | "run"
  /** Index into BYTECODE of the instruction that just ran. */
  pc?: number
  stack: string[]
  names: [string, string][]
  output?: string
}

const NAMES_BEFORE: [string, string][] = [
  ["price", "4"],
  ["qty", "3"],
]
const FRAMES: Frame[] = [
  { stage: "source", stack: [], names: [] },
  { stage: "compile", stack: [], names: [] },
  { stage: "run", pc: 4, stack: ["4"], names: NAMES_BEFORE },
  { stage: "run", pc: 5, stack: ["4", "3"], names: NAMES_BEFORE },
  { stage: "run", pc: 6, stack: ["12"], names: NAMES_BEFORE },
  { stage: "run", pc: 7, stack: [], names: [...NAMES_BEFORE, ["total", "12"]] },
  {
    stage: "run",
    pc: 11,
    stack: ["None"],
    names: [...NAMES_BEFORE, ["total", "12"]],
    output: "12",
  },
]

const STEPS: VizStep[] = [
  {
    label: "Source",
    narration:
      "You write source code: plain text in a .py file. The computer can't run it directly.",
  },
  {
    label: "Compile",
    narration:
      "CPython first compiles the whole file to bytecode: small instructions for a stack machine. Line 3 becomes four instructions.",
  },
  {
    label: "LOAD_NAME price",
    narration:
      "Running line 3: LOAD_NAME looks up price and pushes its value 4 onto the value stack.",
  },
  {
    label: "LOAD_NAME qty",
    narration: "LOAD_NAME pushes qty's value 3. The stack now holds 4 and 3.",
  },
  {
    label: "BINARY_OP *",
    narration: "BINARY_OP pops both values, multiplies them, and pushes the result 12.",
  },
  {
    label: "STORE_NAME total",
    narration: "STORE_NAME pops 12 and binds the name total to it. Line 3 is done.",
  },
  {
    label: "CALL print",
    narration:
      "Line 4 loads print and total, then CALL runs print, which writes 12 to the screen and returns None.",
  },
]

function Scene() {
  const { step } = useViz()
  const f = FRAMES[step]!
  const currentLine = f.pc !== undefined ? BYTECODE[f.pc]!.line : undefined
  return (
    <div className="grid gap-4 p-4 md:grid-cols-3" data-testid="bytecode-scene">
      <Panel title="1 · Source (.py)" active={f.stage === "source"}>
        <ol className="font-mono text-xs leading-6">
          {SOURCE.map((l, i) => (
            <li key={l} className={cn("rounded px-1", currentLine === i + 1 && "bg-highlight")}>
              <span className="text-muted mr-2 select-none">{i + 1}</span>
              {l}
            </li>
          ))}
        </ol>
      </Panel>
      <Panel title="2 · Bytecode" active={f.stage === "compile"} dim={f.stage === "source"}>
        <ol className="font-mono text-[0.7rem] leading-5">
          {BYTECODE.map((b, i) => (
            <li
              key={i}
              className={cn(
                "grid grid-cols-[1rem_1fr_auto] gap-1 rounded px-1 transition-colors duration-300",
                f.pc === i && "bg-highlight font-semibold",
                f.stage !== "source" && b.line === 3 && f.pc === undefined && "bg-accent-soft",
              )}
            >
              <span className="text-muted">{b.line}</span>
              <span>{b.op}</span>
              <span className="text-muted">{b.arg}</span>
            </li>
          ))}
        </ol>
      </Panel>
      <Panel title="3 · Interpreter" active={f.stage === "run"} dim={f.stage !== "run"}>
        <p className="text-muted text-xs">Value stack (top first)</p>
        <ol className="mt-1 flex min-h-24 flex-col gap-1" data-testid="value-stack">
          {[...f.stack].reverse().map((v, i) => (
            <li
              key={`${v}-${i}`}
              className="border-accent bg-accent-soft rounded border px-2 py-0.5 text-center font-mono text-sm"
            >
              {v}
            </li>
          ))}
          {!f.stack.length && <li className="text-muted text-xs italic">empty</li>}
        </ol>
        <p className="text-muted mt-3 text-xs">Names</p>
        <dl className="mt-1 grid grid-cols-[auto_1fr] gap-x-3 font-mono text-xs">
          {f.names.map(([k, v]) => (
            <div key={k} className="contents">
              <dt className="text-muted">{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
        {f.output && (
          <p className="mt-3 font-mono text-xs">
            Output: <span className="bg-highlight rounded px-1">{f.output}</span>
          </p>
        )}
      </Panel>
    </div>
  )
}

function Panel({
  title,
  active,
  dim,
  children,
}: {
  title: string
  active: boolean
  dim?: boolean
  children: React.ReactNode
}) {
  return (
    <section
      className={cn(
        "rounded-lg border p-3 transition-colors duration-300",
        active ? "border-accent border-2" : "border-rule",
        // Not-yet-reached stages are marked by a dashed outline, never by fading text (contrast).
        dim ? "bg-bg border-dashed" : "bg-surface",
      )}
      data-active={active || undefined}
    >
      <h3 className="mb-2 text-xs font-semibold tracking-wide uppercase">{title}</h3>
      {children}
    </section>
  )
}

export function BytecodeViz() {
  return (
    <VizFrame
      title="From source code to a running program"
      caption="Python compiles your file to bytecode first, then a small stack machine runs one instruction at a time. One line of Python can be several instructions."
      steps={STEPS}
      intervalMs={2400}
    >
      <Scene />
    </VizFrame>
  )
}
