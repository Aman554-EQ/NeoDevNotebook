import AxeBuilder from "@axe-core/playwright"
import { content, expect, isDesktop, readClipboard, test, width } from "../fixtures"

const python = content.find((b) => b.module.slug === "python")!
const problems = python.problems
const tiers = ["easy", "simple", "medium", "hard"] as const

test.describe("python practice", () => {
  test("lists all problems and each difficulty filter shows its 15", async ({ page }) => {
    await page.goto("/practice/python")
    await expect(page.getByTestId("result-count")).toHaveText(
      `Showing ${problems.length} of ${problems.length}`,
    )
    for (const d of tiers) {
      await page.getByTestId(`filter-difficulty-${d}`).click()
      await expect(page.getByTestId("item-row")).toHaveCount(15)
      await page.getByTestId(`filter-difficulty-${d}`).click() // off again
    }
    // Long tag lists start collapsed to the 10 most-used tags.
    const tagGroup = page.getByRole("group", { name: "Tag" })
    await expect(tagGroup.locator("[data-testid^=filter-tag-]")).toHaveCount(10)
    await page.getByTestId("toggle-all-tags").click()
    const allTags = new Set(problems.flatMap((p) => p.tags)).size
    await expect(tagGroup.locator("[data-testid^=filter-tag-]")).toHaveCount(allTags)
    await page.getByTestId("filter-tag-debugging").click()
    await expect(page.getByTestId("item-row")).toHaveCount(8)
  })

  for (const d of tiers) {
    test(`every ${d} problem page renders its statement, hints and solution`, async ({
      page,
    }, info) => {
      test.skip(!isDesktop(info), "all pages are checked at desktop; samples run on mobile below")
      test.setTimeout(120_000)
      for (const p of problems.filter((x) => x.difficulty === d)) {
        const res = await page.goto(`/practice/python/${p.id}`)
        expect(res?.status(), p.id).toBe(200)
        await expect(page.getByRole("heading", { level: 1 })).toHaveText(p.title)
        await expect(page.getByTestId("reveal-hint")).toHaveCount(p.hints.length)
        await expect(page.getByTestId("reveal-solution")).toHaveCount(1)
      }
    })
  }

  test("solution code copies exactly and the explanation sits below it", async ({ page }) => {
    for (const id of ["py-p-016", "py-p-050"]) {
      const p = problems.find((x) => x.id === id)!
      await page.goto(`/practice/python/${id}`)
      const solution = page.getByTestId("reveal-solution")
      await solution.locator("summary").click()
      const block = solution.getByTestId("code-block")
      await block.getByTestId("copy-button").click()
      expect(await readClipboard(page)).toBe(p.solution.code.replace(/\n+$/, ""))
      const explanation = solution.getByRole("heading", { name: "How it works" })
      const [codeBox, explBox] = [await block.boundingBox(), await explanation.boundingBox()]
      expect(explBox!.y).toBeGreaterThan(codeBox!.y + codeBox!.height - 1)
    }
  })

  test("debugging problems show the buggy code in the statement", async ({ page }) => {
    await page.goto("/practice/python/py-p-040")
    await expect(page.getByTestId("code-block").first()).toContainText("lo = mid")
  })

  test("long problem pages don't scroll sideways", async ({ page }) => {
    for (const id of ["py-p-050", "py-p-046", "py-p-058"]) {
      await page.goto(`/practice/python/${id}`)
      await page.getByTestId("reveal-solution").locator("summary").click()
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - window.innerWidth,
      )
      expect(overflow, id).toBeLessThanOrEqual(0)
    }
  })

  for (const theme of ["light", "dark"] as const) {
    test(`axe ${theme}: problem list and a problem page`, async ({ page }, info) => {
      test.skip(![360, 1440].includes(width(info)), "phone and desktop are enough here")
      await page.addInitScript((t) => localStorage.setItem("ndn-theme", t), theme)
      for (const path of ["/practice/python", "/practice/python/py-p-050"]) {
        await page.goto(path)
        const solution = page.getByTestId("reveal-solution")
        if (await solution.count()) await solution.locator("summary").click()
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
