"use client"

import { useEffect, useRef } from "react"
import { BRAND_PATHS } from "./logo-paths"

type Node = { x: number; y: number; vx: number; vy: number; r: number }
type Floater = {
  name: (typeof FLOATERS)[number]
  path: Path2D
  colour: string
  x: number
  y: number
  vx: number
  vy: number
  a: number
  va: number
  size: number
  /** 0..1: eases to 0 while the logo is behind text (see data-backdrop-avoid). */
  fade: number
}
type Rect = { x0: number; y0: number; x1: number; y1: number }

const LINK = 130 // px: nodes closer than this are joined by a line
const FLOATERS = [
  "python",
  "django",
  "fastapi",
  "git",
  "docker",
  "pytorch",
  "typescript",
  "react",
] as const

/**
 * The homepage's moving backdrop: slow-drifting nodes joined like a graph, with a few tech logos
 * floating among them. Purely decorative. Kept light on purpose:
 * - starts after the page is idle, so it never delays the first paint or input;
 * - pauses when the tab is hidden or the hero is scrolled away;
 * - with reduced motion it draws one still frame;
 * - everything is drawn at very low opacity behind the content, and floating logos fade out
 *   while they pass behind elements marked `data-backdrop-avoid` (the hero text).
 */
export function NodeField() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas?.getContext("2d")
    if (!canvas || !ctx) return
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    let nodes: Node[] = []
    let floaters: Floater[] = []
    let w = 0
    let h = 0
    let raf = 0
    let visible = true
    let ink = "#4f46e5"
    let alpha = 0.06
    let avoid: Rect[] = []

    const readTheme = () => {
      const css = getComputedStyle(document.documentElement)
      ink = css.getPropertyValue("--backdrop-ink").trim() || ink
      alpha = Number(css.getPropertyValue("--backdrop-opacity")) || alpha
      for (const f of floaters) f.colour = css.getPropertyValue(`--brand-${f.name}`).trim() || ink
    }

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      w = canvas.clientWidth
      h = canvas.clientHeight
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const count = Math.min(64, Math.round((w * h) / 16000))
      const rand = mulberry(7)
      nodes = Array.from({ length: count }, () => ({
        x: rand() * w,
        y: rand() * h,
        vx: (rand() - 0.5) * 0.25,
        vy: (rand() - 0.5) * 0.25,
        r: 1.2 + rand() * 1.6,
      }))
      const n = w < 640 ? 4 : FLOATERS.length
      floaters = FLOATERS.slice(0, n).map((name, i) => ({
        name,
        path: new Path2D(BRAND_PATHS[name].path),
        colour: ink,
        x: ((i + 0.5) / n) * w + (rand() - 0.5) * 80,
        y: rand() * h,
        vx: (rand() - 0.5) * 0.18,
        vy: (rand() - 0.5) * 0.18,
        a: (rand() - 0.5) * 0.6,
        va: (rand() - 0.5) * 0.0015,
        size: w < 640 ? 22 : 30,
        fade: 1,
      }))
      measureAvoid()
      for (const f of floaters) f.fade = behindText(f.x, f.y) ? 0 : 1
      readTheme()
    }

    // Text to keep clear of, in canvas coordinates (padded so a logo never touches a letter).
    const measureAvoid = () => {
      const c = canvas.getBoundingClientRect()
      const pad = 28
      avoid = [...document.querySelectorAll("[data-backdrop-avoid]")].map((el) => {
        const r = el.getBoundingClientRect()
        return {
          x0: r.left - c.left - pad,
          y0: r.top - c.top - pad,
          x1: r.right - c.left + pad,
          y1: r.bottom - c.top + pad,
        }
      })
    }
    const behindText = (x: number, y: number) =>
      avoid.some((r) => x > r.x0 && x < r.x1 && y > r.y0 && y < r.y1)

    const draw = () => {
      ctx.clearRect(0, 0, w, h)
      ctx.strokeStyle = ink
      ctx.fillStyle = ink
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i]!
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j]!
          const d = Math.hypot(a.x - b.x, a.y - b.y)
          if (d < LINK) {
            ctx.globalAlpha = alpha * 2.2 * (1 - d / LINK)
            ctx.lineWidth = 1
            ctx.beginPath()
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(b.x, b.y)
            ctx.stroke()
          }
        }
      }
      ctx.globalAlpha = Math.min(alpha * 5, 0.35)
      for (const n of nodes) {
        ctx.beginPath()
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2)
        ctx.fill()
      }
      const logoAlpha = Math.min(alpha * 2.4, 0.16)
      for (const f of floaters) {
        if (f.fade < 0.02) continue
        ctx.globalAlpha = logoAlpha * f.fade
        ctx.save()
        ctx.translate(f.x, f.y)
        ctx.rotate(f.a)
        ctx.scale(f.size / 24, f.size / 24)
        ctx.translate(-12, -12)
        ctx.fillStyle = f.colour
        ctx.fill(f.path)
        ctx.restore()
      }
      ctx.globalAlpha = 1
    }

    const step = () => {
      for (const n of [...nodes, ...floaters]) {
        n.x += n.vx
        n.y += n.vy
        if (n.x < -20 || n.x > w + 20) n.vx *= -1
        if (n.y < -20 || n.y > h + 20) n.vy *= -1
      }
      for (const f of floaters) {
        f.a += f.va
        f.fade += ((behindText(f.x, f.y) ? 0 : 1) - f.fade) * 0.04
      }
      draw()
      raf = visible && !document.hidden ? requestAnimationFrame(step) : 0
    }
    const play = () => {
      if (still) return draw()
      if (!raf && visible && !document.hidden) raf = requestAnimationFrame(step)
    }

    const io = new IntersectionObserver(([e]) => {
      visible = !!e?.isIntersecting
      play()
    })
    const ro = new ResizeObserver(() => {
      resize()
      draw()
    })
    // The theme toggle flips data-theme on <html>: re-read the colours.
    const mo = new MutationObserver(() => {
      readTheme()
      draw()
    })
    const onVisibility = () => play()

    const start = () => {
      resize()
      io.observe(canvas)
      ro.observe(canvas)
      mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] })
      document.addEventListener("visibilitychange", onVisibility)
      canvas.dataset.ready = "true"
      play()
    }
    const idle = window.requestIdleCallback
      ? window.requestIdleCallback(start, { timeout: 1500 })
      : window.setTimeout(start, 300)

    return () => {
      if (window.cancelIdleCallback) window.cancelIdleCallback(idle)
      else window.clearTimeout(idle)
      cancelAnimationFrame(raf)
      io.disconnect()
      ro.disconnect()
      mo.disconnect()
      document.removeEventListener("visibilitychange", onVisibility)
    }
  }, [])

  return (
    <canvas
      ref={ref}
      aria-hidden
      data-testid="node-field"
      className="pointer-events-none absolute inset-0 h-full w-full"
    />
  )
}

/** Small seeded random: the same layout on every visit (no jumpy reshuffles). */
function mulberry(seed: number) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
