import { expect, readClipboard, startHere, test } from "../fixtures"

test.describe("practice problems", () => {
  test("filters by difficulty and tag, kept in the URL across reloads", async ({ page }) => {
    await page.goto("/practice/start-here")
    const total = startHere.problems.length
    await expect(page.getByTestId("result-count")).toHaveText(`Showing ${total} of ${total}`)

    await page.getByTestId("filter-difficulty-easy").click()
    await expect(page).toHaveURL(/difficulty=easy/)
    const easy = startHere.problems.filter((p) => p.difficulty === "easy").length
    await expect(page.getByTestId("item-row")).toHaveCount(easy)

    await page.reload()
    await expect(page.getByTestId("filter-difficulty-easy")).toHaveAttribute("aria-pressed", "true")
    await expect(page.getByTestId("item-row")).toHaveCount(easy)

    await page.getByTestId("filter-difficulty-easy").click() // off again
    await page.getByTestId("filter-tag-simulation").click()
    await expect(page).toHaveURL(/tag=simulation/)
    await expect(page.getByTestId("item-row")).toHaveCount(1)
    await expect(page.getByTestId("item-row")).toContainText("Count the list resizes")

    await page.getByTestId("filter-q").fill("nothing-matches-this")
    await expect(page.getByText("Nothing matches these filters.")).toBeVisible()
  })

  test("status filter follows solved problems", async ({ page }) => {
    await page.goto("/practice/start-here/sh-p-001")
    await page.getByTestId("done-toggle").click()
    await page.goto("/practice/start-here?status=done")
    await expect(page.getByTestId("item-row")).toHaveCount(1)
    await expect(page.getByTestId("item-row")).toContainText("Fix the shared default list")
    await page.getByRole("button", { name: "To do" }).click()
    await expect(page.getByTestId("item-row")).not.toContainText(["Fix the shared default list"])
  })

  test("hints and solution are hidden until revealed; solution copies exactly", async ({
    page,
  }) => {
    const problem = startHere.problems.find((p) => p.id === "sh-p-002")!
    await page.goto("/practice/start-here/sh-p-002")
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(problem.title)

    const hint = page.getByTestId("reveal-hint").first()
    await expect(hint).not.toHaveAttribute("open")
    await hint.locator("summary").click()
    await expect(hint).toHaveAttribute("open", "")

    const solution = page.getByTestId("reveal-solution")
    await expect(solution.getByTestId("code-block")).toBeHidden()
    await solution.locator("summary").click()
    const block = solution.getByTestId("code-block")
    await expect(block).toBeVisible()

    // The explanation comes after (below) the code.
    const explanation = solution.getByRole("heading", { name: "How it works" })
    const [codeBox, explBox] = [await block.boundingBox(), await explanation.boundingBox()]
    expect(explBox!.y).toBeGreaterThan(codeBox!.y + codeBox!.height - 1)

    await block.getByTestId("copy-button").click()
    expect(await readClipboard(page)).toBe(problem.solution.code.replace(/\n+$/, ""))
  })
})
