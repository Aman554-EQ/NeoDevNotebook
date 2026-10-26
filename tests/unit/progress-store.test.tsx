import { act, render, renderHook, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"
import { BookmarkButton, DoneToggle } from "@/components/progress/progress-buttons"
import {
  BOOKMARKS_KEY,
  PROGRESS_KEY,
  bookmarkStore,
  createLocalStore,
  progressStore,
  useBookmarks,
  useProgress,
} from "@/lib/progress/store"

afterEach(() => {
  progressStore.reset()
  bookmarkStore.reset()
  vi.restoreAllMocks()
})

describe("progress store", () => {
  it("toggles done state and persists it to localStorage", () => {
    const { result } = renderHook(() => useProgress())
    act(() => result.current.toggleDone("lesson:m/a"))
    expect(result.current.isDone("lesson:m/a")).toBe(true)
    expect(JSON.parse(localStorage.getItem(PROGRESS_KEY)!)).toEqual(["lesson:m/a"])
    act(() => result.current.toggleDone("lesson:m/a"))
    expect(result.current.isDone("lesson:m/a")).toBe(false)
  })

  it("reads existing progress and ignores corrupted data", () => {
    localStorage.setItem(PROGRESS_KEY, '["problem:x"]')
    expect(renderHook(() => useProgress()).result.current.isDone("problem:x")).toBe(true)

    progressStore.reset()
    localStorage.setItem(PROGRESS_KEY, "{not json")
    expect(renderHook(() => useProgress()).result.current.done).toEqual([])

    progressStore.reset()
    localStorage.setItem(PROGRESS_KEY, '{"wrong":"shape"}')
    expect(renderHook(() => useProgress()).result.current.done).toEqual([])
  })

  it("keeps working in memory when storage throws (private mode)", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("SecurityError")
    })
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("QuotaExceededError")
    })
    const store = createLocalStore<string[]>("k", [], (v): v is string[] => Array.isArray(v))
    expect(store.get()).toEqual([])
    store.set(["a"])
    expect(store.get()).toEqual(["a"])
  })

  it("bookmarks: add newest first, then remove", () => {
    const { result } = renderHook(() => useBookmarks())
    act(() => result.current.toggleBookmark({ key: "problem:a", title: "A", href: "/a" }))
    act(() => result.current.toggleBookmark({ key: "problem:b", title: "B", href: "/b" }))
    expect(result.current.bookmarks.map((b) => b.key)).toEqual(["problem:b", "problem:a"])
    act(() => result.current.toggleBookmark({ key: "problem:a", title: "A", href: "/a" }))
    expect(result.current.isBookmarked("problem:a")).toBe(false)
    expect(JSON.parse(localStorage.getItem(BOOKMARKS_KEY)!)).toHaveLength(1)
  })
})

describe("progress buttons", () => {
  it("DoneToggle reflects and flips state with aria-pressed", async () => {
    render(<DoneToggle itemKey="lesson:m/a" />)
    const btn = screen.getByRole("button", { name: "Mark as done" })
    expect(btn).toHaveAttribute("aria-pressed", "false")
    await userEvent.click(btn)
    expect(screen.getByRole("button", { name: "Completed" })).toHaveAttribute(
      "aria-pressed",
      "true",
    )
  })

  it("BookmarkButton saves title and href", async () => {
    render(<BookmarkButton itemKey="interview:q1" title="Q1" href="/interview/m/q1" />)
    await userEvent.click(screen.getByRole("button", { name: "Bookmark" }))
    expect(bookmarkStore.get()[0]).toMatchObject({
      key: "interview:q1",
      title: "Q1",
      href: "/interview/m/q1",
    })
  })
})
