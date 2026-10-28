import AxeBuilder from "@axe-core/playwright"
import { content, expect, isDesktop, readClipboard, test, width } from "../fixtures"

const python = content.find((b) => b.module.slug === "python")!
const questions = python.interview

test.describe("python interview questions", () => {
  test("lists every question, filters by difficulty and shows quick answers", async ({ page }) => {
    await page.goto("/interview/python")
    await expect(page.getByTestId("result-count")).toHaveText(
      `Showing ${questions.length} of ${questions.length}`,
    )
    for (const d of ["easy", "simple", "medium", "hard"] as const) {
      await page.getByTestId(`filter-difficulty-${d}`).click()
      await expect(page.getByTestId("item-row")).toHaveCount(
        questions.filter((q) => q.difficulty === d).length,
      )
      await page.getByTestId(`filter-difficulty-${d}`).click()
    }
  })

  test("every question page renders with its answer hidden until revealed", async ({
    page,
  }, info) => {
    test.skip(!isDesktop(info), "all pages are checked at desktop")
    test.setTimeout(180_000)
    for (const q of questions) {
      const res = await page.goto(`/interview/python/${q.id}`)
      expect(res?.status(), q.id).toBe(200)
      await expect(page.getByRole("heading", { level: 1 })).toContainText(
        q.question.replace(/`/g, "").slice(0, 25),
      )
      await expect(page.getByTestId("reveal-solution")).not.toHaveAttribute("open")
    }
  })

  test("answer code copies exactly; bookmark survives a reload", async ({ page }) => {
    const q = questions.find((x) => x.id === "py-i-035")!
    await page.goto(`/interview/python/${q.id}`)
    const answer = page.getByTestId("reveal-solution")
    await answer.locator("summary").click()
    await answer.getByTestId("code-block").getByTestId("copy-button").click()
    expect(await readClipboard(page)).toBe(q.code!.code.replace(/\n+$/, ""))
    await page.getByTestId("bookmark-toggle").click()
    await page.goto("/bookmarks")
    await expect(page.getByRole("link", { name: /MRO/ })).toBeVisible()
  })

  for (const theme of ["light", "dark"] as const) {
    test(`axe ${theme}: list and a long answer`, async ({ page }, info) => {
      test.skip(![360, 1440].includes(width(info)), "phone and desktop are enough here")
      await page.addInitScript((t) => localStorage.setItem("ndn-theme", t), theme)
      for (const path of ["/interview/python", "/interview/python/py-i-041"]) {
        await page.goto(path)
        const answer = page.getByTestId("reveal-solution")
        if (await answer.count()) await answer.locator("summary").click()
        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth - window.innerWidth,
        )
        expect(overflow, `${path} horizontal scroll`).toBeLessThanOrEqual(0)
        const { violations } = await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
          .analyze()
        const serious = violations
          .filter((v) => v.impact === "serious" || v.impact === "critical")
          .map((v) => `${path} ${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`)
        expect(serious).toEqual([])
      }
    })
  }
})
