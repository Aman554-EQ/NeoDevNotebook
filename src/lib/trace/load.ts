import fs from "node:fs"
import path from "node:path"
import { z } from "zod"
import type { Trace } from "./narrate"

const stepSchema = z.object({
  line: z.number().int().positive(),
  event: z.enum(["line", "call", "return", "exception", "yield", "resume"]),
  frames: z.array(
    z.object({ name: z.string(), locals: z.array(z.tuple([z.string(), z.string()])) }),
  ),
  stdout: z.string(),
  returnValue: z.string().optional(),
  exception: z.string().optional(),
})
const traceSchema = z.object({
  version: z.literal(1),
  python: z.string(),
  source: z.string(),
  steps: z.array(stepSchema).min(1),
  stdout: z.string(),
  truncated: z.boolean(),
  error: z.string().optional(),
})

const CONTENT_DIR = path.join(process.cwd(), "content")

/** Reads content/<module>/traces/<name>.trace.json (recorded by `pnpm traces`). */
export function loadTrace(moduleSlug: string, name: string, root = CONTENT_DIR): Trace {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(name)) throw new Error(`Invalid trace name "${name}"`)
  const file = path.join(root, moduleSlug, "traces", `${name}.trace.json`)
  if (!fs.existsSync(/*turbopackIgnore: true*/ file)) {
    throw new Error(`Trace not found: ${file}. Add ${name}.py and run \`pnpm traces\`.`)
  }
  const parsed = traceSchema.safeParse(
    JSON.parse(fs.readFileSync(/*turbopackIgnore: true*/ file, "utf8")),
  )
  if (!parsed.success) throw new Error(`Invalid trace ${file}: ${parsed.error.message}`)
  return parsed.data as Trace
}
