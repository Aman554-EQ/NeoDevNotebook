/**
 * Dev-server health check: `pnpm dev` in one terminal, then `pnpm check:dev [baseURL] [width]`.
 *
 * Production E2E (`pnpm test:e2e`) can't see development-only problems such as hydration
 * mismatches or Next.js instant-navigation insights. This script loads every route on the dev
 * server, steps every visual to the end and back, follows every "next" link as a client-side
 * navigation, and fails if anything logs a warning or error, or the Next.js dev overlay shows an
 * issue.
 */
import { chromium, type Page } from "@playwright/test"
import { loadAllContent } from "../src/lib/content/load"

const [base = "http://localhost:3000", widthArg = "1440"] = process.argv.slice(2)
const content = loadAllContent()
const routes = [
  "/",
  "/learn",
  "/practice",
  "/interview",
  "/progress",
  "/bookmarks",
  "/projects",
  ...content.flatMap(({ module: m, lessons, problems, interview, projects }) => [
    `/learn/${m.slug}`,
    `/practice/${m.slug}`,
    `/interview/${m.slug}`,
    ...lessons.map((l) => `/learn/${m.slug}/${l.slug}`),
    ...problems.map((p) => `/practice/${m.slug}/${p.id}`),
    ...interview.map((q) => `/interview/${m.slug}/${q.id}`),
    ...(projects.length ? [`/projects/${m.slug}`] : []),
    ...projects.map((p) => `/projects/${m.slug}/${p.slug}`),
  ]),
]
const sequenceStarts = content.flatMap(
  ({ module: m, lessons, problems, interview, projects }) =>
    [
      lessons[0] && `/learn/${m.slug}/${lessons[0].slug}`,
      projects[0] && `/projects/${m.slug}/${projects[0].slug}`,
      problems[0] && `/practice/${m.slug}/${problems[0].id}`,
      interview[0] && `/interview/${m.slug}/${interview[0].id}`,
    ].filter(Boolean) as string[],
)

// SwiftShader gives headless Chromium a software WebGL without GPU-driver chatter.
const browser = await chromium.launch({
  args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
})
const page = await browser.newPage({ viewport: { width: Number(widthArg), height: 900 } })
const problems: string[] = []
page.on("console", (m) => {
  if (m.type() === "error" || m.type() === "warning")
    problems.push(`${page.url()} [${m.type()}] ${m.text().slice(0, 500)}`)
})
page.on("pageerror", (e) => problems.push(`${page.url()} [pageerror] ${e.message}`))
page.on("response", (r) => {
  if (r.status() >= 400) problems.push(`${page.url()} [http ${r.status()}] ${r.url()}`)
})

async function overlayIssues(p: Page) {
  return p.evaluate(() => {
    const text = document.querySelector("nextjs-portal")?.shadowRoot?.textContent ?? ""
    return text.match(/(\d+)\s*Issues?/)?.[0] ?? ""
  })
}

let visuals = 0
for (const route of routes) {
  const res = await page.goto(base + route, { waitUntil: "networkidle", timeout: 120_000 })
  if (res?.status() !== 200) problems.push(`${route} [status ${res?.status()}]`)
  const frames = page.getByTestId("viz-frame")
  for (let i = 0; i < (await frames.count()); i++) {
    const f = frames.nth(i)
    await f.scrollIntoViewIfNeeded()
    await f.locator('[data-testid="viz-scene"], [data-testid="viz-fallback"]').first().waitFor()
    const next = f.getByTestId("viz-step")
    while (!(await next.isDisabled())) await next.click()
    await f.getByTestId("viz-play").click() // "Replay" from the last step
    await f.getByTestId("viz-reset").click()
    if ((await f.getAttribute("data-step")) !== "0")
      problems.push(`${route}: visual ${i} did not reset`)
    visuals++
  }
  const issues = await overlayIssues(page)
  if (issues) problems.push(`${route} [next-overlay] ${issues}`)
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  )
  if (overflow > 0)
    problems.push(`${route} [horizontal scroll] ${overflow}px wider than the viewport`)
  process.stdout.write(".")
}

let hops = 0
for (const start of sequenceStarts) {
  await page.goto(base + start, { waitUntil: "networkidle" })
  const section = start.split("/").slice(0, 3).join("/")
  for (;;) {
    // Next keeps the previous route mounted (hidden) for back navigation: use the visible link.
    const next = page.getByTestId("next-link").filter({ visible: true })
    const href = (await next.count()) ? await next.getAttribute("href") : null
    if (!href?.startsWith(section)) break
    await next.click()
    await page.waitForURL((u) => u.pathname === href, { timeout: 60_000 })
    await page.getByRole("heading", { level: 1 }).filter({ visible: true }).waitFor()
    hops++
  }
  const issues = await overlayIssues(page)
  if (issues) problems.push(`${page.url()} [next-overlay after navigation] ${issues}`)
}
await browser.close()

console.log(
  `\n${routes.length} routes, ${visuals} visuals stepped, ${hops} client navigations at ${widthArg}px`,
)
if (problems.length) {
  console.log(problems.join("\n"))
  process.exit(1)
}
console.log("✓ no warnings, errors or dev-overlay issues")
