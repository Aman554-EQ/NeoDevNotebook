"use client"

import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import { RoundedBox } from "@react-three/drei"
import type { Mesh } from "three"
import { SceneStage, TextFace, useNarrow, useThemeColors } from "../../_shared/three/toolkit"
import { useViz } from "../../_shared/viz-frame"
import { STACKS, type Frame, type Framework } from "./model"

/** Blend two hex colours (#rgb or #rrggbb): t=0 gives a, t=1 gives b. */
function mix(a: string, b: string, t: number) {
  const full = (hex: string) =>
    /^#[0-9a-f]{3}$/i.test(hex) ? `#${[...hex.slice(1)].map((d) => d + d).join("")}` : hex
  const [x, y] = [full(a), full(b)]
  if (!/^#[0-9a-f]{6}$/i.test(x) || !/^#[0-9a-f]{6}$/i.test(y)) return a
  const ch = (hex: string, i: number) => parseInt(hex.slice(1 + i * 2, 3 + i * 2), 16)
  return `#${[0, 1, 2]
    .map((i) =>
      Math.round(ch(x, i) * (1 - t) + ch(y, i) * t)
        .toString(16)
        .padStart(2, "0"),
    )
    .join("")}`
}

const WIDE_GAP = 1.6
const NARROW_GAP = 0.82

export default function RequestLifecycleScene3D({
  framework,
  frames,
}: {
  framework: Framework
  frames: Frame[]
}) {
  const { step } = useViz()
  const f = frames[step]!
  const layers = STACKS[framework]
  const c = useThemeColors()
  const narrow = useNarrow()
  const n = layers.length

  // Wide: layers left → right. Narrow (phones): top → bottom, so labels stay large.
  const pos = (i: number): [number, number, number] =>
    narrow ? [0, ((n - 1) / 2 - i) * NARROW_GAP, 0] : [(i - (n - 1) / 2) * WIDE_GAP, 0, 0]
  const slab: [number, number, number] = narrow ? [3.4, 0.62, 0.3] : [1.38, 1.5, 0.3]
  // Layers the request has already passed through (on a rejected trip, the deeper ones never are).
  const deepest = Math.max(...frames.slice(0, step + 1).map((fr) => fr.at))
  const visited = (i: number) => i <= deepest

  return (
    <SceneStage
      code={`${f.direction === "in" ? "→" : "←"} ${f.packet}`}
      camera={narrow ? [0, 0.4, 8] : [0, 1.6, 8]}
      fit={
        narrow
          ? { width: 4.2, height: n * NARROW_GAP + 0.4 }
          : { width: n * WIDE_GAP + 0.2, height: 2.4 }
      }
      height={narrow ? "h-[26rem]" : "h-64 sm:h-72"}
    >
      {layers.map((layer, i) => {
        const active = i === f.at
        // Passed layers: a light tint of the accent; layers not reached yet: plain surface.
        const color = active
          ? f.tone === "error"
            ? c.hard
            : c.accent
          : visited(i)
            ? mix(c.accent, c.surface, 0.72)
            : c.surface
        const ink = active ? c.accentInk : c.ink
        const [x, y] = pos(i)
        return (
          <group key={layer.id} position={[x, y, 0]}>
            <RoundedBox args={slab} radius={0.06}>
              {/* A little emission keeps light colours light (and dark ones visible) under the lights. */}
              <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.35} />
            </RoundedBox>
            {narrow ? (
              <>
                <TextFace
                  text={layer.label}
                  color={ink}
                  width={1.6}
                  height={0.34}
                  position={[-0.75, 0, 0.16]}
                />
                <TextFace
                  text={layer.detail}
                  color={active ? c.accentInk : c.muted}
                  width={1.6}
                  height={0.26}
                  position={[0.85, 0, 0.16]}
                  bold={false}
                />
              </>
            ) : (
              <>
                <TextFace
                  text={layer.label}
                  color={ink}
                  width={1.28}
                  height={0.34}
                  position={[0, 0.25, 0.16]}
                />
                <TextFace
                  text={layer.detail}
                  color={active ? c.accentInk : c.muted}
                  width={1.28}
                  height={0.24}
                  position={[0, -0.2, 0.16]}
                  bold={false}
                />
              </>
            )}
          </group>
        )
      })}
      <Packet
        target={
          narrow ? [slab[0] / 2 + 0.05, pos(f.at)[1], 0.3] : [pos(f.at)[0], slab[1] / 2 + 0.3, 0.1]
        }
        color={f.tone === "error" ? c.hard : f.direction === "in" ? c.accent : c.easy}
      />
    </SceneStage>
  )
}

/** The request (or response) marker. It glides to its layer instead of jumping. */
function Packet({ target, color }: { target: [number, number, number]; color: string }) {
  const ref = useRef<Mesh>(null)
  useFrame((_, delta) => {
    const m = ref.current
    if (!m) return
    const k = Math.min(1, delta * 6)
    m.position.x += (target[0] - m.position.x) * k
    m.position.y += (target[1] - m.position.y) * k
    m.position.z += (target[2] - m.position.z) * k
  })
  return (
    <mesh ref={ref} position={target}>
      <sphereGeometry args={[0.16, 24, 24]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.4} />
    </mesh>
  )
}
