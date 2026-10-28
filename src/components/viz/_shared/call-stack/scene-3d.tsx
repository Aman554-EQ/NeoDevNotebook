"use client"

import { useMemo, useRef } from "react"
import { useFrame } from "@react-three/fiber"
import { RoundedBox } from "@react-three/drei"
import { MathUtils, type Group } from "three"
import { SceneStage, TextFace, useNarrow, useThemeColors, type ThemeColors } from "../three/toolkit"
import { useViz } from "../viz-frame"
import type { StackFrameView, StackSnapshot } from "./model"

const SLAB_H = 0.55
const GAP = 0.12
const BASE_Y = -1.7
const slabY = (i: number) => BASE_Y + i * (SLAB_H + GAP)

function Slab({
  frame,
  index,
  top,
  returning,
  colors,
  narrow,
}: {
  frame: StackFrameView
  index: number
  top: boolean
  returning?: string
  colors: ThemeColors
  narrow: boolean
}) {
  const ref = useRef<Group>(null)
  // New frames drop onto the stack from above.
  useFrame((_, dt) => {
    const g = ref.current
    if (g) g.position.y = MathUtils.damp(g.position.y, slabY(index), 7, dt)
  })
  const fill = returning ? colors.easy : top ? colors.accent : colors.accentSoft
  const ink = returning || top ? colors.accentInk : colors.ink
  // One label across the slab: frame, return value (when returning), then its variables,
  // e.g. "tax() → 6.0 · amount=30, rate=0.2".
  const head = returning ? `${frame.title} → ${returning}` : frame.title
  // Phones show variables on the running frame only (a return shows just its value), so
  // every label stays readable.
  const showDetail = frame.detail && (!narrow || (top && !returning))
  const label = showDetail ? `${head} · ${frame.detail}` : head
  return (
    <group ref={ref} position={[0, slabY(index) + 1.5, 0]}>
      <RoundedBox args={[4.4, SLAB_H, 1.6]} radius={0.08}>
        <meshStandardMaterial color={fill} />
      </RoundedBox>
      <TextFace text={label} color={ink} width={4.2} height={0.46} position={[0, 0, 0.81]} />
    </group>
  )
}

export default function CallStackScene3D({
  snapshots,
  codeLines,
}: {
  snapshots: StackSnapshot[]
  codeLines: string[]
}) {
  const { step } = useViz()
  const snap = snapshots[step]!
  const colors = useThemeColors()
  const narrow = useNarrow()
  // Frame the tallest stack of the whole run, so the camera holds still while frames come and go.
  const fit = useMemo(() => {
    const depth = Math.max(1, ...snapshots.map((s) => s.frames.length))
    const bottom = BASE_Y - SLAB_H / 2
    const top = slabY(depth - 1) + SLAB_H / 2
    return {
      width: 5.2,
      height: top - bottom + 0.8,
      center: [0, (top + bottom) / 2] as [number, number],
    }
  }, [snapshots])
  return (
    <SceneStage code={codeLines[step]} camera={[2.2, 2.4, 7.5]} fit={fit}>
      {snap.frames.map((f, i) => (
        <Slab
          // Key by depth + title so a popped frame disappears and a new call drops in.
          key={`${i}-${f.title}`}
          frame={f}
          index={i}
          top={i === snap.frames.length - 1}
          returning={snap.returning?.index === i ? snap.returning.value : undefined}
          colors={colors}
          narrow={narrow}
        />
      ))}
    </SceneStage>
  )
}
