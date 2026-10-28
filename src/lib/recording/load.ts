import fs from "node:fs"
import path from "node:path"
import { z } from "zod"

/** Recordings are made by `pnpm record` from content/<module>/recordings/<name>.py. */

const httpStep = z.object({
  label: z.string(),
  note: z.string(),
  request: z.object({
    method: z.string(),
    url: z.string(),
    headers: z.record(z.string(), z.string()),
    body: z.string().nullable(),
  }),
  response: z.object({
    status: z.number().int(),
    reason: z.string(),
    headers: z.record(z.string(), z.string()),
    body: z.string(),
    size: z.number().int(),
  }),
})

const ormStep = z.object({
  label: z.string(),
  note: z.string(),
  python: z.string(),
  sql: z.array(z.string()),
  result: z.string(),
})

const cell = z.union([z.string(), z.number(), z.null()])
const sqlTable = z.object({
  name: z.string(),
  columns: z.array(z.string()),
  rows: z.array(z.array(cell)),
})
const sqlStep = z.object({
  label: z.string(),
  note: z.string(),
  sql: z.string(),
  /** Tables the query reads (highlighted while the step is shown). */
  uses: z.array(z.string()),
  columns: z.array(z.string()),
  rows: z.array(z.array(cell)),
})

export const recordingSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("http"), title: z.string(), steps: z.array(httpStep).min(1) }),
  z.object({ kind: z.literal("orm"), title: z.string(), steps: z.array(ormStep).min(1) }),
  z.object({
    kind: z.literal("sql"),
    title: z.string(),
    tables: z.array(sqlTable).min(1),
    steps: z.array(sqlStep).min(1),
  }),
])
export type Recording = z.infer<typeof recordingSchema>
export type HttpStep = z.infer<typeof httpStep>
export type OrmStep = z.infer<typeof ormStep>
export type SqlStep = z.infer<typeof sqlStep>
export type SqlTable = z.infer<typeof sqlTable>

const CONTENT_DIR = path.join(process.cwd(), "content")

export function loadRecording<K extends Recording["kind"]>(
  moduleSlug: string,
  name: string,
  kind: K,
  root = CONTENT_DIR,
): Extract<Recording, { kind: K }> {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(name)) throw new Error(`Invalid recording "${name}"`)
  const file = path.join(root, moduleSlug, "recordings", `${name}.json`)
  if (!fs.existsSync(/*turbopackIgnore: true*/ file)) {
    throw new Error(`Recording not found: ${file}. Add ${name}.py and run \`pnpm record\`.`)
  }
  const parsed = recordingSchema.safeParse(
    JSON.parse(fs.readFileSync(/*turbopackIgnore: true*/ file, "utf8")),
  )
  if (!parsed.success) throw new Error(`Invalid recording ${file}: ${parsed.error.message}`)
  if (parsed.data.kind !== kind) {
    throw new Error(`Recording ${file} is "${parsed.data.kind}", expected "${kind}"`)
  }
  return parsed.data as Extract<Recording, { kind: K }>
}
