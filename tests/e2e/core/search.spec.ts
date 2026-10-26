import { expect, test } from "../fixtures"

test.describe("search", () => {
  test("Ctrl+K opens search; arrow keys + Enter navigate to a result", async ({ page }) => {
    await page.goto("/")
    await page.keyboard.press("Control+k")
    const dialog = page.getByTestId("search-dialog")
    await expect(dialog).toBeVisible()
    await page.getByRole("combobox", { name: "Search" }).fill("resizes")
    const options = dialog.getByRole("option")
    await expect(options.first()).toBeVisible()
    await expect(dialog.locator("mark").first()).toBeVisible()

    const count = await options.count()
    await page.keyboard.press("ArrowDown")
    await expect(options.nth(count > 1 ? 1 : 0)).toHaveAttribute("aria-selected", "true")
    await page.keyboard.press("ArrowUp")
    await expect(options.first()).toHaveAttribute("aria-selected", "true")
    const title = (await options.first().getByTestId("search-hit-title").textContent())!.trim()
    await page.keyboard.press("Enter")
    await expect(dialog).toBeHidden()
    await expect(page.getByRole("heading", { level: 1 })).toContainText(title.slice(0, 20))
  })

  test("trigger button opens, empty results message, Escape closes", async ({ page }) => {
    await page.goto("/learn")
    await page.getByTestId("search-trigger").click()
    const dialog = page.getByTestId("search-dialog")
    await expect(dialog.getByText("Type at least 2 characters.")).toBeVisible()
    await page.getByRole("combobox", { name: "Search" }).fill("zzqqxx")
    await expect(dialog.getByText("No results for “zzqqxx”.")).toBeVisible()
    await page.keyboard.press("Escape")
    await expect(dialog).toBeHidden()
  })
})
