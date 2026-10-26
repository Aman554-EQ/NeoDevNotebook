"use client"

import { Line } from "@react-three/drei"
import { SceneStage, TextFace, useThemeColors } from "../../_shared/three/toolkit"
import { useViz } from "../../_shared/viz-frame"
import { DICT_FRAMES } from "./model"

const SLOT_X = (i: number) => (i - 3.5) * 0.9
const ENTRY_X = (j: number, n: number) => (j - (n - 1) / 2) * 2.05
const SLOT_Y = 1.0
const ENTRY_Y = -1.1

export default function DictScene3D() {
  const { step } = useViz()
  const f = DICT_FRAMES[step]!
  const c = useThemeColors()
  const n = f.entries.length
  return (
    <SceneStage code={f.code} camera={[0, 0.8, 7.2]} fitWidth={8.8}>
      <TextFace
        text="index table"
        color={c.muted}
        width={2}
        height={0.3}
        position={[-3.2, 1.75, 0]}
        bold={false}
      />
      {f.slots.map((entry, i) => {
        const order = f.probe.indexOf(i)
        const landed = order !== -1 && order === f.probe.length - 1
        const color = landed
          ? c.accent
          : order !== -1
            ? c.medium
            : entry === null
              ? c.rule
              : c.accentSoft
        const ink = landed || order !== -1 ? c.accentInk : c.ink
        return (
          <group key={i} position={[SLOT_X(i), SLOT_Y, 0]}>
            <mesh>
              <boxGeometry args={[0.72, 0.72, 0.5]} />
              <meshStandardMaterial
                color={color}
                transparent
                opacity={entry === null && order === -1 ? 0.9 : 1}
              />
            </mesh>
            {entry !== null && (
              <TextFace
                text={String(entry)}
                color={ink}
                width={0.6}
                height={0.5}
                position={[0, 0, 0.26]}
              />
            )}
            <TextFace
              text={`slot ${i}`}
              color={c.muted}
              width={0.8}
              height={0.24}
              position={[0, -0.55, 0.26]}
              bold={false}
            />
            {order !== -1 && f.probe.length > 1 && (
              <TextFace
                text={`#${order + 1}`}
                color={c.ink}
                width={0.5}
                height={0.26}
                position={[0, 0.55, 0.26]}
              />
            )}
          </group>
        )
      })}
      <TextFace
        text="entries (insertion order)"
        color={c.muted}
        width={3}
        height={0.3}
        position={[0, -0.2, 0]}
        bold={false}
      />
      {f.entries.map((e, j) => (
        <group key={e.key} position={[ENTRY_X(j, n), ENTRY_Y, 0]}>
          <mesh>
            <boxGeometry args={[1.9, 0.8, 0.5]} />
            <meshStandardMaterial color={f.hit === j ? c.accent : c.accentSoft} />
          </mesh>
          <TextFace
            text={`${j}: ${e.key} → ${e.value}`}
            color={f.hit === j ? c.accentInk : c.ink}
            width={1.8}
            height={0.56}
            position={[0, 0, 0.26]}
          />
        </group>
      ))}
      {f.slots.flatMap((entry, i) =>
        entry === null
          ? []
          : [
              <Line
                key={i}
                points={[
                  [SLOT_X(i), SLOT_Y - 0.4, 0],
                  [ENTRY_X(entry, n), ENTRY_Y + 0.38, 0],
                ]}
                color={f.hit === entry ? c.accent : c.muted}
                lineWidth={f.hit === entry ? 2.5 : 1}
              />,
            ],
      )}
    </SceneStage>
  )
}
