import AxeBuilder from "@axe-core/playwright"
import { content, expect, isDesktop, test, width } from "../fixtures"

/** Pages are derived from content/python, so this suite grows with every milestone. */
const python = content.find((b) => b.module.slug === "python")!
const lessons = python.lessons.map((l) => ({ ...l, href: `/learn/python/${l.slug}` }))
const sections = [...new Set(lessons.map((l) => l.section).filter(Boolean))] as string[]

test.describe("python module: structure", () => {
  test("module page groups lessons by section in order", async ({ page }) => {
    await page.goto("/learn/python")
    const headings = page.getByRole("main").getByRole("heading", { level: 2 })
    await expect(headings).toHaveText(sections.map((s) => new RegExp(`^${s}`)))
    for (const l of lessons) {
      await expect(page.getByRole("link", { name: new RegExp(l.title) }).first()).toBeVisible()
    }
  })

  test("sidebar sections collapse and expand; the current lesson's section starts open", async ({
    page,
  }, info) => {
    test.skip(!isDesktop(info), "sidebar is a drawer below 1024px (covered by the next test)")
    const last = lessons.at(-1)!
    await page.goto(last.href)
    const sidebar = page.getByRole("complementary", { name: "Module navigation" })
    const toggle = sidebar.getByRole("button", { name: last.section!, exact: true })
    await expect(toggle).toHaveAttribute("aria-expanded", "true")
    await expect(sidebar.getByRole("link", { name: last.title })).toHaveAttribute(
      "aria-current",
      "page",
    )
    await toggle.click()
    await expect(toggle).toHaveAttribute("aria-expanded", "false")
    await expect(sidebar.getByRole("link", { name: last.title })).toBeHidden()
    await toggle.click()
    await expect(sidebar.getByRole("link", { name: last.title })).toBeVisible()
  })

  test("mobile drawer shows the sections", async ({ page }, info) => {
    test.skip(isDesktop(info), "drawer only exists below 1024px")
    await page.goto(lessons[0]!.href)
    await page.getByTestId("mobile-nav-trigger").click()
    const drawer = page.getByTestId("mobile-nav")
    await expect(drawer.getByRole("button", { name: sections[0]!, exact: true })).toBeVisible()
    await expect(drawer.getByRole("link", { name: lessons[0]!.title })).toBeVisible()
  })
})

test.describe("python module: every lesson", () => {
  for (const l of lessons) {
    test(`${l.slug}: renders the template and its visuals without errors`, async ({ page }) => {
      const res = await page.goto(l.href)
      expect(res?.status()).toBe(200)
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(l.title)
      await expect(page.getByRole("heading", { name: "You will be able to" })).toBeVisible()
      await expect(page.getByRole("heading", { level: 2, name: "Common mistakes" })).toBeVisible()
      await expect(page.getByTestId("key-takeaways")).toBeVisible()
      for (const viz of await page.getByTestId("viz-frame").all()) {
        await viz.scrollIntoViewIfNeeded()
        await expect(viz.getByTestId("viz-skeleton")).toHaveCount(0)
        // Every visual can be stepped and its narration changes.
        const before = await viz.getByTestId("viz-narration").textContent()
        await viz.getByTestId("viz-step").click()
        await expect(viz.getByTestId("viz-narration")).not.toHaveText(before!)
      }
      const related = page.getByTestId("related-practice")
      await expect(related.getByRole("link")).toHaveCount(l.practice.length + l.interview.length)
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - window.innerWidth,
      )
      expect(overflow, "horizontal page scroll").toBeLessThanOrEqual(0)
    })
  }
})

test.describe("python module: visuals", () => {
  test("Code Stepper replays the recorded run: line, frames and output", async ({ page }) => {
    await page.goto("/learn/python/conditions-and-match")
    const viz = page.getByTestId("viz-frame").first()
    await viz.scrollIntoViewIfNeeded()
    await expect(viz.getByText("Real run · Python 3.13")).toBeVisible()
    const current = () => viz.locator("[data-current]")
    await expect(current()).toHaveAttribute("data-line", "1")
    // Step until output appears: the first print shows "95 A".
    for (let i = 0; i < 30; i++) {
      if ((await viz.getByTestId("stepper-output").textContent())?.includes("95 A")) break
      await viz.getByTestId("viz-step").click()
    }
    await expect(viz.getByTestId("stepper-output")).toContainText("95 A")
    await viz.getByTestId("viz-reset").click()
    await expect(current()).toHaveAttribute("data-line", "1")
    // Keyboard: the step button is reachable and works with Enter.
    await viz.getByTestId("viz-step").focus()
    await page.keyboard.press("Enter")
    await expect(viz.getByTestId("viz-narration")).toContainText("Step 2/")
  })

  test("call stack grows to five frames for factorial(4)", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" }) // static fallback lists the frames as text
    await page.goto("/learn/python/recursion")
    const viz = page.getByTestId("viz-frame").first()
    await viz.scrollIntoViewIfNeeded()
    const frames = viz.getByTestId("callstack-fallback").getByRole("listitem")
    for (let i = 0; i < 4; i++) await viz.getByTestId("viz-step").click()
    await expect(frames).toHaveCount(5)
    await expect(frames.last()).toContainText("factorial()")
    await expect(frames.last()).toContainText("n=1")
  })

  test("3D scenes load lazily and fall back to SVG with reduced motion", async ({ page }) => {
    await page.goto("/learn/python/mutability-references-and-copies")
    const viz = page.locator('[data-viz-kind="3d"]').first()
    await viz.scrollIntoViewIfNeeded()
    await expect(viz.locator("canvas")).toBeVisible({ timeout: 15_000 })

    await page.emulateMedia({ reducedMotion: "reduce" })
    await page.reload()
    const still = page.locator('[data-viz-kind="3d"]').first()
    await still.scrollIntoViewIfNeeded()
    await expect(still.getByTestId("viz-fallback").locator('svg[role="img"]')).toBeVisible()
    await expect(still.locator("canvas")).toHaveCount(0)
  })

  test("slice playground follows Python's rules", async ({ page }) => {
    await page.goto("/learn/python/strings")
    const viz = page.getByTestId("viz-frame").first()
    await viz.scrollIntoViewIfNeeded()
    await viz.getByTestId("slice-start").fill("")
    await viz.getByTestId("slice-step").fill("-2")
    await expect(viz.getByTestId("slice-try-result")).toHaveText("s[::-2] == 'CNHY'")
    await viz.getByTestId("slice-step").fill("0")
    await expect(viz.getByTestId("slice-try-result")).toContainText("cannot be zero")
  })
})

test.describe("python module: accessibility", () => {
  for (const theme of ["light", "dark"] as const) {
    for (const l of lessons) {
      test(`axe ${theme}: ${l.slug}`, async ({ page }, info) => {
        // Every lesson at desktop; the first lesson at every viewport.
        test.skip(width(info) !== 1440 && l !== lessons[0], "covered at 1440px")
        // Enriched lessons are long (dozens of highlighted code blocks); axe needs more than 30 s
        // when the suite runs in parallel.
        test.slow()
        await page.addInitScript((t) => localStorage.setItem("ndn-theme", t), theme)
        await page.goto(l.href)
        for (const viz of await page.getByTestId("viz-frame").all())
          await viz.scrollIntoViewIfNeeded()
        const { violations } = await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
          .exclude("canvas")
          .analyze()
        const serious = violations
          .filter((v) => v.impact === "serious" || v.impact === "critical")
          .map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`)
        expect(serious).toEqual([])
      })
    }
  }
})
