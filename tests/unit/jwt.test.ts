// @vitest-environment node
import { describe, expect, it } from "vitest"
import { b64urlDecode, encodeJwt, verifyJwt } from "@/components/viz/web/jwt/jwt"

// Made with PyJWT 2.15: jwt.encode(payload, KEY, algorithm="HS256")
const KEY = "fake-jwt-key-change-me-abcdefghijklmnopqrstuvwxyz0123456789"
const PAYLOAD = { user_id: 7, role: "customer", iat: 1767225000, exp: 1767225600 }
const PYJWT_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjo3LCJyb2xlIjoiY3VzdG9tZXIiLCJpYXQiOjE3NjcyMjUwMDAsImV4cCI6MTc2NzIyNTYwMH0.dD43VxURc6iD30cnXSfYyLxXiWIQdNoSWB3rEmGjYgo"
const PYJWT_USER_1 =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJyb2xlIjoiY3VzdG9tZXIiLCJpYXQiOjE3NjcyMjUwMDAsImV4cCI6MTc2NzIyNTYwMH0.bk99thjNMhguf-HI8OzolugSj66MlxH7wIZHLq7xAuA"

describe("JWT anatomy model", () => {
  it("produces exactly the token PyJWT produces", async () => {
    expect(await encodeJwt(PAYLOAD, KEY)).toBe(PYJWT_TOKEN)
    expect(await encodeJwt({ ...PAYLOAD, user_id: 1 }, KEY)).toBe(PYJWT_USER_1)
  })

  it("decodes the readable parts", () => {
    const [header, payload] = PYJWT_TOKEN.split(".")
    expect(JSON.parse(b64urlDecode(header!))).toEqual({ alg: "HS256", typ: "JWT" })
    expect(JSON.parse(b64urlDecode(payload!))).toEqual(PAYLOAD)
  })

  it("accepts a fresh token and rejects tampering, a wrong key and expiry", async () => {
    expect(await verifyJwt(PYJWT_TOKEN, KEY, 1767225300)).toEqual({ valid: true, claims: PAYLOAD })
    // An attacker swaps in user 1's payload but keeps user 7's signature.
    const [header, , signature] = PYJWT_TOKEN.split(".")
    const forged = `${header}.${PYJWT_USER_1.split(".")[1]}.${signature}`
    expect(await verifyJwt(forged, KEY, 1767225300)).toEqual({ valid: false, reason: "signature" })
    expect(await verifyJwt(PYJWT_TOKEN, "another-key-0123456789", 1767225300)).toEqual({
      valid: false,
      reason: "signature",
    })
    expect(await verifyJwt(PYJWT_TOKEN, KEY, 1767225600)).toEqual({
      valid: false,
      reason: "expired",
    })
    expect(await verifyJwt("not-a-token", KEY, 0)).toEqual({ valid: false, reason: "malformed" })
  })
})
