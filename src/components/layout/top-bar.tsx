import Link from "next/link"
import { getNavTree } from "@/lib/content"
import { SITE_NAME } from "@/lib/utils"
import { Logo } from "@/components/brand/logo"
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
        <Link href="/" aria-label={`${SITE_NAME} home`} className="mr-2 flex items-center">
          <Logo compact className="text-lg" />
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
