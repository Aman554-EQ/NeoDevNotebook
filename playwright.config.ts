import { defineConfig, devices } from "@playwright/test"

const PORT = 3200
const chromium = {
  ...devices["Desktop Chrome"],
  permissions: ["clipboard-read", "clipboard-write"],
}

/**
 * E2E runs against the production build (`pnpm test:e2e` builds first), at the four
 * viewports required by soul.md §10. Specs read `testInfo.project.use.viewport` to
 * skip checks that only apply to small or large screens.
 */
export default defineConfig({
  testDir: "tests/e2e",
  globalSetup: "./tests/e2e/global-setup.ts",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"], ["html", { open: "never" }]],
  timeout: 30_000,
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "mobile-360",
      use: { ...chromium, viewport: { width: 360, height: 780 }, hasTouch: true },
    },
    { name: "tablet-768", use: { ...chromium, viewport: { width: 768, height: 1024 } } },
    { name: "laptop-1024", use: { ...chromium, viewport: { width: 1024, height: 768 } } },
    { name: "desktop-1440", use: { ...chromium, viewport: { width: 1440, height: 900 } } },
  ],
  webServer: {
    command: `node node_modules/next/dist/bin/next start -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: false,
    timeout: 60_000,
  },
})
