"use client"

import { Line } from "@react-three/drei"
import { SceneStage, TextFace, useThemeColors } from "../../_shared/three/toolkit"
import { useViz } from "../../_shared/viz-frame"
import { DICT_FRAMES } from "./model"

const SLOT_X = (i: number) => (i - 3.5) * 0.9
const SLOT_Y = 1.0

/** Entries sit in two columns, read left to right then top to bottom (insertion order). */
const ENTRY_X = (j: number) => (j % 2 === 0 ? -1.75 : 1.75)
const ENTRY_Y = (j: number) => -1.15 - Math.floor(j / 2) * 1.0
const ENTRY_BOX = [3.3, 0.78] as const
const ENTRIES_LABEL_Y = -3.0

export default function DictScene3D() {
  const { step } = useViz()
  const f = DICT_FRAMES[step]!
  const c = useThemeColors()
  return (
    <SceneStage
      code={f.code}
      camera={[0, 0.6, 7.2]}
      height="h-72 sm:h-80"
      fit={{ width: 7.4, height: 5.6, center: [0, -0.6] }}
    >
      <TextFace
        text="index table (slots 0–7)"
        color={c.muted}
        width={6}
        height={0.34}
        position={[0, 2.05, 0]}
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
              text={String(i)}
              color={c.muted}
              width={0.6}
              height={0.38}
              position={[0, -0.6, 0.26]}
              bold={false}
            />
            {order !== -1 && f.probe.length > 1 && (
              <TextFace
                text={`#${order + 1}`}
                color={c.ink}
                width={0.7}
                height={0.36}
                position={[0, 0.6, 0.26]}
              />
            )}
          </group>
        )
      })}
      <TextFace
        text="entries array (insertion order)"
        color={c.muted}
        width={7.4}
        height={0.34}
        position={[0, ENTRIES_LABEL_Y, 0]}
        bold={false}
      />
      {f.entries.map((entry, j) => (
        <group key={entry.key} position={[ENTRY_X(j), ENTRY_Y(j), 0]}>
          <mesh>
            <boxGeometry args={[ENTRY_BOX[0], ENTRY_BOX[1], 0.5]} />
            <meshStandardMaterial color={f.hit === j ? c.accent : c.accentSoft} />
          </mesh>
          <TextFace
            text={`${j}: ${entry.key} → ${entry.value}`}
            color={f.hit === j ? c.accentInk : c.ink}
            width={ENTRY_BOX[0] - 0.1}
            height={0.6}
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
                  // Behind the boxes, so a line to the second row passes under the first.
                  [SLOT_X(i), SLOT_Y - 0.85, -0.3],
                  [ENTRY_X(entry), ENTRY_Y(entry) + ENTRY_BOX[1] / 2, -0.3],
                ]}
                color={f.hit === entry ? c.accent : c.muted}
                lineWidth={f.hit === entry ? 2.5 : 1}
              />,
            ],
      )}
    </SceneStage>
  )
}
