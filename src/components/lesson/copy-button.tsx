"use client"

import { useEffect, useState } from "react"
import { Check, Copy } from "lucide-react"
import { cn } from "@/lib/utils"

/** Copies text with the Clipboard API, falling back to execCommand for older/insecure contexts. */
export async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch {
    // fall through to the legacy path
  }
  try {
    const ta = document.createElement("textarea")
    ta.value = text
    ta.setAttribute("readonly", "")
    ta.style.position = "fixed"
    ta.style.opacity = "0"
    document.body.appendChild(ta)
    ta.select()
    const ok = document.execCommand("copy")
    ta.remove()
    return ok
  } catch {
    return false
  }
}

export function CopyButton({ text, label = "Copy code" }: { text: string; label?: string }) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle")

  useEffect(() => {
    if (state === "idle") return
    const t = setTimeout(() => setState("idle"), 2000)
    return () => clearTimeout(t)
  }, [state])

  return (
    <button
      type="button"
      onClick={async () => setState((await copyText(text)) ? "copied" : "failed")}
      aria-label={label}
      data-testid="copy-button"
      className={cn(
        "text-muted hover:bg-surface hover:text-ink inline-flex items-center gap-1.5 rounded-[var(--radius-control)] px-2 py-1 text-xs font-medium",
        state === "copied" && "text-easy",
      )}
    >
      {state === "copied" ? (
        <Check className="size-3.5" aria-hidden />
      ) : (
        <Copy className="size-3.5" aria-hidden />
      )}
      <span aria-live="polite">
        {state === "copied" ? "Copied!" : state === "failed" ? "Press Ctrl+C" : "Copy"}
      </span>
    </button>
  )
}
