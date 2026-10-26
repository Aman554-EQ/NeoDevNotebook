"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { Html, Line, OrbitControls, RoundedBox } from "@react-three/drei"
import { CanvasTexture, MathUtils, SRGBColorSpace, type Group } from "three"
import { useViz } from "../_shared/viz-frame"
import { NAMES_FRAMES, type NameTag, type ObjectBox } from "./names-model"

type Colors = {
  accent: string
  accentInk: string
  accentSoft: string
  ink: string
  muted: string
  surface: string
}

/** Reads design tokens so the 3D scene matches the current light/dark theme. */
function useThemeColors(): Colors {
  const read = (): Colors => {
    const css = getComputedStyle(document.documentElement)
    const v = (name: string) => css.getPropertyValue(name).trim() || "#888"
    return {
      accent: v("--accent"),
      accentInk: v("--accent-ink"),
      accentSoft: v("--accent-soft"),
      ink: v("--ink"),
      muted: v("--muted"),
      surface: v("--surface"),
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

/** A number painted on the front face of a cube (a texture, so it rotates with the cube). */
function ValueFace({ value, color }: { value: number; color: string }) {
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas")
    canvas.width = canvas.height = 128
    const ctx = canvas.getContext("2d")!
    const mono = getComputedStyle(document.body).getPropertyValue("--font-jetbrains") || "monospace"
    ctx.fillStyle = color
    ctx.font = `bold 72px ${mono}`
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillText(String(value), 64, 68)
    const tex = new CanvasTexture(canvas)
    tex.colorSpace = SRGBColorSpace
    return tex
  }, [value, color])
  useEffect(() => () => texture.dispose(), [texture])
  return (
    <mesh position={[0, 0, 0.312]}>
      <planeGeometry args={[0.6, 0.6]} />
      <meshBasicMaterial map={texture} transparent />
    </mesh>
  )
}

const CELL = 0.8
const widthOf = (o: ObjectBox) => o.items.length * CELL + 0.4

function ObjectMesh({ obj, colors }: { obj: ObjectBox; colors: Colors }) {
  const ref = useRef<Group>(null)
  useFrame((_, dt) => {
    const g = ref.current
    if (!g) return
    g.scale.setScalar(MathUtils.damp(g.scale.x, 1, 6, dt))
  })
  const w = widthOf(obj)
  return (
    <group ref={ref} position={[obj.x, 0, 0]} scale={0.01}>
      <RoundedBox args={[w, 1, 1]} radius={0.12}>
        <meshStandardMaterial color={colors.accentSoft} transparent opacity={0.85} />
      </RoundedBox>
      {obj.items.map((v, i) => (
        <mesh key={i} position={[-w / 2 + 0.2 + CELL / 2 + i * CELL, 0, 0.25]}>
          <boxGeometry args={[0.62, 0.62, 0.62]} />
          <meshStandardMaterial color={colors.accent} />
          <ValueFace value={v} color={colors.accentInk} />
        </mesh>
      ))}
      <Html position={[0, -0.85, 0]} center zIndexRange={[10, 0]}>
        <span className="text-muted pointer-events-none text-xs whitespace-nowrap select-none">
          list object
        </span>
      </Html>
    </group>
  )
}

function NameTagMesh({
  tag,
  index,
  objects,
  colors,
}: {
  tag: NameTag
  index: number
  objects: ObjectBox[]
  colors: Colors
}) {
  const group = useRef<Group>(null)
  const line = useRef<React.ComponentRef<typeof Line>>(null)
  const target = objects.find((o) => o.id === tag.target)!
  const goal = useMemo(() => ({ x: target.x - 0.5 + index * 1.0, y: 2.1 }), [target.x, index])

  useFrame((_, dt) => {
    const g = group.current
    if (!g) return
    g.position.x = MathUtils.damp(g.position.x, goal.x, 5, dt)
    g.position.y = MathUtils.damp(g.position.y, goal.y, 5, dt)
    // Line from the tag down to the top of its object.
    line.current?.geometry.setPositions([g.position.x, g.position.y - 0.3, 0, target.x, 0.55, 0])
  })

  return (
    <>
      <group ref={group} position={[goal.x, goal.y + 1, 0]}>
        <Html center zIndexRange={[10, 0]}>
          <span
            className="pointer-events-none rounded-full border-2 px-3 py-0.5 font-mono text-base font-bold select-none"
            style={{ borderColor: colors.ink, color: colors.ink, background: colors.surface }}
          >
            {tag.name}
          </span>
        </Html>
      </group>
      <Line
        ref={line}
        points={[
          [0, 0, 0],
          [0, 0, 0],
        ]}
        color={colors.muted}
        lineWidth={2}
      />
    </>
  )
}

export default function NamesScene3D() {
  const { step } = useViz()
  const frame = NAMES_FRAMES[step]!
  const colors = useThemeColors()
  return (
    <div className="w-full pt-5" aria-hidden>
      <p className="text-center">
        <code className="bg-surface-2 rounded-md px-3 py-1 font-mono text-sm">{frame.code}</code>
      </p>
      <div className="h-64 sm:h-72">
        <Canvas camera={{ position: [0, 1.2, 7], fov: 45 }} dpr={[1, 2]}>
          <ambientLight intensity={0.8} />
          <directionalLight position={[3, 5, 4]} intensity={1.2} />
          {frame.objects.map((o) => (
            <ObjectMesh key={o.id} obj={o} colors={colors} />
          ))}
          {frame.names.map((n, i) => (
            <NameTagMesh key={n.name} tag={n} index={i} objects={frame.objects} colors={colors} />
          ))}
          <OrbitControls enableZoom={false} enablePan={false} maxPolarAngle={Math.PI / 1.8} />
        </Canvas>
      </div>
    </div>
  )
}
