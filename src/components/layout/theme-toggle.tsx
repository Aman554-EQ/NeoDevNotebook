"use client"

import { Moon, Sun } from "lucide-react"
import { THEME_STORAGE_KEY } from "./theme-script"

export function ThemeToggle() {
  function toggle() {
    const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark"
    document.documentElement.dataset.theme = next
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next)
    } catch {
      // Storage blocked (private mode): the theme still applies for this page view.
    }
  }

  // Both icons are rendered and CSS picks one, so server and client markup always match.
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle dark theme"
      data-testid="theme-toggle"
      className="text-muted hover:bg-surface-2 hover:text-ink inline-flex size-10 items-center justify-center rounded-[var(--radius-control)]"
    >
      <Moon className="size-5 dark:hidden" aria-hidden />
      <Sun className="hidden size-5 dark:block" aria-hidden />
    </button>
  )
}
