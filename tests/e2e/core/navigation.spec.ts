import { content, expect, isDesktop, test } from "../fixtures"

test.describe("navigation", () => {
  test("home shows the full learning path with built parts linked", async ({ page }) => {
    await page.goto("/")
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Remember it")
    for (const part of [0, 1, 2, 3, 4, 5, 6])
      await expect(page.getByTestId(`part-${part}`)).toBeVisible()
    // A part is linked exactly when a module for it exists in content/; others say "Coming soon".
    for (const part of [0, 1, 2, 3, 4, 5, 6]) {
      const modules = content.filter((b) => b.module.part === part)
      const card = page.getByTestId(`part-${part}`)
      if (modules.length) {
        for (const b of modules) {
          await expect(card.getByRole("link", { name: b.module.title })).toBeVisible()
        }
      } else {
        await expect(card).toContainText("Coming soon")
      }
    }
  })

  test("start → lesson 1 → next → lesson 2 → previous", async ({ page }) => {
    await page.goto("/")
    await page.getByRole("link", { name: "Start learning" }).click()
    await expect(page).toHaveURL(/\/learn\/start-here\/how-this-notebook-works$/)
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("How this notebook works")
    await expect(page.getByRole("navigation", { name: "Breadcrumb" })).toContainText("Start Here")

    await page.getByTestId("next-link").click()
    await expect(page).toHaveURL(/why-append-is-fast$/)
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Why list.append is fast")

    await page.getByTestId("prev-link").click()
    await expect(page).toHaveURL(/how-this-notebook-works$/)
  })

  test("sidebar marks the current lesson (desktop)", async ({ page }, info) => {
    test.skip(!isDesktop(info), "sidebar is a drawer below 1024px")
    await page.goto("/learn/start-here/why-append-is-fast")
    const tree = page.getByRole("complementary", { name: "Module navigation" })
    await expect(tree.getByRole("link", { name: /Why list.append is fast/ })).toHaveAttribute(
      "aria-current",
      "page",
    )
    await expect(
      page.getByRole("navigation", { name: "Primary" }).getByRole("link", { name: "Learn" }),
    ).toHaveAttribute("aria-current", "page")
    // Collapse / expand the module
    await tree.getByRole("button", { name: "Collapse Start Here" }).click()
    await expect(tree.getByRole("link", { name: /Why list.append is fast/ })).toBeHidden()
    await tree.getByRole("button", { name: "Expand Start Here" }).click()
    await expect(tree.getByRole("link", { name: /Why list.append is fast/ })).toBeVisible()
  })

  test("every content route responds 200", async ({ request }) => {
    test.setTimeout(120_000) // a few hundred routes, and the list grows with every module
    const routes = content.flatMap(({ module: m, lessons, problems, interview, projects }) => [
      `/learn/${m.slug}`,
      ...lessons.map((l) => `/learn/${m.slug}/${l.slug}`),
      ...problems.map((p) => `/practice/${m.slug}/${p.id}`),
      ...interview.map((q) => `/interview/${m.slug}/${q.id}`),
      ...projects.map((p) => `/projects/${m.slug}/${p.slug}`),
    ])
    for (let i = 0; i < routes.length; i += 8) {
      const batch = routes.slice(i, i + 8)
      const statuses = await Promise.all(batch.map(async (r) => (await request.get(r)).status()))
      batch.forEach((r, j) => expect(statuses[j], r).toBe(200))
    }
  })

  for (const path of [
    "/does-not-exist",
    "/learn/start-here/no-such-lesson",
    "/practice/start-here/sh-p-999",
  ]) {
    test(`404 for ${path}`, async ({ page, console }) => {
      console.allow(/404/)
      const res = await page.goto(path)
      expect(res?.status()).toBe(404)
      await expect(page.getByTestId("not-found")).toBeVisible()
      await page.getByRole("link", { name: "Go home" }).click()
      await expect(page).toHaveURL(/\/$/)
    })
  }
})
