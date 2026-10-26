import { getDb } from "@/db/client"
import { MAX_QUERY_LENGTH, searchContent } from "@/lib/search/query"

export async function GET(request: Request) {
  const q = new URL(request.url).searchParams.get("q") ?? ""
  if (q.length > MAX_QUERY_LENGTH * 2) {
    return Response.json({ error: "Query too long" }, { status: 400 })
  }
  try {
    const hits = await searchContent(getDb(), q)
    return Response.json({ hits })
  } catch (err) {
    console.error("[search]", err)
    return Response.json({ error: "database unreachable" }, { status: 503 })
  }
}
