"use client"

import { useCallback, useSyncExternalStore } from "react"

/**
 * Progress + bookmarks live in the browser (no login in v1, see soul.md §14).
 * Every storage access is guarded: private mode or blocked storage degrades to
 * in-memory state for the current tab instead of crashing.
 */

export type ItemType = "lesson" | "problem" | "interview"
/** e.g. "lesson:start-here/how-this-notebook-works", "problem:sh-p-001" */
export type ItemKey = `${ItemType}:${string}`
export type Bookmark = { key: ItemKey; title: string; href: string; savedAt: number }

export const PROGRESS_KEY = "ndn:progress:v1"
export const BOOKMARKS_KEY = "ndn:bookmarks:v1"

function safeRead<T>(key: string, fallback: T, isValid: (v: unknown) => v is T): T {
  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) return fallback
    const parsed: unknown = JSON.parse(raw)
    return isValid(parsed) ? parsed : fallback
  } catch {
    return fallback
  }
}

function safeWrite(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Quota exceeded or storage blocked: state still updates in memory.
  }
}

/** Minimal external store with a stable snapshot (required by useSyncExternalStore). */
export function createLocalStore<T>(key: string, fallback: T, isValid: (v: unknown) => v is T) {
  let cache: T | undefined
  const listeners = new Set<() => void>()
  const emit = () => listeners.forEach((l) => l())

  const get = (): T => (cache ??= safeRead(key, fallback, isValid))
  const set = (next: T) => {
    cache = next
    safeWrite(key, next)
    emit()
  }
  const subscribe = (listener: () => void) => {
    listeners.add(listener)
    const onStorage = (e: StorageEvent) => {
      if (e.key === key) {
        cache = undefined // another tab changed it
        emit()
      }
    }
    window.addEventListener("storage", onStorage)
    return () => {
      listeners.delete(listener)
      window.removeEventListener("storage", onStorage)
    }
  }
  return { get, set, subscribe, getServer: () => fallback, reset: () => (cache = undefined) }
}

const isStringArray = (v: unknown): v is string[] =>
  Array.isArray(v) && v.every((x) => typeof x === "string")
const isBookmarkArray = (v: unknown): v is Bookmark[] =>
  Array.isArray(v) &&
  v.every(
    (b) =>
      typeof b === "object" &&
      b !== null &&
      typeof (b as Bookmark).key === "string" &&
      typeof (b as Bookmark).href === "string" &&
      typeof (b as Bookmark).title === "string",
  )

const EMPTY: string[] = []
const NO_BOOKMARKS: Bookmark[] = []
export const progressStore = createLocalStore<string[]>(PROGRESS_KEY, EMPTY, isStringArray)
export const bookmarkStore = createLocalStore<Bookmark[]>(
  BOOKMARKS_KEY,
  NO_BOOKMARKS,
  isBookmarkArray,
)

export function useProgress() {
  const done = useSyncExternalStore(
    progressStore.subscribe,
    progressStore.get,
    progressStore.getServer,
  )
  const isDone = useCallback((key: ItemKey) => done.includes(key), [done])
  const toggleDone = useCallback((key: ItemKey) => {
    const cur = progressStore.get()
    progressStore.set(cur.includes(key) ? cur.filter((k) => k !== key) : [...cur, key])
  }, [])
  return { done, isDone, toggleDone }
}

export function useBookmarks() {
  const bookmarks = useSyncExternalStore(
    bookmarkStore.subscribe,
    bookmarkStore.get,
    bookmarkStore.getServer,
  )
  const isBookmarked = useCallback(
    (key: ItemKey) => bookmarks.some((b) => b.key === key),
    [bookmarks],
  )
  const toggleBookmark = useCallback((b: Omit<Bookmark, "savedAt">) => {
    const cur = bookmarkStore.get()
    bookmarkStore.set(
      cur.some((x) => x.key === b.key)
        ? cur.filter((x) => x.key !== b.key)
        : [{ ...b, savedAt: Date.now() }, ...cur],
    )
  }, [])
  return { bookmarks, isBookmarked, toggleBookmark }
}
