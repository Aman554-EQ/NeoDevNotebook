import { ROADMAP } from "../../../src/lib/roadmap"
import { expect, test } from "../fixtures"

test.describe("homepage", () => {
  test("tracks are separate modules, without part numbers or Flask", async ({ page }) => {
    await page.goto("/")
    await expect(page.locator('[data-testid^="track-"]')).toHaveCount(ROADMAP.length)
    for (const slug of ["django", "fastapi", "ml", "llm"])
      await expect(page.getByTestId(`track-${slug}`)).toBeVisible()
    const text = await page.locator("main").innerText()
    expect(text).not.toMatch(/\bPart \d/)
    expect(text).not.toMatch(/Flask/)
  })

  test("module pages and hubs show logos, not part numbers", async ({ page }) => {
    for (const path of ["/learn", "/learn/django", "/learn/python"]) {
      await page.goto(path)
      expect(await page.locator("main").innerText(), path).not.toMatch(/\bPart \d/)
    }
    await page.goto("/learn/django")
    await expect(
      page.getByRole("heading", { level: 1 }).locator('[data-logo="django"]'),
    ).toBeVisible()
  })

  test("the mini lab responds to every control", async ({ page }) => {
    // Reduced motion: no autoplay, so each change below comes from the click alone.
    await page.emulateMedia({ reducedMotion: "reduce" })
    await page.goto("/")
    const lab = page.getByTestId("hero-lab")
    const card = (name: string) => lab.getByRole("region", { name })

    const list = card("A list grows in place")
    await expect(list).toContainText("capacity 4")
    await list.getByRole("button", { name: "append()" }).click()
    await list.getByRole("button", { name: "append()" }).click()
    await expect(list).toContainText("full: copy into 8 slots")
    await expect(list).toContainText("len 5 · capacity 8")
    await list.getByRole("button", { name: "pop()" }).click()
    await expect(list).toContainText("len 4 · capacity 8")

    const req = card("Request, view, response")
    await req.getByRole("button", { name: "GET /books/99" }).click()
    await expect(req).toContainText("GET /books/99 → 404 Not Found")
    await req.getByRole("button", { name: "POST /books" }).click()
    await expect(req).toContainText("POST /books → 201 Created")

    const git = card("Branch and merge")
    const merge = git.getByRole("button", { name: "merge", exact: true })
    await expect(merge).toBeDisabled()
    await git.getByRole("button", { name: "branch", exact: true }).click()
    await git.getByRole("button", { name: "commit", exact: true }).click()
    await expect(git).toContainText("on feature")
    await merge.click()
    await expect(git).toContainText("git merge --no-ff feature")
    await expect(merge).toBeDisabled()

    const net = card("A forward pass")
    const before = await net.locator("p.font-mono").innerText()
    await net.getByRole("button", { name: /^x2 = 0$/ }).click()
    await expect(net.getByRole("button", { name: /^x2 = 1$/ })).toHaveAttribute(
      "aria-pressed",
      "true",
    )
    await expect(net.locator("p.font-mono")).not.toHaveText(before)
  })

  test("decorative backdrop stays out of the accessibility tree", async ({ page }) => {
    await page.goto("/")
    await expect(page.getByTestId("logo-pattern").first()).toHaveAttribute("aria-hidden", "true")
    await expect(page.getByTestId("node-field")).toHaveAttribute("aria-hidden", "true")
  })

  test("footer: GitHub link, copyright and a working subscribe box", async ({ page }) => {
    await page.goto("/learn")
    const footer = page.getByTestId("site-footer")
    await expect(footer.getByRole("link", { name: "GitHub" })).toHaveAttribute(
      "href",
      "https://github.com/Aman554-EQ",
    )
    await expect(footer).toContainText(/© \d{4} NeoDevNotebook/)
    const form = footer.getByTestId("subscribe")
    await form.getByLabel("Get new modules by email").fill("e2e-subscriber@example.com")
    await form.getByRole("button", { name: "Subscribe" }).click()
    await expect(form.locator("#subscribe-status")).toHaveText("Thanks, you're subscribed.")
  })

  test("the site icon and Apple touch icon are served", async ({ page, request }) => {
    await page.goto("/")
    for (const rel of ["icon", "apple-touch-icon"]) {
      const hrefs = await page
        .locator(`head link[rel="${rel}"]`)
        .evaluateAll((els) => els.map((e) => e.getAttribute("href")!))
      expect(hrefs.length, rel).toBeGreaterThan(0)
      for (const href of hrefs) expect((await request.get(href)).status(), href).toBe(200)
    }
  })
})
