import { expect, isDesktop, lessonCode, readClipboard, test, width } from "../fixtures"

const LESSON_1 = "/learn/start-here/how-this-notebook-works"
const LESSON_2 = "/learn/start-here/why-append-is-fast"

test.describe("lesson page", () => {
  test("renders the lesson template sections", async ({ page }) => {
    await page.goto(LESSON_1)
    await expect(page.getByRole("heading", { name: "You will be able to" })).toBeVisible()
    await expect(page.getByRole("heading", { name: "Before you start" })).toBeVisible()
    for (const h of [
      "Intuition: names are labels, not boxes",
      "See it",
      "Worked example",
      "Common mistakes",
      "Practice",
    ]) {
      await expect(page.getByRole("heading", { level: 2, name: h })).toBeVisible()
    }
    await expect(page.getByTestId("callout-intuition")).toBeVisible()
    await expect(page.getByTestId("callout-warning")).toBeVisible()
    await expect(page.getByTestId("key-takeaways")).toBeVisible()
  })

  test("copy button puts the exact code on the clipboard", async ({ page }) => {
    await page.goto(LESSON_1)
    const block = page.getByTestId("code-block").filter({ hasText: "aliasing.py" })
    await block.getByTestId("copy-button").click()
    await expect(block.getByTestId("copy-button")).toContainText("Copied!")
    expect(await readClipboard(page)).toBe(lessonCode("how-this-notebook-works"))
  })

  test("code shows exactly what is copied (no ligatures) and highlights lines", async ({
    page,
  }) => {
    await page.goto(LESSON_1)
    const code = page.getByTestId("code-block").first().locator("code").first()
    expect(await code.evaluate((el) => getComputedStyle(el).fontVariantLigatures)).toBe("none")
    await expect(page.getByTestId("code-block").first().locator(".line.hl")).toHaveCount(2)
  })

  test("math renders with KaTeX", async ({ page }) => {
    await page.goto(LESSON_2)
    expect(await page.locator(".katex-display").count()).toBeGreaterThanOrEqual(2)
    expect(await page.locator(".katex").count()).toBeGreaterThanOrEqual(5)
  })

  test("quick-check reveal is hidden until opened", async ({ page }) => {
    await page.goto(LESSON_1)
    const reveal = page.getByTestId("reveal-hint").first()
    await expect(reveal.getByText("builds a new list")).toBeHidden()
    await reveal.locator("summary").click()
    await expect(reveal).toHaveAttribute("open", "")
    await expect(reveal.getByText("builds a new list")).toBeVisible()
  })

  test("on-this-page outline links to headings (wide screens)", async ({ page }, info) => {
    test.skip(width(info) < 1280, "outline shows from 1280px")
    await page.goto(LESSON_2)
    const toc = page.getByRole("navigation", { name: "On this page" })
    await toc.getByRole("link", { name: "Worked example: catch the resizes" }).click()
    await expect(page).toHaveURL(/#worked-example-catch-the-resizes$/)
    await expect(page.locator("#worked-example-catch-the-resizes")).toBeInViewport()
  })

  test("mark as done persists and shows up in progress, sidebar and home", async ({
    page,
  }, info) => {
    await page.goto(LESSON_1)
    await page.getByTestId("done-toggle").click()
    await expect(page.getByTestId("done-toggle")).toHaveText("Completed")
    await page.reload()
    await expect(page.getByTestId("done-toggle")).toHaveText("Completed")
    if (isDesktop(info)) {
      await expect(
        page.getByRole("complementary", { name: "Module navigation" }).getByLabel("completed"),
      ).toHaveCount(1)
    }
    await page.goto("/progress")
    await expect(page.getByTestId("progress-start-here")).toContainText("1/2")
    await page.goto("/")
    await expect(page.getByTestId("continue-card")).toContainText("Why list.append is fast")
  })
})
