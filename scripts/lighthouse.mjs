/**
 * `pnpm perf` — Lighthouse (mobile preset, simulated throttling) against a running production
 * server, enforcing the budgets in soul.md §11. Usage: start `pnpm start`, then `pnpm perf [baseUrl]`.
 * INP needs real interactions, so the lab proxy Total Blocking Time (< 200 ms) is checked instead.
 */
import { chromium } from "@playwright/test"
import * as chromeLauncher from "chrome-launcher"
import lighthouse from "lighthouse"

const base = process.argv[2] ?? "http://localhost:3000"
const PAGES = [
  "/",
  "/learn/start-here/how-this-notebook-works",
  "/learn/start-here/why-append-is-fast",
  "/practice/start-here",
  "/practice/start-here/sh-p-002",
]
const BUDGET = {
  performance: 90,
  accessibility: 95,
  "best-practices": 95,
  lcp: 2500,
  cls: 0.1,
  tbt: 200,
}

const chrome = await chromeLauncher.launch({
  chromePath: chromium.executablePath(),
  chromeFlags: ["--headless=new", "--no-sandbox"],
})
let failed = false
try {
  for (const path of PAGES) {
    const { lhr } = await lighthouse(`${base}${path}`, {
      port: chrome.port,
      output: "json",
      logLevel: "error",
      onlyCategories: ["performance", "accessibility", "best-practices"],
    })
    const score = (k) => Math.round((lhr.categories[k]?.score ?? 0) * 100)
    const audit = (k) => lhr.audits[k]?.numericValue ?? Infinity
    const r = {
      performance: score("performance"),
      accessibility: score("accessibility"),
      "best-practices": score("best-practices"),
      lcp: Math.round(audit("largest-contentful-paint")),
      cls: Number(audit("cumulative-layout-shift").toFixed(3)),
      tbt: Math.round(audit("total-blocking-time")),
    }
    const problems = [
      ...["performance", "accessibility", "best-practices"]
        .filter((k) => r[k] < BUDGET[k])
        .map((k) => `${k} ${r[k]} < ${BUDGET[k]}`),
      ...(r.lcp > BUDGET.lcp ? [`LCP ${r.lcp}ms > ${BUDGET.lcp}ms`] : []),
      ...(r.cls > BUDGET.cls ? [`CLS ${r.cls} > ${BUDGET.cls}`] : []),
      ...(r.tbt > BUDGET.tbt ? [`TBT ${r.tbt}ms > ${BUDGET.tbt}ms`] : []),
    ]
    failed ||= problems.length > 0
    console.log(
      `${problems.length ? "✗" : "✓"} ${path.padEnd(42)} perf ${r.performance} · a11y ${r.accessibility} · bp ${r["best-practices"]} · LCP ${r.lcp}ms · CLS ${r.cls} · TBT ${r.tbt}ms${problems.length ? `\n    ${problems.join("; ")}` : ""}`,
    )
  }
} finally {
  await chrome.kill()
}
process.exit(failed ? 1 : 0)
