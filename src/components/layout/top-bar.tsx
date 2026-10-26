import Link from "next/link"
import { getNavTree } from "@/lib/content"
import { SITE_NAME } from "@/lib/utils"
import { SearchDialog } from "@/components/search/search-dialog"
import { MobileNav } from "./mobile-nav"
import { NavLinks } from "./nav-links"
import { ThemeToggle } from "./theme-toggle"

export async function TopBar() {
  const modules = await getNavTree()
  return (
    <header className="border-rule bg-bg/85 sticky top-0 z-30 border-b backdrop-blur">
      <div className="mx-auto flex h-16 max-w-[90rem] items-center gap-2 px-4 sm:px-6">
        <MobileNav modules={modules} />
        <Link
          href="/"
          className="font-display mr-2 flex items-center gap-2 text-lg font-semibold tracking-tight"
        >
          <span
            aria-hidden
            className="bg-accent text-accent-ink grid size-8 place-items-center rounded-lg font-mono text-sm font-bold"
          >
            N
          </span>
          <span className="max-[380px]:sr-only">{SITE_NAME}</span>
        </Link>
        <NavLinks />
        <div className="ml-auto flex items-center gap-1">
          <SearchDialog />
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
