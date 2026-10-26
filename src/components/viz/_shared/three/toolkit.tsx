"use client"

/**
 * Shared building blocks for 3D scenes. Only lazily loaded scene files import this module,
 * so three.js never reaches the initial page bundle.
 */
import { useEffect, useMemo, useState } from "react"
import { Canvas, useThree } from "@react-three/fiber"
import type { PerspectiveCamera } from "three"
import { Billboard, OrbitControls } from "@react-three/drei"
import { CanvasTexture, SRGBColorSpace } from "three"

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
 * The font shrinks to fit long text into the plane.
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
    let size = 72
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

/**
 * Moves the camera back (never closer than its initial distance) so that `width` world units
 * fit horizontally. Keeps wide scenes readable on narrow phone screens.
 */
function FitWidth({ width, base }: { width: number; base: [number, number, number] }) {
  const camera = useThree((s) => s.camera) as PerspectiveCamera
  const aspect = useThree((s) => s.size.width / Math.max(1, s.size.height))
  // Depend on the numbers, not the array: a new array each render must not reset a user's rotation.
  const [bx, by, bz] = base
  useEffect(() => {
    const halfFov = (camera.fov * Math.PI) / 360
    const needed = width / 2 / (Math.tan(halfFov) * aspect)
    const scale = Math.max(1, needed / Math.hypot(bx, by, bz))
    camera.position.set(bx * scale, by * scale, bz * scale)
    camera.updateProjectionMatrix()
  }, [camera, aspect, width, bx, by, bz])
  return null
}

/** Standard stage: the current code line above a rotatable canvas with soft lighting. */
export function SceneStage({
  code,
  camera = [0, 1.2, 7],
  fov = 45,
  height = "h-64 sm:h-72",
  fitWidth,
  children,
}: {
  code?: string
  camera?: [number, number, number]
  fov?: number
  height?: string
  /** World units that must stay visible across the canvas width (narrow screens zoom out). */
  fitWidth?: number
  children: React.ReactNode
}) {
  return (
    <div className="w-full pt-5" aria-hidden>
      {code !== undefined && (
        <p className="px-4 text-center">
          <code className="bg-surface-2 rounded-md px-3 py-1 font-mono text-sm break-all">
            {code}
          </code>
        </p>
      )}
      <div className={height}>
        <Canvas camera={{ position: camera, fov }} dpr={[1, 2]}>
          <ambientLight intensity={0.8} />
          <directionalLight position={[3, 5, 4]} intensity={1.2} />
          {fitWidth !== undefined && <FitWidth width={fitWidth} base={camera} />}
          {children}
          <OrbitControls enableZoom={false} enablePan={false} maxPolarAngle={Math.PI / 1.8} />
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
  const w = Math.max(0.9, text.length * 0.2 + 0.5) * scale
  const h = 0.5 * scale
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
    ctx.font = `bold 64px ${mono}, monospace`
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
