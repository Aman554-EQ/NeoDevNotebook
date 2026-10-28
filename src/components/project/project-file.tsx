import fs from "node:fs"
import path from "node:path"
import { CodeBlock } from "@/components/lesson/code-block"
import { projectCodeDir } from "@/lib/content/load"
import { CodeTabs } from "./code-tabs"

/**
 * Shows files of a guided project's real code (projects/<module>/<project>/), read at build time.
 * The code on the page is byte-for-byte the code whose test suite passes in CI.
 */

type Bound = { module: string; project?: string }

const LANG_BY_EXT: Record<string, string> = {
  ".py": "python",
  ".html": "jinja",
  ".txt": "text",
  ".yaml": "yaml",
  ".yml": "yaml",
  ".json": "json",
  ".ini": "ini",
  ".toml": "toml",
  ".md": "text",
  ".example": "dotenv",
}

export function languageOf(file: string) {
  if (path.basename(file) === "Dockerfile") return "dockerfile"
  return LANG_BY_EXT[path.extname(file)] ?? "text"
}

function read(module: string, project: string | undefined, file: string) {
  if (!project) throw new Error(`<ProjectFile path="${file}"> needs a project`)
  const dir = projectCodeDir(module, project)
  const full = path.join(dir, file)
  if (!full.startsWith(dir)) throw new Error(`Path escapes the project: ${file}`)
  return fs.readFileSync(/*turbopackIgnore: true*/ full, "utf8").replace(/\r\n/g, "\n")
}

export function ProjectFile({ module, project, path: file }: Bound & { path: string }) {
  return <CodeBlock code={read(module, project, file)} language={languageOf(file)} title={file} />
}

export function ProjectFiles({ module, project, paths }: Bound & { paths: string }) {
  const files = paths.split(/\s+/).filter(Boolean)
  return (
    <CodeTabs
      tabs={files.map((file) => ({
        label: file,
        content: (
          <CodeBlock code={read(module, project, file)} language={languageOf(file)} title={file} />
        ),
      }))}
    />
  )
}

const SKIP = new Set(["__pycache__", ".pytest_cache", "staticfiles", ".venv", "openapi.yaml"])

function walk(dir: string, prefix = ""): string[] {
  return fs
    .readdirSync(/*turbopackIgnore: true*/ dir, { withFileTypes: true })
    .filter((e) => !SKIP.has(e.name) && !e.name.endsWith(".sqlite3") && e.name !== ".env")
    .sort(
      (a, b) => Number(b.isDirectory()) - Number(a.isDirectory()) || a.name.localeCompare(b.name),
    )
    .flatMap((e) =>
      e.isDirectory()
        ? [`${prefix}${e.name}/`, ...walk(path.join(dir, e.name), `${prefix}  `)]
        : [`${prefix}${e.name}`],
    )
}

/** The project's folder layout, as `tree` would print it (generated, so it never goes stale). */
export function ProjectTree({ module, project }: Bound) {
  if (!project) throw new Error("<ProjectTree> needs a project")
  const lines = walk(projectCodeDir(module, project))
  return (
    <CodeBlock
      code={[`${project}/`, ...lines.map((l) => `  ${l}`)].join("\n")}
      title="Project layout"
    />
  )
}
