"use client"

import { useEffect, useId, useState } from "react"
import { CircleCheck, CircleX } from "lucide-react"
import { cn } from "@/lib/utils"
import { VizFrame, useViz, type VizStep } from "../../_shared/viz-frame"
import { HEADER, b64urlDecode, encodeJwt, verifyJwt, type Claims, type Verdict } from "./jwt"

const IAT = 1767225000 // a fixed issue time, so the token is the same for every reader
const EXP = IAT + 600 // valid for 10 minutes
const NOW = IAT + 300 // "now" in the normal steps: 5 minutes after login
const LATER = EXP + 60 // "now" in the expiry step
const DEFAULT_SECRET = "fake-jwt-key-change-me-abcdefghijklmnopqrstuvwxyz0123456789"

const STEPS: VizStep[] = [
  {
    label: "Three parts",
    narration:
      "A JWT is three base64url strings joined by dots: header.payload.signature. It is meant to be read; only the signature is secret-dependent.",
  },
  {
    label: "Header",
    narration:
      "The header says how the token is signed: HS256 means HMAC with SHA-256 and a shared secret key.",
  },
  {
    label: "Payload",
    narration:
      "The payload holds claims: who (user_id), what they may do (role), when it was issued (iat) and expires (exp). Base64url is encoding, not encryption: never put secrets here. Edit the user id and watch the token change.",
  },
  {
    label: "Signature",
    narration:
      "The signature is HMAC-SHA256(secret, header + '.' + payload). Only someone with the secret key can produce it, so the server can trust the claims without a database lookup.",
  },
  {
    label: "Tampering",
    narration:
      "An attacker edits the payload to user_id 1 and role 'staff' but can't recompute the signature without the key. The server recomputes it, sees a mismatch and rejects the token.",
  },
  {
    label: "Expiry",
    narration:
      "Even a perfectly signed token is refused once 'exp' has passed. Short-lived access tokens limit the damage if one leaks; a refresh token gets a new one.",
  },
]

export function JwtAnatomyViz() {
  return (
    <VizFrame
      title="Inside a JSON Web Token"
      caption="Anyone can read a JWT, but nobody can change it without the secret key. That is the whole design: integrity, not confidentiality. The token here is computed live in your browser with the same algorithm PyJWT uses."
      steps={STEPS}
      intervalMs={4200}
      badge="Interactive · real HS256"
    >
      <Scene />
    </VizFrame>
  )
}

function Scene() {
  const { step } = useViz()
  const id = useId()
  const [userId, setUserId] = useState(7)
  const [secret, setSecret] = useState(DEFAULT_SECRET)
  const [token, setToken] = useState("")
  const [verdict, setVerdict] = useState<Verdict | null>(null)

  const tampered = step === 4
  const expired = step === 5

  useEffect(() => {
    let live = true
    ;(async () => {
      const real = await encodeJwt(
        { user_id: userId, role: "customer", iat: IAT, exp: EXP },
        secret,
      )
      let shown = real
      if (tampered) {
        // Keep the real signature, swap in a forged payload.
        const forged = await encodeJwt(
          { user_id: 1, role: "staff", iat: IAT, exp: EXP },
          "attacker-guess",
        )
        const [h, , sig] = real.split(".")
        shown = `${h}.${forged.split(".")[1]}.${sig}`
      }
      const v = await verifyJwt(shown, DEFAULT_SECRET, expired ? LATER : NOW)
      if (live) {
        setToken(shown)
        setVerdict(v)
      }
    })()
    return () => {
      live = false
    }
  }, [userId, secret, tampered, expired])

  const [h = "", p = "", s = ""] = token.split(".")
  let decoded: Claims | null = null
  try {
    decoded = p ? (JSON.parse(b64urlDecode(p)) as Claims) : null
  } catch {
    decoded = null
  }

  return (
    <div className="space-y-3 p-4" data-testid="jwt-anatomy">
      <p
        className="bg-code-bg border-rule rounded-lg border px-3 py-2 font-mono text-xs break-all sm:text-sm"
        data-testid="jwt-token"
      >
        <span className={cn("border-b-[3px] border-[var(--series-1)]", step === 1 && "font-bold")}>
          {h}
        </span>
        .
        <span
          className={cn(
            "border-b-[3px] border-[var(--series-2)]",
            (step === 2 || tampered) && "font-bold",
          )}
        >
          {p}
        </span>
        .
        <span className={cn("border-b-[3px] border-[var(--series-3)]", step === 3 && "font-bold")}>
          {s}
        </span>
      </p>

      <div className="grid gap-3 md:grid-cols-3">
        <Part title="Header" tone="border-b-[3px] border-[var(--series-1)]" active={step === 1}>
          {JSON.stringify(HEADER, null, 2)}
        </Part>
        <Part
          title="Payload"
          tone="border-b-[3px] border-[var(--series-2)]"
          active={step === 2 || tampered}
        >
          {decoded ? JSON.stringify(decoded, null, 2) : "…"}
        </Part>
        <Part title="Signature" tone="border-b-[3px] border-[var(--series-3)]" active={step === 3}>
          {"HMACSHA256(\n  secret,\n  header + '.' + payload\n)"}
        </Part>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <label className="text-sm" htmlFor={`${id}-user`}>
          <span className="text-muted block text-xs">user_id</span>
          <input
            id={`${id}-user`}
            type="number"
            min={1}
            max={9999}
            value={userId}
            onChange={(e) => setUserId(Math.max(1, Math.min(9999, Number(e.target.value) || 1)))}
            className="border-rule bg-surface w-24 rounded-md border px-2 py-1 font-mono"
          />
        </label>
        <label className="min-w-0 flex-1 text-sm" htmlFor={`${id}-secret`}>
          <span className="text-muted block text-xs">signing key (the server&apos;s secret)</span>
          <input
            id={`${id}-secret`}
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            className="border-rule bg-surface w-full rounded-md border px-2 py-1 font-mono text-xs"
          />
        </label>
      </div>

      {verdict && <VerdictLine verdict={verdict} keyChanged={secret !== DEFAULT_SECRET} />}
    </div>
  )
}

function Part({
  title,
  tone,
  active,
  children,
}: {
  title: string
  tone: string
  active: boolean
  children: React.ReactNode
}) {
  return (
    <section className={cn("rounded-lg border", active ? "border-accent" : "border-rule")}>
      <h4 className={cn("border-rule border-b px-3 py-1 text-xs font-semibold uppercase", tone)}>
        {title}
      </h4>
      <pre tabIndex={0} className="overflow-x-auto px-3 py-2 font-mono text-xs leading-relaxed">
        {children}
      </pre>
    </section>
  )
}

function VerdictLine({ verdict, keyChanged }: { verdict: Verdict; keyChanged: boolean }) {
  const reason =
    !verdict.valid &&
    {
      signature: keyChanged
        ? "signature mismatch: signed with a different key than the server's"
        : "signature mismatch: the payload was changed after signing",
      expired: "expired: now is past the exp claim",
      malformed: "malformed token",
    }[verdict.reason]
  return (
    <p
      data-testid="jwt-verdict"
      className={cn(
        "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium",
        verdict.valid ? "bg-easy-soft text-easy" : "bg-hard-soft text-hard",
      )}
    >
      {verdict.valid ? (
        <CircleCheck className="size-4 shrink-0" aria-hidden />
      ) : (
        <CircleX className="size-4 shrink-0" aria-hidden />
      )}
      Server check: {verdict.valid ? "valid, the claims can be trusted" : reason}
    </p>
  )
}
