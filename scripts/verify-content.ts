/**
 * `pnpm verify:content` — validates every content file and compiles every lesson's MDX,
 * then writes all runnable code samples to .cache/code-samples.json for `pnpm verify:code`.
 */
import fs from "node:fs"
import path from "node:path"
import { compile } from "@mdx-js/mdx"
import remarkGfm from "remark-gfm"
import remarkMath from "remark-math"
import { loadAllContent } from "../src/lib/content/load"
import { extractSamples } from "../src/lib/content/samples"

async function main() {
  const bundles = loadAllContent() // throws with file + field on any invalid content

  for (const b of bundles) {
    for (const l of b.lessons) {
      try {
        await compile(l.body, { remarkPlugins: [remarkGfm, remarkMath] })
      } catch (err) {
        throw new Error(`MDX error in ${l.file}:\n${String(err)}`)
      }
    }
  }

  const samples = extractSamples(bundles)
  const out = path.join(process.cwd(), ".cache", "code-samples.json")
  fs.mkdirSync(path.dirname(out), { recursive: true })
  fs.writeFileSync(out, JSON.stringify(samples, null, 2))

  for (const b of bundles) {
    console.log(
      `✓ ${b.module.slug}: ${b.lessons.length} lessons, ${b.problems.length} problems, ${b.interview.length} interview questions`,
    )
  }
  console.log(`✓ ${samples.length} code samples written to .cache/code-samples.json`)
}

main().catch((err) => {
  console.error(String(err instanceof Error ? err.message : err))
  process.exit(1)
})
