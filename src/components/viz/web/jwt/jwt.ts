/**
 * Minimal HS256 JWT encode/verify with Web Crypto, for the JWT anatomy visual.
 * Byte-for-byte compatible with PyJWT (tests/unit/jwt.test.ts checks PyJWT-made tokens).
 * Teaching code: real apps use a maintained library (PyJWT, djangorestframework-simplejwt).
 */

export type Claims = Record<string, string | number | boolean>

export function b64url(bytes: Uint8Array): string {
  let binary = ""
  for (const b of bytes) binary += String.fromCharCode(b)
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")
}

export function b64urlDecode(part: string): string {
  const base64 = part.replace(/-/g, "+").replace(/_/g, "/")
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4)
  const binary = atob(padded)
  return new TextDecoder().decode(Uint8Array.from(binary, (c) => c.charCodeAt(0)))
}

const encodeJson = (value: object) => b64url(new TextEncoder().encode(JSON.stringify(value)))

export async function hs256(secret: string, data: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  )
  const mac = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data))
  return b64url(new Uint8Array(mac))
}

export const HEADER = { alg: "HS256", typ: "JWT" } as const

export async function encodeJwt(payload: Claims, secret: string): Promise<string> {
  const signingInput = `${encodeJson(HEADER)}.${encodeJson(payload)}`
  return `${signingInput}.${await hs256(secret, signingInput)}`
}

export type Verdict =
  { valid: true; claims: Claims } | { valid: false; reason: "malformed" | "signature" | "expired" }

/** The checks a server makes, in order: shape, signature, then expiry. */
export async function verifyJwt(token: string, secret: string, now: number): Promise<Verdict> {
  const parts = token.split(".")
  if (parts.length !== 3) return { valid: false, reason: "malformed" }
  const [header, payload, signature] = parts as [string, string, string]
  const expected = await hs256(secret, `${header}.${payload}`)
  if (expected !== signature) return { valid: false, reason: "signature" }
  let claims: Claims
  try {
    claims = JSON.parse(b64urlDecode(payload)) as Claims
  } catch {
    return { valid: false, reason: "malformed" }
  }
  if (typeof claims.exp === "number" && now >= claims.exp)
    return { valid: false, reason: "expired" }
  return { valid: true, claims }
}
