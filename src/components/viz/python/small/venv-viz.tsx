"use client"

import { VizFrame, useViz, type VizStep } from "../../_shared/viz-frame"
import { cn } from "@/lib/utils"

type Env = { name: string; packages: string[] }
type Frame = { cmd: string; envs: Env[]; active: string; note?: string }

const GLOBAL: Env = { name: "system Python", packages: ["pip"] }
const FRAMES: Frame[] = [
  { cmd: "python -m pip list", envs: [GLOBAL], active: "system Python" },
  {
    cmd: "python -m venv .venv",
    envs: [GLOBAL, { name: "shop/.venv", packages: ["pip"] }],
    active: "system Python",
    note: "a new folder with its own python and an empty site-packages",
  },
  {
    cmd: ".venv\\Scripts\\activate   (macOS/Linux: source .venv/bin/activate)",
    envs: [GLOBAL, { name: "shop/.venv", packages: ["pip"] }],
    active: "shop/.venv",
    note: "PATH now finds .venv's python and pip first",
  },
  {
    cmd: "python -m pip install requests==2.32.3",
    envs: [
      GLOBAL,
      { name: "shop/.venv", packages: ["pip", "requests 2.32.3", "urllib3", "certifi", "…"] },
    ],
    active: "shop/.venv",
    note: "installed into .venv only; the system Python is untouched",
  },
  {
    cmd: "(in another project) python -m pip install requests==2.28.0",
    envs: [
      GLOBAL,
      { name: "shop/.venv", packages: ["pip", "requests 2.32.3", "…"] },
      { name: "legacy/.venv", packages: ["pip", "requests 2.28.0", "…"] },
    ],
    active: "legacy/.venv",
    note: "two versions side by side, with no conflict",
  },
  {
    cmd: "python -m pip freeze > requirements.txt",
    envs: [
      GLOBAL,
      { name: "shop/.venv", packages: ["pip", "requests 2.32.3", "…"] },
      { name: "legacy/.venv", packages: ["pip", "requests 2.28.0", "…"] },
    ],
    active: "legacy/.venv",
    note: "records exact versions so others can recreate this environment",
  },
]
const STEPS: VizStep[] = [
  {
    label: "One Python",
    narration:
      "Without a virtual environment, every project shares the one system Python and its packages.",
  },
  {
    label: "Create",
    narration:
      "python -m venv .venv creates an isolated environment: its own interpreter link and its own site-packages.",
  },
  {
    label: "Activate",
    narration:
      "Activating puts .venv first on PATH, so 'python' and 'pip' now mean the environment's copies.",
  },
  {
    label: "Install",
    narration:
      "pip install writes into the active environment only. Other projects and the system Python are unaffected.",
  },
  {
    label: "Isolation",
    narration:
      "Each project can pin its own versions, even incompatible ones, without breaking the others.",
  },
  {
    label: "Freeze",
    narration:
      "pip freeze lists exact versions; committing requirements.txt lets anyone rebuild the same environment.",
  },
]

function Scene() {
  const { step } = useViz()
  const f = FRAMES[step]!
  return (
    <div className="space-y-3 p-4">
      <p className="text-center">
        <code className="bg-surface-2 rounded-md px-3 py-1 font-mono text-xs break-all sm:text-sm">
          $ {f.cmd}
        </code>
      </p>
      <div className="grid gap-3 sm:grid-cols-3">
        {f.envs.map((e) => (
          <section
            key={e.name}
            className={cn(
              "rounded-lg border-2 p-3",
              e.name === f.active ? "border-accent bg-accent-soft" : "border-rule bg-surface",
            )}
          >
            <h3 className="font-mono text-sm font-semibold">
              {e.name}
              {e.name === f.active && <span className="text-accent ml-1 text-xs">(active)</span>}
            </h3>
            <p className="text-muted mt-1 text-xs">site-packages</p>
            <ul className="font-mono text-xs">
              {e.packages.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </section>
        ))}
      </div>
      {f.note && <p className="text-muted text-center text-sm">{f.note}</p>}
    </div>
  )
}

export function VenvViz() {
  return (
    <VizFrame
      title="Virtual environments keep projects apart"
      caption="Each project gets its own folder of packages. 'Works on my machine' problems usually mean a package was installed into a different environment than the one running the code."
      steps={STEPS}
      intervalMs={2600}
    >
      <Scene />
    </VizFrame>
  )
}
