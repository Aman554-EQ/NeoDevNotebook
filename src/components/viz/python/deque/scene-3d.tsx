"use client"

import { Line, RoundedBox } from "@react-three/drei"
import { SceneStage, TextFace, useThemeColors } from "../../_shared/three/toolkit"
import { useViz } from "../../_shared/viz-frame"
import { DEQUE_FRAMES } from "./model"

const SLOT = 0.8
const BLOCK_W = 4 * SLOT + 0.3
const GAP = 0.9

export default function DequeScene3D() {
  const { step } = useViz()
  const f = DEQUE_FRAMES[step]!
  const c = useThemeColors()
  const total = f.blocks.length * BLOCK_W + (f.blocks.length - 1) * GAP
  const blockX = (b: number) => -total / 2 + BLOCK_W / 2 + b * (BLOCK_W + GAP)
  return (
    // Framed for two blocks (the most any step shows), so the camera never jumps between steps.
    <SceneStage
      code={f.code}
      camera={[0, 1.4, 7]}
      fit={{ width: 8.2, height: 2.8, center: [0, 0.1] }}
      height="h-56 sm:h-64"
    >
      {f.blocks.map((block, b) => (
        <group key={b} position={[blockX(b), 0, 0]}>
          <RoundedBox args={[BLOCK_W, 1.0, 0.6]} radius={0.08}>
            <meshStandardMaterial color={c.accentSoft} transparent opacity={0.55} />
          </RoundedBox>
          {block.map((v, i) => {
            const x = (i - 1.5) * SLOT
            if (v === null) {
              return (
                <mesh key={i} position={[x, 0, 0.25]}>
                  <boxGeometry args={[0.62, 0.62, 0.62]} />
                  <meshStandardMaterial color={c.rule} transparent opacity={0.4} />
                </mesh>
              )
            }
            const hot = f.touched.includes(v)
            return (
              <group key={i} position={[x, 0, 0.25]}>
                <mesh>
                  <boxGeometry args={[0.62, 0.62, 0.62]} />
                  <meshStandardMaterial color={hot ? c.medium : c.accent} />
                </mesh>
                <TextFace
                  text={String(v)}
                  color={c.accentInk}
                  width={0.5}
                  height={0.45}
                  position={[0, 0, 0.32]}
                />
              </group>
            )
          })}
        </group>
      ))}
      {f.blocks.slice(1).map((_, b) => (
        <Line
          key={b}
          points={[
            [blockX(b) + BLOCK_W / 2, 0, 0],
            [blockX(b + 1) - BLOCK_W / 2, 0, 0],
          ]}
          color={c.ink}
          lineWidth={2}
        />
      ))}
      <TextFace
        text="left end"
        color={c.muted}
        width={1.8}
        height={0.42}
        position={[blockX(0) - 1.5 * SLOT, -0.85, 0.4]}
        bold={false}
      />
      <TextFace
        text="right end"
        color={c.muted}
        width={1.8}
        height={0.42}
        position={[blockX(f.blocks.length - 1) + 1.5 * SLOT, -0.85, 0.4]}
        bold={false}
      />
      {f.result && (
        <TextFace
          text={`→ ${f.result}`}
          color={c.ink}
          width={5}
          height={0.46}
          position={[0, 1.05, 0.4]}
        />
      )}
    </SceneStage>
  )
}
