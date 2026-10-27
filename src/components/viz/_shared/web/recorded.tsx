import { highlight } from "@/lib/mdx/highlight"
import { loadRecording } from "@/lib/recording/load"
import { HttpExchangeView } from "./http-exchange-view"
import { OrmSqlView } from "./orm-sql-view"
import { SqlPlaygroundView } from "./sql-playground-view"

/**
 * Visuals driven by recordings (content/<module>/recordings/<name>.json, made by `pnpm record`).
 * Loading and highlighting happen at build time; the client only switches between steps.
 * The lesson page binds `module`, so MDX writes <HttpExchange recording="…" title="…" caption="…" />.
 */
type Props = { module: string; recording: string; title?: string; caption: string }

const lang = (body: string) => (/^\s*[[{]/.test(body) ? "json" : "text")

export async function HttpExchange({ module, recording, title, caption }: Props) {
  const rec = loadRecording(module, recording, "http")
  const bodies = await Promise.all(
    rec.steps.map(async (s) => ({
      request: s.request.body ? await highlight(s.request.body, "json") : null,
      response: s.response.body ? await highlight(s.response.body, lang(s.response.body)) : null,
    })),
  )
  return (
    <HttpExchangeView
      title={title ?? rec.title}
      caption={caption}
      steps={rec.steps}
      bodies={bodies}
    />
  )
}

export async function OrmToSql({ module, recording, title, caption }: Props) {
  const rec = loadRecording(module, recording, "orm")
  const code = await Promise.all(
    rec.steps.map(async (s) => ({
      python: await highlight(s.python, "python"),
      sql: await Promise.all(s.sql.map((q) => highlight(formatSql(q), "sql"))),
    })),
  )
  return <OrmSqlView title={title ?? rec.title} caption={caption} steps={rec.steps} code={code} />
}

export async function SqlPlayground({ module, recording, title, caption }: Props) {
  const rec = loadRecording(module, recording, "sql")
  const sql = await Promise.all(rec.steps.map((s) => highlight(s.sql, "sql")))
  return (
    <SqlPlaygroundView
      title={title ?? rec.title}
      caption={caption}
      tables={rec.tables}
      steps={rec.steps}
      sql={sql}
    />
  )
}

/** Puts the main clauses of Django's one-line SQL on their own lines so it reads like a query. */
export function formatSql(sql: string): string {
  return sql
    .replace(
      / (FROM|WHERE|INNER JOIN|LEFT OUTER JOIN|GROUP BY|HAVING|ORDER BY|LIMIT|VALUES|SET|RETURNING) /g,
      "\n$1 ",
    )
    .trim()
}
