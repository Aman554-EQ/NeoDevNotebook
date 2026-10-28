"use client"

import { useEffect, useRef, useState, useSyncExternalStore } from "react"
import { TechLogo, type TechLogoName } from "@/components/brand/tech-logo"
import { cn } from "@/lib/utils"

/**
 * The homepage's mini lab: four tiny, hands-on demos of ideas the notebook teaches. Each one
 * demos itself while nobody is using it (paused off-screen, after a click, and with reduced
 * motion); every control is a real button.
 */
const REDUCE = "(prefers-reduced-motion: reduce)"
const watchMotion = (cb: () => void) => {
  const mq = window.matchMedia(REDUCE)
  mq.addEventListener("change", cb)
  return () => mq.removeEventListener("change", cb)
}

export function HeroLab() {
  const ref = useRef<HTMLDivElement>(null)
  const [onScreen, setOnScreen] = useState(false)
  // Server render assumes reduced motion (no autoplay) until the browser says otherwise.
  const still = useSyncExternalStore(
    watchMotion,
    () => window.matchMedia(REDUCE).matches,
    () => true,
  )

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setOnScreen(!!e?.isIntersecting))
    io.observe(el)
    return () => io.disconnect()
  }, [])

  const auto = onScreen && !still
  return (
    <div
      ref={ref}
      className="hero-plate border-rule bg-surface/90 grid grid-cols-1 overflow-hidden rounded-2xl border shadow-[0_20px_60px_-30px_rgb(0_0_0/0.35)] min-[480px]:grid-cols-2"
      data-testid="hero-lab"
    >
      <ListCard auto={auto} />
      <RequestCard auto={auto} />
      <GitCard auto={auto} />
      <NetCard auto={auto} />
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Shared                                                              */
/* ------------------------------------------------------------------ */

/**
 * Runs `tick` every `ms` while `auto` is on, except for a while after the visitor clicks
 * something (so a demo never fights the person using it). Returns `touch` for the buttons.
 */
function useAutoplay(auto: boolean, ms: number, tick: () => void) {
  const [touchedAt, setTouchedAt] = useState(0)
  const tickRef = useRef(tick)
  useEffect(() => {
    tickRef.current = tick
  })
  useEffect(() => {
    if (!auto) return
    const id = window.setInterval(() => {
      if (Date.now() - touchedAt > 9000) tickRef.current()
    }, ms)
    return () => window.clearInterval(id)
  }, [auto, ms, touchedAt])
  return { touched: touchedAt > 0, touch: () => setTouchedAt(Date.now()) }
}

function Card({
  logo,
  title,
  caption,
  live,
  controls,
  children,
}: {
  logo: TechLogoName
  title: string
  caption: string
  /** Announce caption changes only once the visitor is using the card (not during the demo). */
  live: boolean
  controls: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section
      aria-label={title}
      className="border-rule flex flex-col gap-2 border-b p-3 last:border-b-0 min-[480px]:odd:border-r sm:p-4 min-[480px]:[&:nth-child(3)]:border-b-0"
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-ink text-xs font-semibold sm:text-[0.8rem]">{title}</p>
        <TechLogo name={logo} className="size-4 opacity-90" />
      </div>
      <svg viewBox="0 0 160 84" className="mx-auto h-auto w-full max-w-[17rem]" aria-hidden>
        {children}
      </svg>
      <p
        aria-live={live ? "polite" : "off"}
        className="text-ink min-h-[2.4em] font-mono text-[0.68rem] leading-snug sm:text-[0.72rem]"
      >
        {caption}
      </p>
      <div className="flex flex-wrap gap-1.5">{controls}</div>
    </section>
  )
}

function Btn({
  onClick,
  children,
  active,
  disabled,
}: {
  onClick: () => void
  children: React.ReactNode
  active?: boolean
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
      className={cn(
        "rounded-md border px-2 py-0.5 font-mono text-[0.68rem] transition-colors disabled:opacity-40",
        active
          ? "border-accent bg-accent text-accent-ink"
          : "border-rule bg-surface text-ink hover:border-accent",
      )}
    >
      {children}
    </button>
  )
}

const ease = "transition-all duration-300 ease-out"

/* ------------------------------------------------------------------ */
/* 1. Python list: append / pop, capacity doubles when full            */
/* ------------------------------------------------------------------ */

const VALUES = [3, 8, 1, 5, 9, 2, 7, 4]

function ListCard({ auto }: { auto: boolean }) {
  const [items, setItems] = useState<number[]>([3, 8, 1])
  const [cap, setCap] = useState(4)
  const [note, setNote] = useState("xs = [3, 8, 1]  # capacity 4")
  const [grew, setGrew] = useState(false)
  const [dir, setDir] = useState<1 | -1>(1)

  const append = () => {
    if (items.length >= 8) return
    const v = VALUES[items.length]!
    const next = [...items, v]
    if (next.length > cap) {
      setCap(cap * 2)
      setGrew(true)
      setNote(`xs.append(${v})  # full: copy into ${cap * 2} slots`)
    } else {
      setGrew(false)
      setNote(`xs.append(${v})  # len ${next.length}, capacity ${cap}`)
    }
    setItems(next)
  }
  const pop = () => {
    if (!items.length) return
    setGrew(false)
    setNote(`xs.pop() → ${items.at(-1)}  # len ${items.length - 1}, capacity ${cap}`)
    setItems(items.slice(0, -1))
  }

  const { touched, touch } = useAutoplay(auto, 1500, () => {
    if (dir === 1 && items.length >= 8) setDir(-1)
    else if (dir === -1 && items.length <= 2) setDir(1)
    else if (dir === 1) append()
    else pop()
  })

  return (
    <Card
      logo="python"
      title="A list grows in place"
      caption={note}
      live={touched}
      controls={
        <>
          <Btn onClick={() => (touch(), append())} disabled={items.length >= 8}>
            append()
          </Btn>
          <Btn onClick={() => (touch(), pop())} disabled={!items.length}>
            pop()
          </Btn>
        </>
      }
    >
      {Array.from({ length: 8 }, (_, i) => (
        <g key={i} className={ease} style={{ opacity: i < cap ? 1 : 0.15 }}>
          <rect
            x={4 + i * 19.2}
            y="22"
            width="17"
            height="28"
            rx="3"
            className={cn("fill-surface", i < cap ? "stroke-ink/60" : "stroke-ink/30")}
            strokeWidth="1.2"
            strokeDasharray={i < cap ? undefined : "3 2"}
          />
          <rect
            x={7 + i * 19.2}
            y="25"
            width="11"
            height="22"
            rx="2"
            className={cn(ease, grew && i < items.length ? "fill-easy" : "fill-accent")}
            style={{
              opacity: i < items.length ? 1 : 0,
              transform: `translateY(${i < items.length ? 0 : -8}px)`,
            }}
          />
          <text
            x={12.5 + i * 19.2}
            y="40"
            textAnchor="middle"
            className={cn(ease, "fill-accent-ink font-mono text-[8px] font-semibold")}
            style={{ opacity: i < items.length ? 1 : 0 }}
          >
            {items[i] ?? ""}
          </text>
        </g>
      ))}
      <text x="4" y="66" className="fill-muted font-mono text-[8.5px]">
        len {items.length} · capacity {cap}
      </text>
      <rect x="4" y="72" width={152} height="3" rx="1.5" className="fill-surface-2" />
      <rect
        x="4"
        y="72"
        width={(152 * items.length) / 8}
        height="3"
        rx="1.5"
        className={cn(ease, "fill-accent")}
      />
    </Card>
  )
}

/* ------------------------------------------------------------------ */
/* 2. Django: a request travels urls → view → db and back              */
/* ------------------------------------------------------------------ */

const ROUTES = [
  { label: "GET /books", status: "200 OK", body: '[{"id": 7, …}]', db: "SELECT", ok: true },
  { label: "POST /books", status: "201 Created", body: '{"id": 8}', db: "INSERT", ok: true },
  {
    label: "GET /books/99",
    status: "404 Not Found",
    body: '{"detail": …}',
    db: "SELECT",
    ok: false,
  },
] as const
const STOPS = [
  { x: 20, label: "client" },
  { x: 60, label: "urls" },
  { x: 100, label: "view" },
  { x: 140, label: "db" },
]
// Packet path: client → urls → view → db → view → urls → client
const PATH = [0, 1, 2, 3, 2, 1, 0]

function RequestCard({ auto }: { auto: boolean }) {
  const [route, setRoute] = useState(0)
  const [hop, setHop] = useState(-1) // index into PATH; -1 = idle
  const timer = useRef(0)
  const r = ROUTES[route]!

  const send = (i: number) => {
    window.clearInterval(timer.current)
    setRoute(i)
    setHop(0)
    let h = 0
    timer.current = window.setInterval(() => {
      h += 1
      setHop(h)
      if (h >= PATH.length - 1) window.clearInterval(timer.current)
    }, 420)
  }
  useEffect(() => () => window.clearInterval(timer.current), [])

  const { touched, touch } = useAutoplay(auto, 4200, () => send((route + 1) % ROUTES.length))
  const at = hop < 0 ? 0 : PATH[hop]!
  const done = hop >= PATH.length - 1
  const returning = hop > 3
  const caption =
    hop < 0
      ? "Pick a request to send"
      : done
        ? `${r.label} → ${r.status}`
        : hop <= 3
          ? `${r.label} → ${["sent", "URLconf matches", "view runs", `${r.db} …`][hop]}`
          : `${r.label} → building the response`

  return (
    <Card
      logo="django"
      title="Request, view, response"
      caption={caption}
      live={touched}
      controls={ROUTES.map((x, i) => (
        <Btn key={x.label} active={route === i && hop >= 0} onClick={() => (touch(), send(i))}>
          {x.label}
        </Btn>
      ))}
    >
      <line x1="20" y1="38" x2="140" y2="38" className="stroke-rule" strokeWidth="2" />
      {STOPS.map((s, i) => {
        const lit = hop >= 0 && at === i
        return (
          <g key={s.label}>
            <rect
              x={s.x - 17}
              y="26"
              width="34"
              height="24"
              rx="5"
              className={cn(
                ease,
                lit ? "fill-accent-soft stroke-accent" : "fill-surface stroke-ink/50",
              )}
              strokeWidth="1.3"
            />
            <text x={s.x} y="41" textAnchor="middle" className="fill-ink font-mono text-[8.5px]">
              {s.label}
            </text>
          </g>
        )
      })}
      <circle
        r="4.5"
        cx="0"
        cy="0"
        className={cn(
          ease,
          returning && !r.ok ? "fill-hard" : returning ? "fill-easy" : "fill-accent",
        )}
        style={{
          transform: `translate(${STOPS[at]!.x}px, 18px)`,
          opacity: hop < 0 ? 0 : 1,
          transitionDuration: "400ms",
        }}
      />
      <text
        x="80"
        y="68"
        textAnchor="middle"
        className={cn(ease, "font-mono text-[9px] font-semibold", r.ok ? "fill-easy" : "fill-hard")}
        style={{ opacity: done ? 1 : 0 }}
      >
        {r.status}
      </text>
      <text
        x="80"
        y="79"
        textAnchor="middle"
        className={cn(ease, "fill-muted font-mono text-[8px]")}
        style={{ opacity: done ? 1 : 0 }}
      >
        {r.body}
      </text>
    </Card>
  )
}

/* ------------------------------------------------------------------ */
/* 3. Git: commit / branch / merge, the history graph draws itself     */
/* ------------------------------------------------------------------ */

type Commit = { id: number; lane: 0 | 1; parents: number[] }
/** `base`: the main commit the current feature branch started from. */
type Repo = { commits: Commit[]; head: 0 | 1; branched: boolean; base: number }
const START: Repo = {
  commits: [
    { id: 0, lane: 0, parents: [] },
    { id: 1, lane: 0, parents: [0] },
  ],
  head: 0,
  branched: false,
  base: -1,
}
const MAX = 8

function GitCard({ auto }: { auto: boolean }) {
  const [repo, setRepo] = useState<Repo>(START)
  const [note, setNote] = useState("main has 2 commits")
  const mainTip = [...repo.commits].reverse().find((c) => c.lane === 0)!
  // Only commits made since this branch started count (an earlier, merged feature doesn't).
  const featureTip = repo.branched
    ? [...repo.commits].reverse().find((c) => c.lane === 1 && c.id > repo.base)
    : undefined
  const full = repo.commits.length >= MAX

  const commit = () => {
    if (full) return
    const parent = repo.head === 1 ? (featureTip?.id ?? repo.base) : mainTip.id
    setRepo({
      ...repo,
      commits: [...repo.commits, { id: repo.commits.length, lane: repo.head, parents: [parent] }],
    })
    setNote(`git commit  # on ${repo.head ? "feature" : "main"}`)
  }
  const branch = () => {
    if (repo.branched) return
    setRepo({ ...repo, head: 1, branched: true, base: mainTip.id })
    setNote("git switch -c feature")
  }
  const merge = () => {
    if (!featureTip || full) return
    setRepo({
      commits: [
        ...repo.commits,
        { id: repo.commits.length, lane: 0, parents: [mainTip.id, featureTip.id] },
      ],
      head: 0,
      branched: false,
      base: -1,
    })
    setNote("git switch main && git merge --no-ff feature")
  }
  const reset = () => {
    setRepo(START)
    setNote("main has 2 commits")
  }

  const script = [commit, branch, commit, commit, merge, commit, reset]
  const step = useRef(0)
  const { touched, touch } = useAutoplay(auto, 1500, () => {
    script[step.current % script.length]!()
    step.current += 1
  })

  const x = (id: number) => 12 + id * 19.5
  const y = (lane: 0 | 1) => (lane === 0 ? 56 : 24)
  const byId = new Map(repo.commits.map((c) => [c.id, c]))
  const canMerge = featureTip !== undefined && !full
  const headAt = repo.head === 1 ? (featureTip ?? null) : mainTip

  return (
    <Card
      logo="git"
      title="Branch and merge"
      caption={note}
      live={touched}
      controls={
        <>
          <Btn onClick={() => (touch(), commit())} disabled={full}>
            commit
          </Btn>
          <Btn onClick={() => (touch(), branch())} disabled={repo.branched}>
            branch
          </Btn>
          <Btn onClick={() => (touch(), merge())} disabled={!canMerge}>
            merge
          </Btn>
          <Btn onClick={() => (touch(), reset())}>reset</Btn>
        </>
      }
    >
      <text x="4" y="80" className="fill-muted font-mono text-[8px]">
        main
      </text>
      <text
        x="4"
        y="12"
        className={cn(ease, "fill-muted font-mono text-[8px]")}
        style={{ opacity: repo.branched || repo.commits.some((c) => c.lane === 1) ? 1 : 0 }}
      >
        feature
      </text>
      <g fill="none" strokeWidth="2" strokeLinecap="round">
        {repo.commits.flatMap((c) =>
          c.parents.map((pid) => {
            const p = byId.get(pid)!
            const d =
              p.lane === c.lane
                ? `M${x(p.id)} ${y(p.lane)}H${x(c.id)}`
                : `M${x(p.id)} ${y(p.lane)}C${x(p.id) + 10} ${y(p.lane)} ${x(c.id) - 10} ${y(c.lane)} ${x(c.id)} ${y(c.lane)}`
            return (
              <path
                key={`${pid}-${c.id}`}
                d={d}
                className={c.lane === 1 || p.lane === 1 ? "stroke-accent" : "stroke-ink/50"}
              />
            )
          }),
        )}
        {/* Where the next commit on the new branch will grow from. */}
        {repo.branched && !featureTip && (
          <path
            d={`M${x(repo.base)} ${y(0)}C${x(repo.base) + 10} ${y(0)} ${x(repo.base) + 9} ${y(1)} ${x(repo.base) + 19} ${y(1)}`}
            className="stroke-accent"
            strokeDasharray="3 3"
          />
        )}
      </g>
      {repo.commits.map((c) => (
        <circle
          key={c.id}
          cx={x(c.id)}
          cy={y(c.lane)}
          r={c.parents.length > 1 ? 5.5 : 4.5}
          className={cn(
            "motion-safe:animate-[pop-in_250ms_ease-out]",
            c.lane === 1 || c.parents.length > 1 ? "fill-accent" : "fill-surface stroke-ink/70",
          )}
          strokeWidth="1.8"
        />
      ))}
      <text
        x={headAt ? x(headAt.id) : x(repo.base) + 19}
        y={y(repo.head) + (repo.head === 0 ? -9 : 15)}
        textAnchor="middle"
        className="fill-accent font-mono text-[7px] font-semibold"
      >
        HEAD
      </text>
    </Card>
  )
}

/* ------------------------------------------------------------------ */
/* 4. A forward pass: toggle inputs, watch activations flow            */
/* ------------------------------------------------------------------ */

// Fixed, hand-picked weights so different inputs give clearly different outputs.
const W1 = [
  [2.2, -1.6, 0.8],
  [-1.2, 2.4, -0.6],
  [1.4, 1.2, -2.0],
  [-0.8, -1.0, 2.6],
]
const B1 = [-0.6, -0.4, -0.8, -0.5]
const W2 = [
  [2.0, -1.4, 1.6, -1.2],
  [-1.6, 1.8, -0.8, 2.0],
]
const B2 = [-0.3, -0.2]
const sigmoid = (z: number) => 1 / (1 + Math.exp(-z))
const layer = (w: number[][], b: number[], x: number[]) =>
  w.map((row, i) => sigmoid(row.reduce((s, wij, j) => s + wij * x[j]!, b[i]!)))
const PATTERNS = [
  [1, 0, 0],
  [0, 1, 0],
  [0, 0, 1],
  [1, 1, 0],
  [0, 1, 1],
]

function NetCard({ auto }: { auto: boolean }) {
  const [x, setX] = useState([1, 0, 1])
  const h = layer(W1, B1, x)
  const y = layer(W2, B2, h)

  const set = setX
  const step = useRef(0)
  const { touched, touch } = useAutoplay(auto, 2600, () => {
    set(PATTERNS[step.current % PATTERNS.length]!)
    step.current += 1
  })

  const cols = [
    { cx: 18, ys: [18, 42, 66], v: x },
    { cx: 80, ys: [12, 32, 52, 72], v: h },
    { cx: 142, ys: [30, 54], v: y },
  ]
  return (
    <Card
      logo="pytorch"
      title="A forward pass"
      caption={`x = [${x.join(", ")}] → y = [${y.map((v) => v.toFixed(2)).join(", ")}]`}
      live={touched}
      controls={x.map((v, i) => (
        <Btn
          key={i}
          active={v === 1}
          onClick={() => {
            touch()
            set(x.map((xi, j) => (j === i ? 1 - xi : xi)))
          }}
        >
          x{i + 1} = {v}
        </Btn>
      ))}
    >
      <g>
        {[W1, W2].map((w, li) =>
          w.flatMap((row, i) =>
            row.map((wij, j) => {
              const strength = Math.min(1, Math.abs(wij * cols[li]!.v[j]!) / 2.4)
              return (
                <line
                  key={`${li}-${i}-${j}`}
                  x1={cols[li]!.cx}
                  y1={cols[li]!.ys[j]}
                  x2={cols[li + 1]!.cx}
                  y2={cols[li + 1]!.ys[i]}
                  className={cn(
                    "transition-all duration-500",
                    wij > 0 ? "stroke-accent" : "stroke-ink/40",
                  )}
                  strokeWidth={0.4 + strength * 1.6}
                  style={{ opacity: 0.15 + strength * 0.75, transitionDelay: `${li * 300}ms` }}
                />
              )
            }),
          ),
        )}
      </g>
      {cols.map((c, li) =>
        c.ys.map((cy, i) => (
          <g key={`${li}-${i}`}>
            <circle
              cx={c.cx}
              cy={cy}
              r="7"
              className="fill-surface stroke-accent"
              strokeWidth="1.4"
            />
            <circle
              cx={c.cx}
              cy={cy}
              r="7"
              className="fill-accent transition-opacity duration-500"
              style={{ opacity: c.v[i]!, transitionDelay: `${li * 300}ms` }}
            />
            {li === 0 && (
              <text
                x={c.cx}
                y={cy + 3}
                textAnchor="middle"
                className="fill-accent-ink font-mono text-[7.5px] font-semibold"
                style={{ opacity: c.v[i] ? 1 : 0 }}
              >
                1
              </text>
            )}
            {li === 2 && (
              <text
                x={c.cx - 11}
                y={cy + 3}
                textAnchor="end"
                className="fill-ink font-mono text-[7px]"
              >
                {c.v[i]!.toFixed(2)}
              </text>
            )}
          </g>
        )),
      )}
    </Card>
  )
}
