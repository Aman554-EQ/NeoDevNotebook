"use client"

import { useMemo, useRef } from "react"
import { useFrame } from "@react-three/fiber"
import { Line, RoundedBox } from "@react-three/drei"
import { MathUtils, type Group } from "three"
import {
  NameTag3D,
  SceneStage,
  TextFace,
  useThemeColors,
  type ThemeColors as Colors,
} from "../_shared/three/toolkit"
import { useViz } from "../_shared/viz-frame"
import { NAMES_FRAMES, type NameTag, type ObjectBox } from "./names-model"

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
          <TextFace text={String(v)} color={colors.accentInk} />
        </mesh>
      ))}
      <TextFace
        text="list object"
        color={colors.muted}
        width={2}
        height={0.4}
        position={[0, -0.75, 0.5]}
        bold={false}
      />
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
        <NameTag3D text={tag.name} colors={colors} />
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
    <SceneStage code={frame.code} fit={{ width: 6.4, height: 3.9, center: [-0.1, 0.65] }}>
      {frame.objects.map((o) => (
        <ObjectMesh key={o.id} obj={o} colors={colors} />
      ))}
      {frame.names.map((n, i) => (
        <NameTagMesh key={n.name} tag={n} index={i} objects={frame.objects} colors={colors} />
      ))}
    </SceneStage>
  )
}
