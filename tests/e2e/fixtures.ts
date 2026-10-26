import { test as base, expect, type Page, type TestInfo } from "@playwright/test"
import { loadAllContent } from "../../src/lib/content/load"
import { parseFences } from "../../src/lib/content/samples"

/**
 * Every test fails if the page logs a console error or throws, unless the test
 * explicitly allows a message (e.g. the expected 404 resource on a not-found page).
 */
export const test = base.extend<{ console: { allow: (pattern: RegExp) => void } }>({
  console: [
    async ({ page }, use) => {
      const errors: string[] = []
      const allowed: RegExp[] = []
      page.on("console", (m) => {
        if (m.type() === "error") errors.push(m.text())
      })
      page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`))
      await use({ allow: (p) => allowed.push(p) })
      expect(
        errors.filter((e) => !allowed.some((p) => p.test(e))),
        "console errors",
      ).toEqual([])
    },
    { auto: true },
  ],
})
export { expect }

export const width = (info: TestInfo) => info.project.use.viewport?.width ?? 1440
export const isDesktop = (info: TestInfo) => width(info) >= 1024

export const content = loadAllContent()
export const startHere = content.find((b) => b.module.slug === "start-here")!

/** First fenced block of a language in a lesson, exactly as the CodeBlock copies it. */
export function lessonCode(lessonSlug: string, lang = "python", index = 0) {
  const lesson = startHere.lessons.find((l) => l.slug === lessonSlug)!
  const block = parseFences(lesson.body).filter((b) => b.lang === lang)[index]!
  return block.code.replace(/\n+$/, "")
}

export async function readClipboard(page: Page) {
  // Chromium on Windows stores CRLF line endings on the clipboard; compare content, not platform newlines.
  return (await page.evaluate(() => navigator.clipboard.readText())).replace(/\r\n/g, "\n")
}

export const ALL_PAGES = [
  "/",
  "/learn",
  "/learn/start-here",
  "/learn/start-here/how-this-notebook-works",
  "/learn/start-here/why-append-is-fast",
  "/practice",
  "/practice/start-here",
  "/practice/start-here/sh-p-001",
  "/interview",
  "/interview/start-here",
  "/interview/start-here/sh-i-002",
  "/progress",
  "/bookmarks",
]
