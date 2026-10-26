"use client"

import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import { RoundedBox } from "@react-three/drei"
import { MathUtils, type Group } from "three"
import { SceneStage, TextFace, useThemeColors, type ThemeColors } from "../three/toolkit"
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
}: {
  frame: StackFrameView
  index: number
  top: boolean
  returning?: string
  colors: ThemeColors
}) {
  const ref = useRef<Group>(null)
  // New frames drop onto the stack from above.
  useFrame((_, dt) => {
    const g = ref.current
    if (g) g.position.y = MathUtils.damp(g.position.y, slabY(index), 7, dt)
  })
  const fill = returning ? colors.easy : top ? colors.accent : colors.accentSoft
  const ink = returning || top ? colors.accentInk : colors.ink
  const label = returning ? `${frame.title} → ${returning}` : frame.title
  return (
    <group ref={ref} position={[0, slabY(index) + 1.5, 0]}>
      <RoundedBox args={[4.4, SLAB_H, 1.6]} radius={0.08}>
        <meshStandardMaterial color={fill} />
      </RoundedBox>
      <TextFace text={label} color={ink} width={2.1} height={0.42} position={[-1.05, 0, 0.81]} />
      {frame.detail && (
        <TextFace
          text={frame.detail}
          color={ink}
          width={2.1}
          height={0.36}
          position={[1.1, 0, 0.81]}
          bold={false}
        />
      )}
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
  return (
    <SceneStage code={codeLines[step]} camera={[2.2, 2.4, 7.5]} fitWidth={5.6}>
      {snap.frames.map((f, i) => (
        <Slab
          // Key by depth + title so a popped frame disappears and a new call drops in.
          key={`${i}-${f.title}`}
          frame={f}
          index={i}
          top={i === snap.frames.length - 1}
          returning={snap.returning?.index === i ? snap.returning.value : undefined}
          colors={colors}
        />
      ))}
    </SceneStage>
  )
}
