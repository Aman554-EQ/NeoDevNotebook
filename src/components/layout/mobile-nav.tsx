"use client"

import Link from "next/link"
import { useState } from "react"
import { Dialog } from "radix-ui"
import { Menu, X } from "lucide-react"
import type { NavModule } from "@/lib/content"
import { ModuleTree } from "./module-tree"
import { PRIMARY_LINKS } from "./top-bar-links"

/** Drawer navigation for small screens. Radix handles focus trap, Esc and scroll lock. */
export function MobileNav({ modules }: { modules: NavModule[] }) {
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)
  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger
        aria-label="Open navigation"
        data-testid="mobile-nav-trigger"
        className="text-muted hover:bg-surface-2 hover:text-ink inline-flex size-10 items-center justify-center rounded-[var(--radius-control)] lg:hidden"
      >
        <Menu className="size-5" aria-hidden />
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/40" />
        <Dialog.Content
          data-testid="mobile-nav"
          className="border-rule bg-bg fixed inset-y-0 left-0 z-50 flex w-[min(20rem,88vw)] flex-col border-r shadow-xl"
        >
          <div className="border-rule flex items-center justify-between border-b px-4 py-3">
            <Dialog.Title className="font-display text-lg font-semibold">Navigate</Dialog.Title>
            <Dialog.Close
              aria-label="Close navigation"
              className="hover:bg-surface-2 inline-flex size-10 items-center justify-center rounded-[var(--radius-control)]"
            >
              <X className="size-5" aria-hidden />
            </Dialog.Close>
          </div>
          <Dialog.Description className="sr-only">
            Site sections and module lessons
          </Dialog.Description>
          <div className="flex-1 overflow-y-auto px-3 py-4">
            <ul className="mb-4 grid grid-cols-2 gap-1 text-sm">
              {PRIMARY_LINKS.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    onClick={close}
                    className="bg-surface-2 hover:bg-accent-soft block rounded-[var(--radius-control)] px-3 py-2 font-medium"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
            <ModuleTree modules={modules} onNavigate={close} />
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
