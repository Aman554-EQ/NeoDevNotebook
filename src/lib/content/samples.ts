import type { ContentBundle } from "./load"

/** A runnable Python snippet found in content, plus how to check it. */
export type CodeSample = {
  source: string
  code: string
  /** If set, stdout must equal this (from a following ```text title="Output" block). */
  expectedOutput?: string
  /** Fence meta flags: "norun" skips execution; "repl" allows >>> prompts. */
  flags: string[]
}

const FENCE = /^```(\w+)?([^\n]*)\n([\s\S]*?)^```[ \t]*$/gm

/** Extracts fenced code blocks from markdown/MDX, keeping their order. */
export function parseFences(md: string) {
  const blocks: { lang: string; meta: string; code: string }[] = []
  for (const m of md.matchAll(FENCE)) {
    blocks.push({ lang: (m[1] ?? "").toLowerCase(), meta: (m[2] ?? "").trim(), code: m[3] ?? "" })
  }
  return blocks
}

const isPython = (lang: string) => lang === "python" || lang === "py"
const flagsOf = (meta: string) =>
  meta
    .replace(/title="[^"]*"/, "")
    .replace(/\{[^}]*\}/, "")
    .split(/\s+/)
    .filter(Boolean)

function fromMarkdown(md: string, source: string): CodeSample[] {
  const blocks = parseFences(md)
  const samples: CodeSample[] = []
  blocks.forEach((b, i) => {
    if (!isPython(b.lang)) return
    const next = blocks[i + 1]
    const expectedOutput =
      next && next.lang === "text" && /title="Output"/i.test(next.meta) ? next.code : undefined
    samples.push({
      source: `${source}#block${i + 1}`,
      code: b.code,
      expectedOutput,
      flags: flagsOf(b.meta),
    })
  })
  return samples
}

export function extractSamples(bundles: ContentBundle[]): CodeSample[] {
  const samples: CodeSample[] = []
  for (const { lessons, problems, interview } of bundles) {
    for (const l of lessons) samples.push(...fromMarkdown(l.body, `lesson:${l.module}/${l.slug}`))
    for (const p of problems) {
      if (p.solution.language === "python") {
        samples.push({
          source: `problem:${p.id}:solution`,
          code: p.verify ? `${p.solution.code}\n\n# --- verify ---\n${p.verify}` : p.solution.code,
          flags: [],
        })
      }
      samples.push(
        ...fromMarkdown(p.statement, `problem:${p.id}:statement`).map((s) => ({
          ...s,
          flags: [...s.flags, "norun"],
        })),
      )
    }
    for (const q of interview) {
      if (q.code?.language === "python") {
        samples.push({
          source: `interview:${q.id}:code`,
          code: q.verify ? `${q.code.code}\n\n# --- verify ---\n${q.verify}` : q.code.code,
          flags: [],
        })
      }
      samples.push(...fromMarkdown(q.detailedAnswer, `interview:${q.id}:answer`))
    }
  }
  return samples
}
