import { sql } from "drizzle-orm"
import type { Db } from "@/db/client"

export type SearchHit = {
  type: "lesson" | "problem" | "interview"
  title: string
  module: string
  href: string
  snippet: string
  rank: number
}

export const MAX_QUERY_LENGTH = 100

/** Ranked full-text search across lessons, problems and interview questions. */
export async function searchContent(db: Db, rawQuery: string, limit = 12): Promise<SearchHit[]> {
  const q = rawQuery.trim().slice(0, MAX_QUERY_LENGTH)
  if (q.length < 2) return []
  // Prefix-match the last word so results appear while typing ("lis" → "list").
  const words = q.match(/[\p{L}\p{N}_]+/gu) ?? []
  if (!words.length) return []
  const prefixQuery = words.map((w, i) => (i === words.length - 1 ? `${w}:*` : w)).join(" & ")

  const rows = await db.execute<{
    type: SearchHit["type"]
    title: string
    module: string
    path: string
    snippet: string
    rank: number
  }>(sql`
    with query as (select to_tsquery('english', ${prefixQuery}) as tsq)
    select 'lesson' as type, l.title, m.slug as module, l.slug as path,
           ts_headline('english', l.summary, query.tsq, 'MaxWords=24,MinWords=8') as snippet,
           ts_rank(l.search, query.tsq) as rank
      from lessons l join modules m on m.id = l.module_id, query
     where l.search @@ query.tsq
    union all
    select 'problem', p.title, m.slug, p.id,
           ts_headline('english', p.statement, query.tsq, 'MaxWords=24,MinWords=8'),
           ts_rank(p.search, query.tsq)
      from problems p join modules m on m.id = p.module_id, query
     where p.search @@ query.tsq
    union all
    select 'interview', i.question, m.slug, i.id,
           ts_headline('english', i.short_answer, query.tsq, 'MaxWords=24,MinWords=8'),
           ts_rank(i.search, query.tsq)
      from interview_questions i join modules m on m.id = i.module_id, query
     where i.search @@ query.tsq
    order by rank desc
    limit ${limit}
  `)

  const base = { lesson: "learn", problem: "practice", interview: "interview" } as const
  return rows.map((r) => ({
    type: r.type,
    title: r.title,
    module: r.module,
    href: `/${base[r.type]}/${r.module}/${r.path}`,
    // ts_headline wraps matches in <b>…</b>; the UI splits on those markers and renders text only.
    snippet: r.snippet,
    rank: Number(r.rank),
  }))
}
