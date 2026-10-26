import fs from "node:fs"
import path from "node:path"
import matter from "gray-matter"
import YAML from "yaml"
import type { z } from "zod"
import {
  interviewSchema,
  lessonFrontmatterSchema,
  moduleSchema,
  problemSchema,
  type InterviewQuestion,
  type LessonFrontmatter,
  type ModuleMeta,
  type Problem,
} from "./schema"

/**
 * Plain synchronous loaders for everything under `content/`.
 * Used by the app (through the cached wrappers in ./index.ts), by scripts and by tests.
 * Any invalid file throws a ContentError naming the file, so a bad YAML fails the build.
 */

export const DEFAULT_CONTENT_DIR = path.join(process.cwd(), "content")

export class ContentError extends Error {
  constructor(file: string, detail: string) {
    super(`Invalid content in ${file}:\n${detail}`)
    this.name = "ContentError"
  }
}

export type LessonSummary = LessonFrontmatter & {
  module: string
  slug: string
  order: number
  file: string
}
export type Lesson = LessonSummary & { body: string }
export type ContentModule = ModuleMeta & { slug: string }

const LESSON_FILE = /^(\d{2})-([a-z0-9]+(?:-[a-z0-9]+)*)\.mdx$/

function parseWith<T>(schema: z.ZodType<T>, data: unknown, file: string): T {
  const result = schema.safeParse(data)
  if (!result.success) {
    const detail = result.error.issues
      .map((i) => `  - ${i.path.join(".") || "(root)"}: ${i.message}`)
      .join("\n")
    throw new ContentError(file, detail)
  }
  return result.data
}

function readYaml(file: string): unknown {
  try {
    return YAML.parse(fs.readFileSync(file, "utf8"))
  } catch (err) {
    throw new ContentError(file, String(err))
  }
}

function listFiles(dir: string, ext: string): string[] {
  if (!fs.existsSync(dir)) return []
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(ext))
    .sort()
}

/** Every folder in content/ that has a module.yaml is a module (auto-discovery). */
export function loadModules(root = DEFAULT_CONTENT_DIR): ContentModule[] {
  if (!fs.existsSync(root)) return []
  const modules = fs
    .readdirSync(root, { withFileTypes: true })
    .filter((d) => d.isDirectory() && fs.existsSync(path.join(root, d.name, "module.yaml")))
    .map((d) => {
      const file = path.join(root, d.name, "module.yaml")
      return { ...parseWith(moduleSchema, readYaml(file), file), slug: d.name }
    })
  return modules.sort((a, b) => a.part - b.part || a.order - b.order)
}

export function loadLessons(moduleSlug: string, root = DEFAULT_CONTENT_DIR): Lesson[] {
  const dir = path.join(root, moduleSlug, "lessons")
  return listFiles(dir, ".mdx").map((name) => {
    const file = path.join(dir, name)
    const match = LESSON_FILE.exec(name)
    if (!match) throw new ContentError(file, "  - file name must look like 01-my-lesson.mdx")
    const { data, content } = matter(fs.readFileSync(file, "utf8"))
    return {
      ...parseWith(lessonFrontmatterSchema, data, file),
      module: moduleSlug,
      slug: match[2]!,
      order: Number(match[1]),
      file,
      body: content,
    }
  })
}

function loadIdFiles<T extends { id: string }>(
  moduleSlug: string,
  sub: "problems" | "interview",
  schema: z.ZodType<T>,
  root: string,
): T[] {
  const dir = path.join(root, moduleSlug, sub)
  return listFiles(dir, ".yaml").map((name) => {
    const file = path.join(dir, name)
    const item = parseWith(schema, readYaml(file), file)
    if (name !== `${item.id}.yaml`) {
      throw new ContentError(file, `  - file name must equal the id ("${item.id}.yaml")`)
    }
    return item
  })
}

export function loadProblems(moduleSlug: string, root = DEFAULT_CONTENT_DIR): Problem[] {
  return loadIdFiles(moduleSlug, "problems", problemSchema, root)
}

export function loadInterviewQuestions(
  moduleSlug: string,
  root = DEFAULT_CONTENT_DIR,
): InterviewQuestion[] {
  return loadIdFiles(moduleSlug, "interview", interviewSchema, root)
}

export type ContentBundle = {
  module: ContentModule
  lessons: Lesson[]
  problems: Problem[]
  interview: InterviewQuestion[]
}

/** Everything, validated, plus cross-file integrity checks (unique ids/titles, id prefixes). */
export function loadAllContent(root = DEFAULT_CONTENT_DIR): ContentBundle[] {
  const bundles = loadModules(root).map((module) => ({
    module,
    lessons: loadLessons(module.slug, root),
    problems: loadProblems(module.slug, root),
    interview: loadInterviewQuestions(module.slug, root),
  }))
  const issues = findIntegrityIssues(bundles)
  if (issues.length) throw new ContentError(root, issues.map((i) => `  - ${i}`).join("\n"))
  return bundles
}

const normalise = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()

export function findIntegrityIssues(bundles: ContentBundle[]): string[] {
  const issues: string[] = []
  const seenIds = new Set<string>()
  const prefixes = new Map<string, string>()
  for (const { module, lessons, problems, interview } of bundles) {
    const owner = prefixes.get(module.idPrefix)
    if (owner) issues.push(`idPrefix "${module.idPrefix}" used by both ${owner} and ${module.slug}`)
    prefixes.set(module.idPrefix, module.slug)

    const lessonSlugs = new Set<string>()
    for (const l of lessons) {
      if (lessonSlugs.has(l.slug)) issues.push(`${module.slug}: duplicate lesson slug "${l.slug}"`)
      lessonSlugs.add(l.slug)
    }
    const titles = new Set<string>()
    for (const item of [...problems, ...interview]) {
      if (!item.id.startsWith(`${module.idPrefix}-`)) {
        issues.push(`${item.id}: id must start with "${module.idPrefix}-" in module ${module.slug}`)
      }
      if (seenIds.has(item.id)) issues.push(`duplicate id "${item.id}"`)
      seenIds.add(item.id)
      const title = normalise("title" in item ? item.title : item.question)
      if (titles.has(title)) issues.push(`${module.slug}: duplicate title/question "${title}"`)
      titles.add(title)
    }
  }
  return issues
}
