import { z } from "zod"

import { DIFFICULTIES, type Difficulty } from "./difficulty"

export { DIFFICULTIES, type Difficulty }
export const difficultySchema = z.enum(DIFFICULTIES)

const slug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "must be kebab-case")
const nonEmpty = z.string().trim().min(1)

/** content/<module>/module.yaml */
export const moduleSchema = z.object({
  title: nonEmpty,
  part: z.number().int().min(0),
  order: z.number().int().min(0),
  description: nonEmpty,
  /** A lucide icon, or a tech logo (python … llm) drawn by <TechLogo>. */
  icon: z.enum([
    "compass",
    "code",
    "server",
    "container",
    "flame",
    "brain",
    "sparkles",
    "python",
    "django",
    "fastapi",
    "git",
    "docker",
    "pytorch",
    "ml",
    "llm",
  ]),
  /** Prefix for problem/interview IDs in this module, e.g. "py" → py-p-001, py-i-001 */
  idPrefix: z.string().regex(/^[a-z]{2,4}$/),
  /** Minimum content counts promised by the part plan, checked by `pnpm verify:content`. */
  targets: z
    .object({
      lessons: z.number().int().positive().optional(),
      problems: z.number().int().positive().optional(),
      interview: z.number().int().positive().optional(),
      /** Minimum per difficulty tier (easy, simple, medium, hard). */
      problemsPerDifficulty: z.number().int().positive().optional(),
      interviewPerDifficulty: z.number().int().positive().optional(),
    })
    .strict()
    .optional(),
})
export type ModuleMeta = z.infer<typeof moduleSchema>

/** Frontmatter of content/<module>/lessons/NN-slug.mdx */
export const lessonFrontmatterSchema = z.object({
  title: nonEmpty,
  summary: nonEmpty,
  estimatedMinutes: z.number().int().positive(),
  difficulty: difficultySchema,
  objectives: z.array(nonEmpty).min(1).max(6),
  prerequisites: z.array(nonEmpty).default([]),
  tags: z.array(slug).default([]),
  /** Optional group heading in the sidebar and module page; lessons of a section must be contiguous. */
  section: nonEmpty.max(40).optional(),
  /** Related practice problems and interview questions of the same module, shown after the lesson. */
  practice: z.array(z.string().regex(/^[a-z]{2,4}-p-\d{3}$/)).default([]),
  interview: z.array(z.string().regex(/^[a-z]{2,4}-i-\d{3}$/)).default([]),
})
export type LessonFrontmatter = z.infer<typeof lessonFrontmatterSchema>

/** Frontmatter of content/<module>/projects/NN-slug.mdx (a guided build of real code). */
export const projectFrontmatterSchema = z.object({
  title: nonEmpty,
  summary: nonEmpty,
  /** "guided": a small project; "capstone": the big one that uses the whole module. */
  kind: z.enum(["guided", "capstone"]),
  difficulty: difficultySchema,
  estimatedHours: z.number().positive(),
  /** Folder under projects/<module>/ that holds the project's real, tested code. */
  code: slug,
  skills: z.array(nonEmpty).min(1).max(12),
})
export type ProjectFrontmatter = z.infer<typeof projectFrontmatterSchema>

const codeSchema = z.object({
  language: z.enum([
    "python",
    "bash",
    "typescript",
    "javascript",
    "sql",
    "dockerfile",
    "yaml",
    "json",
    "text",
  ]),
  code: nonEmpty,
})

/** content/<module>/problems/<id>.yaml */
export const problemSchema = z.object({
  id: z.string().regex(/^[a-z]{2,4}-p-\d{3}$/),
  title: nonEmpty,
  difficulty: difficultySchema,
  tags: z.array(slug).min(1),
  statement: nonEmpty,
  constraints: z.array(nonEmpty).default([]),
  examples: z
    .array(z.object({ input: nonEmpty, output: nonEmpty, explanation: z.string().optional() }))
    .min(1),
  hints: z.array(nonEmpty).min(1),
  solution: codeSchema.extend({
    /** Markdown shown BELOW the code. */
    explanation: nonEmpty,
  }),
  complexity: z.object({ time: nonEmpty, space: nonEmpty }),
  variations: z.array(nonEmpty).default([]),
  /** Extra Python appended to the solution by `pnpm verify:code` (asserts). Not shown to learners. */
  verify: z.string().optional(),
})
export type Problem = z.infer<typeof problemSchema>

/** content/<module>/interview/<id>.yaml */
export const interviewSchema = z.object({
  id: z.string().regex(/^[a-z]{2,4}-i-\d{3}$/),
  question: nonEmpty,
  difficulty: difficultySchema,
  tags: z.array(slug).min(1),
  shortAnswer: nonEmpty,
  detailedAnswer: nonEmpty,
  code: codeSchema.optional(),
  pitfalls: z.array(nonEmpty).default([]),
  followUps: z.array(nonEmpty).default([]),
  verify: z.string().optional(),
})
export type InterviewQuestion = z.infer<typeof interviewSchema>
