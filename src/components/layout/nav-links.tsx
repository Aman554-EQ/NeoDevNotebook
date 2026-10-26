"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { PRIMARY_LINKS } from "./top-bar-links"

export function NavLinks() {
  const pathname = usePathname()
  return (
    <nav aria-label="Primary" className="hidden lg:block">
      <ul className="flex items-center gap-1 text-[0.95rem]">
        {PRIMARY_LINKS.map((l) => {
          const active = pathname === l.href || pathname.startsWith(`${l.href}/`)
          return (
            <li key={l.href}>
              <Link
                href={l.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "text-muted hover:bg-surface-2 hover:text-ink rounded-[var(--radius-control)] px-3 py-2",
                  active && "text-ink font-medium",
                )}
              >
                {l.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
