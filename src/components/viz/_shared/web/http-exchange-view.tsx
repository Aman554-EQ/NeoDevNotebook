"use client"

import type { HttpStep } from "@/lib/recording/load"
import { cn } from "@/lib/utils"
import { VizFrame, useViz } from "../viz-frame"
import { CodeHtml, HeaderList, MethodPill, statusTone } from "./parts"

type Bodies = { request: string | null; response: string | null }[]

/** A Postman-style request/response viewer that replays recorded exchanges one by one. */
export function HttpExchangeView({
  title,
  caption,
  steps,
  bodies,
}: {
  title: string
  caption: string
  steps: HttpStep[]
  bodies: Bodies
}) {
  return (
    <VizFrame
      title={title}
      caption={caption}
      steps={steps.map((s) => ({ label: s.label, narration: s.note }))}
      intervalMs={3200}
      badge="Recorded · real responses"
    >
      <Exchange steps={steps} bodies={bodies} />
    </VizFrame>
  )
}

function Exchange({ steps, bodies }: { steps: HttpStep[]; bodies: Bodies }) {
  const { step } = useViz()
  const { request, response } = steps[step]!
  const body = bodies[step]!
  return (
    <div className="space-y-3 p-3 sm:p-4" data-testid="http-exchange">
      <div className="border-rule bg-surface flex min-w-0 items-center gap-2 rounded-md border px-2 py-1.5">
        <MethodPill method={request.method} />
        <code className="min-w-0 flex-1 truncate font-mono text-xs sm:text-sm" title={request.url}>
          {request.url}
        </code>
        <span
          data-testid="http-status"
          className={cn(
            "shrink-0 rounded px-1.5 py-0.5 font-mono text-xs font-semibold",
            statusTone(response.status),
          )}
        >
          {response.status} {response.reason}
        </span>
      </div>
      <div className="grid gap-3 lg:grid-cols-2">
        <section aria-label="Request" className="min-w-0 space-y-2">
          <h4 className="text-muted text-xs font-semibold tracking-wide uppercase">Request</h4>
          <HeaderList headers={request.headers} empty="No extra headers" />
          {body.request ? (
            <CodeHtml html={body.request} label="Request body" />
          ) : (
            <p className="text-muted text-xs italic">No body</p>
          )}
        </section>
        <section aria-label="Response" className="min-w-0 space-y-2">
          <h4 className="text-muted flex justify-between text-xs font-semibold tracking-wide uppercase">
            <span>Response</span>
            <span className="font-mono normal-case">{response.size} B</span>
          </h4>
          <HeaderList headers={response.headers} empty="No notable headers" />
          {body.response ? (
            <CodeHtml html={body.response} label="Response body" className="max-h-72" />
          ) : (
            <p className="text-muted text-xs italic">Empty body</p>
          )}
        </section>
      </div>
    </div>
  )
}
