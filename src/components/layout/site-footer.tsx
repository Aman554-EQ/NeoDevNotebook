import Link from "next/link"
import { Logo } from "@/components/brand/logo"
import { TechLogo } from "@/components/brand/tech-logo"
import { GITHUB_URL, SITE_NAME } from "@/lib/utils"
import { SubscribeForm } from "./subscribe-form"

// A fixed year keeps every page fully static (reading the clock would make pages dynamic).
const COPYRIGHT_YEAR = 2026

/** Minimal footer: brand, GitHub, newsletter box, copyright. */
export function SiteFooter() {
  return (
    <footer className="border-rule bg-bg relative border-t" data-testid="site-footer">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6 md:flex-row md:items-start md:justify-between">
        <div className="max-w-xs">
          <Link href="/" aria-label={`${SITE_NAME} home`} className="inline-flex">
            <Logo className="text-lg" />
          </Link>
          <p className="text-muted mt-3 text-sm">
            Concept, visual, example, practice: a notebook for learning to build software.
          </p>
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noreferrer"
            className="text-muted hover:text-ink mt-4 inline-flex items-center gap-2 text-sm font-medium"
          >
            <TechLogo name="github" tone="current" className="size-4" />
            GitHub
          </a>
        </div>
        <SubscribeForm />
      </div>
      <div className="border-rule border-t">
        <p className="text-muted mx-auto max-w-6xl px-4 py-4 text-xs sm:px-6">
          © {COPYRIGHT_YEAR} {SITE_NAME}. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
