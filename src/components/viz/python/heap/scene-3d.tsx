"use client"

import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import { Line } from "@react-three/drei"
import { MathUtils, type Group } from "three"
import { SceneStage, TextFace, useThemeColors, type ThemeColors } from "../../_shared/three/toolkit"
import { useViz } from "../../_shared/viz-frame"
import { HEAP_FRAMES, heapNodePos } from "./model"

const ARRAY_Y = -1.9

/** A value ball keyed by its value, so swaps are visible as two balls trading places. */
function Node({
  value,
  index,
  hot,
  colors,
}: {
  value: number
  index: number
  hot: boolean
  colors: ThemeColors
}) {
  const ref = useRef<Group>(null)
  const { x, y } = heapNodePos(index)
  useFrame((_, dt) => {
    const g = ref.current
    if (!g) return
    g.position.x = MathUtils.damp(g.position.x, x, 5, dt)
    g.position.y = MathUtils.damp(g.position.y, y, 5, dt)
    g.scale.setScalar(MathUtils.damp(g.scale.x, 1, 6, dt))
  })
  return (
    <group ref={ref} position={[x, y - 0.6, 0]} scale={0.01}>
      <mesh>
        <sphereGeometry args={[0.34, 32, 32]} />
        <meshStandardMaterial color={hot ? colors.medium : colors.accent} />
      </mesh>
      <TextFace
        text={String(value)}
        color={colors.accentInk}
        width={0.46}
        height={0.4}
        position={[0, 0, 0.35]}
      />
    </group>
  )
}

export default function HeapScene3D() {
  const { step } = useViz()
  const f = HEAP_FRAMES[step]!
  const c = useThemeColors()
  return (
    <SceneStage code={f.code} camera={[0, 0.2, 7.4]} fitWidth={7.4} height="h-72 sm:h-80">
      {f.heap.map((_, i) => {
        if (i === 0) return null
        const a = heapNodePos(i)
        const p = heapNodePos(Math.floor((i - 1) / 2))
        return (
          <Line
            key={`e${i}`}
            points={[
              [p.x, p.y, -0.1],
              [a.x, a.y, -0.1],
            ]}
            color={c.muted}
            lineWidth={1.5}
          />
        )
      })}
      {f.heap.map((v, i) => (
        <Node key={v} value={v} index={i} hot={f.path.includes(i)} colors={c} />
      ))}
      {f.heap.map((v, i) => (
        <group key={`a${i}`} position={[(i - 2) * 0.82, ARRAY_Y, 0]}>
          <mesh>
            <boxGeometry args={[0.7, 0.6, 0.4]} />
            <meshStandardMaterial color={f.path.includes(i) ? c.medium : c.accentSoft} />
          </mesh>
          <TextFace
            text={String(v)}
            color={c.ink}
            width={0.5}
            height={0.42}
            position={[0, 0, 0.21]}
          />
          <TextFace
            text={`[${i}]`}
            color={c.muted}
            width={0.5}
            height={0.22}
            position={[0, -0.45, 0.21]}
            bold={false}
          />
        </group>
      ))}
      {f.popped !== undefined && (
        <TextFace
          text={`returned ${f.popped}`}
          color={c.easy}
          width={2}
          height={0.36}
          position={[2.6, ARRAY_Y, 0.2]}
        />
      )}
    </SceneStage>
  )
}
