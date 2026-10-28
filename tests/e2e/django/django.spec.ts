import AxeBuilder from "@axe-core/playwright"
import type { Locator, Page } from "@playwright/test"
import { content, expect, isDesktop, test, width } from "../fixtures"

/** Pages are derived from content/django, so this suite grows with the module. */
const django = content.find((b) => b.module.slug === "django")!
const lessons = django.lessons.map((l) => ({ ...l, href: `/learn/django/${l.slug}` }))
const projects = django.projects.map((p) => ({ ...p, href: `/projects/django/${p.slug}` }))

/** Text that is cut off inside a visual: an element hiding overflow whose content is wider. */
async function clippedText(frame: Locator) {
  return frame.evaluate((root) =>
    [...root.querySelectorAll<HTMLElement>("[data-testid=viz-stage] *")]
      .filter((el) => {
        const style = getComputedStyle(el)
        const hides =
          ["hidden", "clip"].includes(style.overflowX) && style.textOverflow !== "ellipsis"
        return hides && el.scrollWidth > el.clientWidth + 1 && el.textContent?.trim()
      })
      .map((el) => `${el.tagName.toLowerCase()}: ${el.textContent!.trim().slice(0, 40)}`),
  )
}

async function noPageScroll(page: Page) {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  )
  expect(overflow, "horizontal page scroll").toBeLessThanOrEqual(0)
}

test.describe("django module: structure", () => {
  test("module page shows the four parts and the six sections", async ({ page }) => {
    await page.goto("/learn/django")
    const parts = page.getByTestId("module-parts").getByRole("link")
    await expect(parts).toHaveCount(4)
    await expect(parts).toHaveText([/Course/, /Projects/, /Practice/, /Interview/])
    await expect(page.getByRole("main").getByRole("heading", { level: 2 })).toHaveCount(6)
    await noPageScroll(page)
  })

  test("projects hub and module list show every project", async ({ page }) => {
    await page.goto("/projects")
    await expect(page.getByTestId("project-card")).toHaveCount(projects.length)
    await page.goto("/projects/django")
    await expect(page.getByTestId("project-card")).toHaveCount(projects.length)
    await expect(page.getByText("Capstone project").first()).toBeVisible()
  })
})

test.describe("django module: every lesson", () => {
  for (const l of lessons) {
    test(`${l.slug}: renders, visuals step with readable text, no page scroll`, async ({
      page,
    }) => {
      test.slow()
      const res = await page.goto(l.href)
      expect(res?.status()).toBe(200)
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(l.title)
      await expect(page.getByRole("heading", { level: 2, name: "Common mistakes" })).toBeVisible()
      await expect(page.getByTestId("key-takeaways")).toBeVisible()
      for (const viz of await page.getByTestId("viz-frame").all()) {
        await viz.scrollIntoViewIfNeeded()
        await expect(viz.getByTestId("viz-skeleton")).toHaveCount(0)
        const step = viz.getByTestId("viz-step")
        let previous = await viz.getByTestId("viz-narration").textContent()
        while (await step.isEnabled()) {
          await step.click()
          await expect(viz.getByTestId("viz-narration")).not.toHaveText(previous!)
          previous = await viz.getByTestId("viz-narration").textContent()
          expect(await clippedText(viz), "clipped text in the visual").toEqual([])
        }
      }
      const related = page.getByTestId("related-practice")
      await expect(related.getByRole("link")).toHaveCount(l.practice.length + l.interview.length)
      await noPageScroll(page)
    })
  }
})

test.describe("django module: visuals", () => {
  test("HTTP exchange viewer shows method, URL, status and bodies from a recording", async ({
    page,
  }) => {
    await page.goto("/learn/django/backend-fundamentals-and-rest")
    const viz = page.getByTestId("viz-frame").first()
    await viz.scrollIntoViewIfNeeded()
    await expect(viz.getByText("Recorded · real responses")).toBeVisible()
    await expect(viz.getByTestId("http-status")).toHaveText("200 OK")
    await viz.getByTestId("viz-step").click()
    await expect(viz.getByTestId("http-status")).toHaveText("201 Created")
    await expect(viz.getByTestId("http-exchange")).toContainText("/api/books/2/")
  })

  test("ORM viewer counts the real queries of N+1 and its fix", async ({ page }) => {
    await page.goto("/learn/django/relationships-and-efficient-queries")
    const viz = page.getByTestId("viz-frame").first()
    await viz.scrollIntoViewIfNeeded()
    await expect(viz.getByTestId("query-count")).toHaveText("4 queries")
    await viz.getByTestId("viz-step").click()
    await expect(viz.getByTestId("query-count")).toHaveText("1 query")
  })

  test("JWT anatomy recomputes the token and rejects tampering and expiry", async ({ page }) => {
    await page.goto("/learn/django/authentication-and-authorization")
    const viz = page.getByTestId("viz-frame").first()
    await viz.scrollIntoViewIfNeeded()
    const token = viz.getByTestId("jwt-token")
    await expect(token).toContainText("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.")
    await expect(viz.getByTestId("jwt-verdict")).toContainText("valid")
    const before = await token.textContent()
    await viz.getByLabel("user_id").fill("42")
    await expect(token).not.toHaveText(before!)
    for (let i = 0; i < 4; i++) await viz.getByTestId("viz-step").click()
    await expect(viz.getByTestId("jwt-verdict")).toContainText("payload was changed")
    await viz.getByTestId("viz-step").click()
    await expect(viz.getByTestId("jwt-verdict")).toContainText("expired")
  })

  test("3D request lifecycle loads lazily and has a readable fallback", async ({ page }) => {
    await page.goto("/learn/django/django-in-one-picture")
    const viz = page.locator('[data-viz-kind="3d"]').first()
    await viz.scrollIntoViewIfNeeded()
    await expect(viz.locator("canvas")).toBeVisible({ timeout: 15_000 })
    await page.emulateMedia({ reducedMotion: "reduce" })
    await page.reload()
    const still = page.locator('[data-viz-kind="3d"]').first()
    await still.scrollIntoViewIfNeeded()
    const fallback = still.getByTestId("lifecycle-fallback")
    await expect(fallback.getByRole("listitem")).toHaveCount(7)
    await expect(fallback.locator('[aria-current="step"]')).toContainText("Client")
    expect(await clippedText(still)).toEqual([])
  })
})

test.describe("django module: projects", () => {
  for (const p of projects) {
    test(`${p.slug}: renders with checkpoints and real code`, async ({ page }) => {
      test.slow()
      const res = await page.goto(p.href)
      expect(res?.status()).toBe(200)
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(p.title)
      expect(await page.getByTestId("checkpoint").count()).toBeGreaterThanOrEqual(3)
      await expect(page.getByTestId("code-block").first()).toBeVisible()
      await noPageScroll(page)
    })
  }

  test("checkpoint progress survives a reload", async ({ page }) => {
    await page.goto("/projects/django/notes")
    const toggle = page.getByTestId("checkpoint-toggle").first()
    await toggle.scrollIntoViewIfNeeded()
    await toggle.click()
    await expect(toggle).toHaveAttribute("aria-pressed", "true")
    await page.reload()
    await expect(page.getByTestId("checkpoint-toggle").first()).toHaveAttribute(
      "aria-pressed",
      "true",
    )
  })

  test("code tabs switch with the mouse and the arrow keys", async ({ page }) => {
    await page.goto("/projects/django/notes")
    // The first tabs on the page sit inside a closed solution; use ones that are visible.
    const tabs = page.getByTestId("code-tabs").filter({ visible: true }).first()
    await tabs.scrollIntoViewIfNeeded()
    const [first, second] = await tabs.getByRole("tab").all()
    await second!.click()
    await expect(second!).toHaveAttribute("aria-selected", "true")
    await second!.press("ArrowLeft")
    await expect(first!).toHaveAttribute("aria-selected", "true")
    await expect(first!).toBeFocused()
  })

  test("API projects offer a downloadable Postman collection", async ({ page, request }) => {
    for (const slug of ["library-api", "auth-starter", "shoplite"]) {
      await page.goto(`/projects/django/${slug}`)
      const href = await page.getByTestId("postman-download").getAttribute("href")
      const res = await request.get(href!)
      expect(res.status()).toBe(200)
      expect((await res.json()).info.schema).toContain("collection/v2.1.0")
    }
    await page.goto("/projects/django/notes")
    await expect(page.getByTestId("postman-download")).toHaveCount(0)
  })

  test("long pages offer an outline and back-to-top on small screens", async ({ page }, info) => {
    test.skip(isDesktop(info) && width(info) >= 1280, "the sidebar outline is visible at xl")
    await page.goto("/projects/django/shoplite")
    await page.getByTestId("outline-toggle").click()
    await expect(page.getByTestId("page-outline")).toBeVisible()
    await page.getByTestId("page-outline").getByRole("link").first().click()
    await expect(page.getByTestId("page-outline")).toHaveCount(0)
    await page.mouse.wheel(0, 4000)
    await expect(page.getByTestId("back-to-top")).toBeVisible()
  })
})

test.describe("django module: practice and interview", () => {
  test("every problem and interview page renders", async ({ page }) => {
    test.slow()
    for (const p of django.problems) {
      const res = await page.goto(`/practice/django/${p.id}`)
      expect(res?.status(), p.id).toBe(200)
      await expect(page.getByRole("heading", { level: 1 })).toContainText(
        p.title.replace("🐞 ", ""),
      )
    }
    for (const q of django.interview) {
      expect((await page.goto(`/interview/django/${q.id}`))?.status(), q.id).toBe(200)
    }
  })
})

test.describe("django module: accessibility", () => {
  const pages = [
    ...lessons.map((l) => l.href),
    ...projects.map((p) => p.href),
    "/learn/django",
    "/projects",
  ]
  for (const theme of ["light", "dark"] as const) {
    for (const href of pages) {
      test(`axe ${theme}: ${href}`, async ({ page }, info) => {
        test.skip(width(info) !== 1440 && href !== pages[0], "covered at 1440px")
        test.slow()
        await page.addInitScript((t) => localStorage.setItem("ndn-theme", t), theme)
        await page.goto(href)
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
