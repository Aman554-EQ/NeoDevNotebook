import { expect, startHere, test } from "../fixtures"

test.describe("interview questions", () => {
  test("list rows expand to a quick answer", async ({ page }) => {
    await page.goto("/interview/start-here")
    await expect(page.getByTestId("item-row")).toHaveCount(startHere.interview.length)
    const row = page.getByTestId("item-row").first()
    await row.getByText("Quick answer").click()
    await expect(row.getByRole("link", { name: "Full answer →" })).toBeVisible()
  })

  test("answer is hidden until revealed", async ({ page }) => {
    const q = startHere.interview.find((i) => i.id === "sh-i-001")!
    await page.goto("/interview/start-here/sh-i-001")
    await expect(page.getByRole("heading", { level: 1 })).toContainText("What does")
    const answer = page.getByTestId("reveal-solution")
    await expect(answer.getByText("Short answer (say this first)")).toBeHidden()
    await answer.locator("summary").click()
    await expect(answer.getByText("Short answer (say this first)")).toBeVisible()
    await expect(answer.getByTestId("code-block")).toBeVisible()
    await expect(page.getByRole("heading", { name: "Likely follow-up questions" })).toBeVisible()
    expect(q.followUps.length).toBeGreaterThan(0)
  })

  test("bookmark appears on /bookmarks after reload and can be removed", async ({ page }) => {
    await page.goto("/interview/start-here/sh-i-002")
    await page.getByTestId("bookmark-toggle").click()
    await expect(page.getByTestId("bookmark-toggle")).toHaveAttribute("aria-pressed", "true")

    await page.goto("/bookmarks")
    await page.reload()
    const list = page.getByTestId("bookmark-list")
    await expect(list).toContainText("Why is list.append O(1) amortized") // backticks are rendered, not shown
    await list.getByRole("link").first().click()
    await expect(page).toHaveURL(/sh-i-002$/)

    await page.goto("/bookmarks")
    await page.getByRole("button", { name: /Remove bookmark/ }).click()
    await expect(page.getByTestId("bookmarks-empty")).toBeVisible()
  })
})
