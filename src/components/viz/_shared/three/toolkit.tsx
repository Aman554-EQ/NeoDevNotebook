"use client"

/**
 * Shared building blocks for 3D scenes. Only lazily loaded scene files import this module,
 * so three.js never reaches the initial page bundle.
 */
import { useEffect, useMemo, useState, useSyncExternalStore } from "react"
import { Canvas, useThree } from "@react-three/fiber"
import type { PerspectiveCamera } from "three"
import { Billboard, OrbitControls } from "@react-three/drei"
import { CanvasTexture, SRGBColorSpace, setConsoleFunction } from "three"

// @react-three/fiber 9 (latest stable) still constructs THREE.Clock, which three r183+ flags as
// deprecated on every canvas mount. Drop exactly that message; everything else reaches the console.
const CLOCK_DEPRECATION = "THREE.Clock: This module has been deprecated"
setConsoleFunction((type: "log" | "warn" | "error", message: string, ...params: unknown[]) => {
  if (type === "warn" && message.startsWith(CLOCK_DEPRECATION)) return
  console[type](message, ...params)
})

export type ThemeColors = {
  accent: string
  accentInk: string
  accentSoft: string
  ink: string
  muted: string
  surface: string
  rule: string
  highlight: string
  easy: string
  medium: string
  hard: string
}

/** Reads design tokens so 3D scenes match the current light/dark theme, and follows theme changes. */
export function useThemeColors(): ThemeColors {
  const read = (): ThemeColors => {
    const css = getComputedStyle(document.documentElement)
    const v = (name: string) => css.getPropertyValue(name).trim() || "#888"
    return {
      accent: v("--accent"),
      accentInk: v("--accent-ink"),
      accentSoft: v("--accent-soft"),
      ink: v("--ink"),
      muted: v("--muted"),
      surface: v("--surface"),
      rule: v("--rule"),
      highlight: v("--highlight"),
      easy: v("--easy"),
      medium: v("--medium"),
      hard: v("--hard"),
    }
  }
  const [colors, setColors] = useState(read)
  useEffect(() => {
    const mo = new MutationObserver(() => setColors(read()))
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] })
    return () => mo.disconnect()
  }, [])
  return colors
}

/**
 * Text painted on a plane (a canvas texture), so it rotates with the 3D object it belongs to.
 * The font fills most of the plane's height and shrinks to fit long text into its width.
 */
export function TextFace({
  text,
  color,
  width = 0.6,
  height = 0.6,
  position = [0, 0, 0.312],
  bold = true,
}: {
  text: string
  color: string
  width?: number
  height?: number
  position?: [number, number, number]
  bold?: boolean
}) {
  const texture = useMemo(() => {
    const px = 128
    const canvas = document.createElement("canvas")
    canvas.width = Math.round(px * (width / height))
    canvas.height = px
    const ctx = canvas.getContext("2d")!
    const mono = getComputedStyle(document.body).getPropertyValue("--font-jetbrains") || "monospace"
    let size = 96
    const font = () => `${bold ? "bold " : ""}${size}px ${mono}, monospace`
    ctx.font = font()
    while (size > 18 && ctx.measureText(text).width > canvas.width * 0.88) {
      size -= 4
      ctx.font = font()
    }
    ctx.fillStyle = color
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillText(text, canvas.width / 2, px / 2 + 4)
    const tex = new CanvasTexture(canvas)
    tex.colorSpace = SRGBColorSpace
    return tex
  }, [text, color, width, height, bold])
  useEffect(() => () => texture.dispose(), [texture])
  return (
    <mesh position={position}>
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial map={texture} transparent />
    </mesh>
  )
}

/** True on phone-width screens, where scenes switch to a more compact layout with larger labels. */
export function useNarrow() {
  return useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia(NARROW_QUERY)
      mq.addEventListener("change", onChange)
      return () => mq.removeEventListener("change", onChange)
    },
    () => window.matchMedia(NARROW_QUERY).matches,
    () => false,
  )
}
const NARROW_QUERY = "(max-width: 639px)"

/** The part of the scene the camera must frame: a box of world units around a centre point. */
export type SceneFit = { width: number; height: number; center?: [number, number] }

/**
 * Places the camera along its initial direction at the distance where the content box just fits
 * the canvas (both width and height, plus a margin), so scenes fill wide desktop canvases and
 * still fit narrow phones.
 */
function FitContent({ fit, dir }: { fit: SceneFit; dir: [number, number, number] }) {
  const camera = useThree((s) => s.camera) as PerspectiveCamera
  const aspect = useThree((s) => s.size.width / Math.max(1, s.size.height))
  // Depend on the numbers, not the arrays: a new array each render must not reset a user's rotation.
  const { width, height } = fit
  const [cx, cy] = fit.center ?? [0, 0]
  const [dx, dy, dz] = dir
  useEffect(() => {
    const tanV = Math.tan((camera.fov * Math.PI) / 360)
    const margin = 1.12
    const distance = Math.max(width / 2 / (tanV * aspect), height / 2 / tanV) * margin + 0.6
    const len = Math.hypot(dx, dy, dz)
    camera.position.set(
      cx + (dx / len) * distance,
      cy + (dy / len) * distance,
      (dz / len) * distance,
    )
    camera.lookAt(cx, cy, 0)
    camera.updateProjectionMatrix()
  }, [camera, aspect, width, height, cx, cy, dx, dy, dz])
  return null
}

/** Standard stage: the current code line above a rotatable canvas with soft lighting. */
export function SceneStage({
  code,
  camera = [0, 1.2, 7],
  fov = 45,
  height = "h-64 sm:h-72",
  fit,
  children,
}: {
  code?: string
  /** Camera position; with `fit`, only its direction is used. */
  camera?: [number, number, number]
  fov?: number
  height?: string
  /** World-space box the camera keeps in view at every canvas size. */
  fit?: SceneFit
  children: React.ReactNode
}) {
  const [cx, cy] = fit?.center ?? [0, 0]
  return (
    <div className="w-full pt-5" aria-hidden>
      {code !== undefined && (
        <p className="px-4 text-center">
          <code className="bg-surface-2 inline-block max-w-full rounded-md px-3 py-1 font-mono text-sm break-words">
            {code}
          </code>
        </p>
      )}
      <div className={height}>
        <Canvas camera={{ position: camera, fov }} dpr={[1, 2]}>
          <ambientLight intensity={0.8} />
          <directionalLight position={[3, 5, 4]} intensity={1.2} />
          {fit && <FitContent fit={fit} dir={camera} />}
          {children}
          <OrbitControls
            target={[cx, cy, 0]}
            enableZoom={false}
            enablePan={false}
            maxPolarAngle={Math.PI / 1.8}
          />
        </Canvas>
      </div>
    </div>
  )
}

/**
 * A name tag drawn inside the scene: a pill (fill, border and text painted into one canvas
 * texture) that always faces the camera. Used instead of drei's Html overlay, which fails to
 * mount for elements present on the canvas's first render.
 */
export function NameTag3D({
  text,
  colors,
  scale = 1,
}: {
  text: string
  colors: ThemeColors
  scale?: number
}) {
  const w = Math.max(1.0, text.length * 0.24 + 0.36) * scale
  const h = 0.6 * scale
  const texture = useMemo(() => {
    const px = 128
    const canvas = document.createElement("canvas")
    canvas.width = Math.round(px * (w / h))
    canvas.height = px
    const ctx = canvas.getContext("2d")!
    const line = 10
    ctx.beginPath()
    ctx.roundRect(line / 2, line / 2, canvas.width - line, px - line, (px - line) / 2)
    ctx.fillStyle = colors.surface
    ctx.fill()
    ctx.lineWidth = line
    ctx.strokeStyle = colors.ink
    ctx.stroke()
    const mono = getComputedStyle(document.body).getPropertyValue("--font-jetbrains") || "monospace"
    ctx.font = `bold 84px ${mono}, monospace`
    ctx.fillStyle = colors.ink
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillText(text, canvas.width / 2, px / 2 + 4)
    const tex = new CanvasTexture(canvas)
    tex.colorSpace = SRGBColorSpace
    return tex
  }, [text, colors.surface, colors.ink, w, h])
  useEffect(() => () => texture.dispose(), [texture])
  return (
    <Billboard>
      <mesh>
        <planeGeometry args={[w, h]} />
        <meshBasicMaterial map={texture} transparent />
      </mesh>
    </Billboard>
  )
}
