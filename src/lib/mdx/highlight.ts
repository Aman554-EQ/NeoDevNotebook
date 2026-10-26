import { createHighlighter, type Highlighter } from "shiki"

/** Languages available to code blocks. Add here when a module needs a new one. */
export const CODE_LANGUAGES = [
  "python",
  "bash",
  "typescript",
  "tsx",
  "javascript",
  "sql",
  "dockerfile",
  "yaml",
  "json",
  "text",
] as const
export type CodeLanguage = (typeof CODE_LANGUAGES)[number]

export const LANGUAGE_LABEL: Record<string, string> = {
  python: "Python",
  py: "Python",
  bash: "Terminal",
  sh: "Terminal",
  shell: "Terminal",
  typescript: "TypeScript",
  ts: "TypeScript",
  tsx: "TSX",
  javascript: "JavaScript",
  js: "JavaScript",
  sql: "SQL",
  dockerfile: "Dockerfile",
  yaml: "YAML",
  json: "JSON",
  text: "Text",
}

const ALIASES: Record<string, CodeLanguage> = {
  py: "python",
  sh: "bash",
  shell: "bash",
  ts: "typescript",
  js: "javascript",
  yml: "yaml",
  txt: "text",
  plaintext: "text",
}

export function normaliseLanguage(lang: string | undefined): CodeLanguage {
  const l = (lang ?? "text").toLowerCase()
  if ((CODE_LANGUAGES as readonly string[]).includes(l)) return l as CodeLanguage
  return ALIASES[l] ?? "text"
}

/** Parses "1,3-5" into a set of 1-based line numbers. */
export function parseLineRanges(spec: string | undefined): Set<number> {
  const lines = new Set<number>()
  for (const part of (spec ?? "").split(",")) {
    const [a, b] = part.trim().split("-").map(Number)
    if (!a || Number.isNaN(a)) continue
    for (let n = a; n <= (b && !Number.isNaN(b) ? b : a); n++) lines.add(n)
  }
  return lines
}

let highlighter: Promise<Highlighter> | undefined

function getHighlighter() {
  highlighter ??= createHighlighter({
    themes: ["github-light-high-contrast", "github-dark-high-contrast"],
    langs: CODE_LANGUAGES.filter((l) => l !== "text"),
  })
  return highlighter
}

/** Build-time syntax highlighting: returns HTML using CSS variables for light/dark colours. */
export async function highlight(code: string, lang: string, highlightLines?: string) {
  "use cache"
  const hl = parseLineRanges(highlightLines)
  const h = await getHighlighter()
  return h.codeToHtml(code, {
    lang: normaliseLanguage(lang),
    themes: { light: "github-light-high-contrast", dark: "github-dark-high-contrast" },
    defaultColor: false,
    transformers: [
      {
        line(node, line) {
          if (hl.has(line)) this.addClassToHast(node, "hl")
        },
      },
    ],
  })
}
