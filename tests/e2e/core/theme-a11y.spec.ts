import AxeBuilder from "@axe-core/playwright"
import { ALL_PAGES, expect, test } from "../fixtures"

test.describe("theme", () => {
  test("toggle switches to dark and persists across reloads", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "light" })
    await page.goto("/")
    const html = page.locator("html")
    await expect(html).toHaveAttribute("data-theme", "light")
    await page.getByTestId("theme-toggle").click()
    await expect(html).toHaveAttribute("data-theme", "dark")
    await page.reload()
    await expect(html).toHaveAttribute("data-theme", "dark")
  })

  test("follows the OS preference and is applied before hydration (no flash)", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" })
    await page.addInitScript(() => {
      document.addEventListener("readystatechange", () => {
        if (document.readyState === "interactive") {
          ;(window as unknown as { __themeAtParse: string }).__themeAtParse =
            document.documentElement.dataset.theme ?? "unset"
        }
      })
    })
    await page.goto("/learn")
    expect(
      await page.evaluate(() => (window as unknown as { __themeAtParse: string }).__themeAtParse),
    ).toBe("dark")
  })
})

test.describe("accessibility", () => {
  for (const theme of ["light", "dark"] as const) {
    for (const path of ALL_PAGES) {
      test(`axe: no serious/critical issues on ${path} (${theme})`, async ({ page }) => {
        await page.addInitScript((t) => localStorage.setItem("ndn-theme", t), theme)
        await page.goto(path)
        // Bring lazy visualizations into the DOM so they are scanned too.
        for (const viz of await page.getByTestId("viz-frame").all())
          await viz.scrollIntoViewIfNeeded()
        const { violations } = await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
          .exclude("canvas")
          .analyze()
        const serious = violations
          .filter((v) => v.impact === "serious" || v.impact === "critical")
          .map((v) => `${v.id}: ${v.help} → ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`)
        expect(serious).toEqual([])
      })
    }
  }

  test("skip link is the first stop and moves focus to the content", async ({ page }) => {
    await page.goto("/learn/start-here/how-this-notebook-works")
    await page.keyboard.press("Tab")
    const skip = page.getByRole("link", { name: "Skip to content" })
    await expect(skip).toBeFocused()
    await expect(skip).toBeInViewport()
    await page.keyboard.press("Enter")
    await expect(page).toHaveURL(/#main$/)
  })
})

test.describe("responsive layout", () => {
  for (const path of ALL_PAGES) {
    test(`no horizontal page scroll on ${path}`, async ({ page }) => {
      await page.goto(path)
      for (const viz of await page.getByTestId("viz-frame").all())
        await viz.scrollIntoViewIfNeeded()
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - window.innerWidth,
      )
      expect(overflow).toBeLessThanOrEqual(0)
    })
  }
})
