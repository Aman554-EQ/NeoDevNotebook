import { expect, test } from "../fixtures"

const LESSON_1 = "/learn/start-here/how-this-notebook-works"
const LESSON_2 = "/learn/start-here/why-append-is-fast"

test.describe("visualizations", () => {
  test("three.js is not in the initial page JavaScript; it loads when the 3D viz is reached", async ({
    page,
    request,
  }) => {
    const html = await (await request.get(LESSON_1)).text()
    const scripts = [...html.matchAll(/<script[^>]+src="([^"]+)"/g)].map((m) => m[1]!)
    expect(scripts.length).toBeGreaterThan(0)
    for (const src of scripts) {
      const js = await (await request.get(src)).text()
      expect(js.includes("WebGLRenderer"), `${src} contains three.js`).toBe(false)
    }

    await page.goto(LESSON_1)
    const frame = page.locator('[data-viz-kind="3d"]')
    await frame.scrollIntoViewIfNeeded()
    await expect(frame.locator("canvas")).toBeVisible({ timeout: 15_000 })
  })

  test("2D viz controls: step, previous, play to the end, reset", async ({ page }) => {
    await page.goto(LESSON_2)
    const frame = page.getByTestId("viz-frame")
    await frame.scrollIntoViewIfNeeded()
    const narration = frame.getByTestId("viz-narration")
    await expect(narration).toContainText("Step 1/6")
    await expect(frame.getByTestId("viz-prev")).toBeDisabled()

    await frame.getByTestId("viz-step").click()
    await expect(narration).toContainText("Step 2/6")
    await expect(frame.getByTestId("list-len")).toHaveText("1")

    await frame.getByTestId("viz-prev").click()
    await expect(narration).toContainText("Step 1/6")

    await frame.getByTestId("viz-play").click()
    await expect(narration).toContainText("Step 6/6", { timeout: 20_000 })
    await expect(frame.getByTestId("viz-play")).toContainText("Replay")
    await expect(frame.getByTestId("list-slots").locator("> div")).toHaveCount(8)

    await frame.getByTestId("viz-reset").click()
    await expect(narration).toContainText("Step 1/6")
  })

  test("controls work from the keyboard", async ({ page }) => {
    await page.goto(LESSON_2)
    const frame = page.getByTestId("viz-frame")
    await frame.scrollIntoViewIfNeeded()
    await frame.getByTestId("viz-step").focus()
    await page.keyboard.press("Enter")
    await page.keyboard.press("Space")
    await expect(frame.getByTestId("viz-narration")).toContainText("Step 3/6")
  })

  test("reduced motion: 3D shows the static, steppable fallback until the learner opts in", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" })
    await page.goto(LESSON_1)
    const frame = page.locator('[data-viz-kind="3d"]')
    await frame.scrollIntoViewIfNeeded()
    const fallback = frame.getByTestId("viz-fallback")
    await expect(fallback).toBeVisible()
    await expect(frame.locator("canvas")).toHaveCount(0)

    const svg = fallback.getByRole("img")
    await expect(svg).toHaveAttribute("aria-label", /a points to \[1, 2\]/)
    await frame.getByTestId("viz-step").click()
    await frame.getByTestId("viz-step").click()
    await expect(svg).toHaveAttribute("aria-label", /b points to \[1, 2, 3\]/)

    await fallback.getByRole("button", { name: "Load 3D view" }).click()
    await expect(frame.locator("canvas")).toBeVisible({ timeout: 15_000 })
  })
})
