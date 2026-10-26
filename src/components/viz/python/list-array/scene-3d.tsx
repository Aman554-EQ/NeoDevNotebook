"use client"

import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import { RoundedBox } from "@react-three/drei"
import { MathUtils, type Group, type Mesh } from "three"
import { SceneStage, TextFace, useThemeColors, type ThemeColors } from "../../_shared/three/toolkit"
import { useViz } from "../../_shared/viz-frame"
import { LIST_OPS_FRAMES } from "./model"

const SLOT = 0.82

/** One item cube. Items are keyed by value, so a shifted item visibly slides to its new slot. */
function Item({
  value,
  index,
  total,
  focused,
  colors,
}: {
  value: string
  index: number
  total: number
  focused: boolean
  colors: ThemeColors
}) {
  const ref = useRef<Group>(null)
  const x = (index - (total - 1) / 2) * SLOT
  useFrame((_, dt) => {
    const g = ref.current
    if (!g) return
    g.position.x = MathUtils.damp(g.position.x, x, 6, dt)
    g.position.y = MathUtils.damp(g.position.y, focused ? 0.15 : 0, 6, dt)
    g.scale.setScalar(MathUtils.damp(g.scale.x, 1, 6, dt))
  })
  return (
    <group ref={ref} position={[x, 1.2, 0.05]} scale={0.01}>
      <mesh>
        <boxGeometry args={[0.66, 0.66, 0.66]} />
        <meshStandardMaterial color={focused ? colors.medium : colors.accent} />
      </mesh>
      <TextFace
        text={value}
        color={colors.accentInk}
        width={0.6}
        height={0.55}
        position={[0, 0, 0.34]}
      />
    </group>
  )
}

function Block({ capacity, colors }: { capacity: number; colors: ThemeColors }) {
  const ref = useRef<Mesh>(null)
  const width = capacity * SLOT + 0.2
  useFrame((_, dt) => {
    const m = ref.current
    if (m) m.scale.x = MathUtils.damp(m.scale.x, width, 5, dt)
  })
  return (
    <group position={[0, -0.45, 0]}>
      <RoundedBox ref={ref} args={[1, 0.18, 1.1]} radius={0.05} scale={[width, 1, 1]}>
        <meshStandardMaterial color={colors.accentSoft} />
      </RoundedBox>
      {Array.from({ length: capacity }, (_, i) => (
        <TextFace
          key={i}
          text={String(i)}
          color={colors.muted}
          width={0.6}
          height={0.4}
          position={[(i - (capacity - 1) / 2) * SLOT, -0.36, 0.56]}
          bold={false}
        />
      ))}
    </group>
  )
}

export default function ListArrayScene3D() {
  const { step } = useViz()
  const frame = LIST_OPS_FRAMES[step]!
  const colors = useThemeColors()
  const total = frame.slots.length
  return (
    // Framed for the largest block in the sequence (8 slots), so the camera never jumps between steps.
    <SceneStage
      code={frame.code}
      camera={[0, 1.6, 8]}
      fit={{ width: 7.0, height: 1.8, center: [0, -0.2] }}
      height="h-48 sm:h-60"
    >
      <Block capacity={total} colors={colors} />
      {frame.slots.map((v, i) =>
        v === null ? (
          <mesh key={`spare-${i}`} position={[(i - (total - 1) / 2) * SLOT, 0, 0]}>
            <boxGeometry args={[0.66, 0.66, 0.66]} />
            <meshStandardMaterial color={colors.rule} transparent opacity={0.35} />
          </mesh>
        ) : (
          <Item
            key={v}
            value={v}
            index={i}
            total={total}
            focused={frame.focus.includes(i)}
            colors={colors}
          />
        ),
      )}
    </SceneStage>
  )
}
