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
  type ThemeColors,
} from "../../_shared/three/toolkit"
import { useViz } from "../../_shared/viz-frame"
import {
  CELL_W,
  MEMORY_SCENARIOS,
  objectWidth,
  type MemObject,
  type MemoryScenarioName,
} from "./model"

const NAME_Y = 2.4

/** World position of slot i of an object (front face centre). */
function cellPos(o: MemObject, i: number): [number, number, number] {
  const w = objectWidth(o)
  return [o.x - w / 2 + 0.15 + CELL_W / 2 + i * CELL_W, o.y, 0.45]
}

function ObjectMesh({ obj, colors }: { obj: MemObject; colors: ThemeColors }) {
  const ref = useRef<Group>(null)
  useFrame((_, dt) => {
    const g = ref.current
    if (!g) return
    g.scale.setScalar(MathUtils.damp(g.scale.x, 1, 6, dt))
    g.position.x = MathUtils.damp(g.position.x, obj.x, 5, dt)
    g.position.y = MathUtils.damp(g.position.y, obj.y, 5, dt)
  })
  const w = objectWidth(obj)
  return (
    <group ref={ref} position={[obj.x, obj.y, 0]} scale={0.01}>
      <RoundedBox args={[w, 0.9, 0.8]} radius={0.1}>
        <meshStandardMaterial color={colors.accentSoft} transparent opacity={0.9} />
      </RoundedBox>
      <TextFace
        text={obj.type}
        color={colors.muted}
        width={Math.max(1.4, obj.type.length * 0.3)}
        height={0.42}
        position={[0, 0.78, 0.2]}
        bold={false}
      />
      {obj.value !== undefined && (
        <TextFace
          text={obj.value}
          color={colors.ink}
          width={w - 0.2}
          height={0.5}
          position={[0, 0, 0.41]}
        />
      )}
      {obj.cells?.map((c, i) => {
        const x = -w / 2 + 0.15 + CELL_W / 2 + i * CELL_W
        return (
          <group key={i} position={[x, 0, 0.3]}>
            <mesh>
              <boxGeometry args={[0.66, 0.6, 0.25]} />
              <meshStandardMaterial color={c.ref ? colors.surface : colors.accent} />
            </mesh>
            {c.ref ? (
              <mesh position={[0, 0, 0.14]}>
                <circleGeometry args={[0.09, 20]} />
                <meshBasicMaterial color={colors.ink} />
              </mesh>
            ) : (
              <TextFace
                text={c.text ?? ""}
                color={colors.accentInk}
                width={0.62}
                height={0.5}
                position={[0, 0, 0.13]}
              />
            )}
            {obj.cellLabels?.[i] && (
              <TextFace
                text={obj.cellLabels[i]!}
                color={colors.muted}
                width={0.74}
                height={0.22}
                position={[0, -0.6, 0.1]}
                bold={false}
              />
            )}
          </group>
        )
      })}
    </group>
  )
}

function NameTag({
  name,
  x,
  target,
  colors,
}: {
  name: string
  x: number
  target: MemObject
  colors: ThemeColors
}) {
  const group = useRef<Group>(null)
  const line = useRef<React.ComponentRef<typeof Line>>(null)
  useFrame((_, dt) => {
    const g = group.current
    if (!g) return
    g.position.x = MathUtils.damp(g.position.x, x, 5, dt)
    line.current?.geometry.setPositions([
      g.position.x,
      NAME_Y - 0.25,
      0,
      target.x,
      target.y + 1.0,
      0,
    ])
  })
  return (
    <>
      <group ref={group} position={[x, NAME_Y, 0]}>
        <NameTag3D text={name} colors={colors} />
      </group>
      <Line
        ref={line}
        points={[
          [x, NAME_Y, 0],
          [target.x, target.y + 1.0, 0],
        ]}
        color={colors.muted}
        lineWidth={2}
      />
    </>
  )
}

export default function MemoryScene3D({ scenario }: { scenario: MemoryScenarioName }) {
  const { step } = useViz()
  const frame = MEMORY_SCENARIOS[scenario].frames[step]!
  const colors = useThemeColors()
  const byId = useMemo(() => new Map(frame.objects.map((o) => [o.id, o])), [frame])
  return (
    <SceneStage code={frame.code} camera={[0, 0.5, 6.6]} fitWidth={9}>
      {frame.objects.map((o) => (
        <ObjectMesh key={o.id} obj={o} colors={colors} />
      ))}
      {frame.objects.flatMap((o) =>
        (o.cells ?? []).flatMap((c, i) => {
          const target = c.ref ? byId.get(c.ref) : undefined
          if (!target) return []
          return [
            <Line
              key={`${o.id}-${i}`}
              points={[cellPos(o, i), [target.x, target.y + 1.0, 0.2]]}
              color={colors.accent}
              lineWidth={2}
            />,
          ]
        }),
      )}
      {frame.names.map((n) => (
        <NameTag key={n.name} name={n.name} x={n.x} target={byId.get(n.target)!} colors={colors} />
      ))}
    </SceneStage>
  )
}
