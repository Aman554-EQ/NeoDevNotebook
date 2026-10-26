import type { Metadata } from "next"
import { BookmarkList } from "@/components/progress/bookmark-list"

export const metadata: Metadata = { title: "Bookmarks" }

export default function BookmarksPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-3xl font-semibold sm:text-4xl">Bookmarks</h1>
      <p className="text-muted mt-2 mb-8">Saved in this browser only.</p>
      <BookmarkList />
    </main>
  )
}
