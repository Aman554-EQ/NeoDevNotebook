import { ModuleTree } from "@/components/layout/module-tree"
import { getNavTree } from "@/lib/content"

/** Learn / Practice / Interview pages share the left module tree (drawer on mobile, in TopBar). */
export default async function NotebookLayout({ children }: { children: React.ReactNode }) {
  const modules = await getNavTree()
  return (
    <div className="mx-auto max-w-[90rem] lg:grid lg:grid-cols-[17rem_minmax(0,1fr)]">
      <aside
        aria-label="Module navigation"
        className="border-rule sticky top-16 hidden h-[calc(100dvh-4rem)] overflow-y-auto border-r px-3 py-6 lg:block"
      >
        <ModuleTree modules={modules} />
      </aside>
      <div className="min-w-0 px-4 py-8 sm:px-8 lg:py-10">{children}</div>
    </div>
  )
}
