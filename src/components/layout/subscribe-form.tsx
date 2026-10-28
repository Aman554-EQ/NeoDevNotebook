"use client"

import { useActionState } from "react"
import { Mail } from "lucide-react"
import { subscribe, type SubscribeState } from "@/app/actions/subscribe"
import { cn } from "@/lib/utils"

const initial: SubscribeState = { status: "idle", message: "" }

/** Email box + button for the footer newsletter (see subscribe action). */
export function SubscribeForm() {
  const [state, action, pending] = useActionState(subscribe, initial)
  return (
    <form action={action} className="w-full sm:max-w-sm" data-testid="subscribe">
      <label htmlFor="subscribe-email" className="text-ink text-sm font-semibold">
        Get new modules by email
      </label>
      <div className="mt-2 flex gap-2">
        <div className="relative min-w-0 flex-1">
          <Mail
            className="text-muted pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
            aria-hidden
          />
          <input
            id="subscribe-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
            aria-describedby="subscribe-status"
            className="border-rule bg-surface placeholder:text-muted focus:border-accent h-10 w-full rounded-[var(--radius-control)] border pr-3 pl-9 text-sm outline-none"
          />
        </div>
        {/* Honeypot: hidden from people and assistive tech; bots fill it in. */}
        <input
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden
          className="hidden"
        />
        <button
          type="submit"
          disabled={pending}
          className="bg-accent text-accent-ink h-10 shrink-0 rounded-[var(--radius-control)] px-4 text-sm font-medium hover:opacity-90 disabled:opacity-60"
        >
          {pending ? "Subscribing…" : "Subscribe"}
        </button>
      </div>
      <p
        id="subscribe-status"
        aria-live="polite"
        className={cn(
          "mt-2 min-h-5 text-xs",
          state.status === "ok" && "text-easy",
          state.status === "error" && "text-hard",
          state.status === "idle" && "text-muted",
        )}
      >
        {state.message || "No spam: only new modules and big updates."}
      </p>
    </form>
  )
}
