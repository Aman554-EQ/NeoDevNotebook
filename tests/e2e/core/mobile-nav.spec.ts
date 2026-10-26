import { expect, isDesktop, test } from "../fixtures"

test.describe("mobile drawer", () => {
  test.beforeEach(async ({}, info) => {
    test.skip(isDesktop(info), "drawer navigation is for screens below 1024px")
  })

  test("opens, traps focus, closes with Escape and navigates", async ({ page }) => {
    await page.goto("/learn/start-here/how-this-notebook-works")
    await expect(page.getByRole("complementary", { name: "Module navigation" })).toBeHidden()

    const trigger = page.getByTestId("mobile-nav-trigger")
    await trigger.click()
    const drawer = page.getByTestId("mobile-nav")
    await expect(drawer).toBeVisible()

    for (let i = 0; i < 25; i++) {
      await page.keyboard.press("Tab")
      expect(await drawer.evaluate((el) => el.contains(document.activeElement))).toBe(true)
    }

    await page.keyboard.press("Escape")
    await expect(drawer).toBeHidden()
    await expect(trigger).toBeFocused()

    await trigger.click()
    await drawer.getByRole("link", { name: /Why list.append is fast/ }).click()
    await expect(page).toHaveURL(/why-append-is-fast$/)
    await expect(drawer).toBeHidden()
  })
})
