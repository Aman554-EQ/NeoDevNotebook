"use server"

import { z } from "zod"
import { getDb } from "@/db/client"
import { subscribers } from "@/db/schema"

export type SubscribeState = { status: "idle" | "ok" | "error"; message: string }

const email = z.string().trim().toLowerCase().max(254).pipe(z.email())

/**
 * Footer newsletter sign-up. Stores the address (duplicates are fine: same answer, no new row).
 * `website` is a honeypot: people never see it, bots fill it in and get a silent "ok".
 */
export async function subscribe(_prev: SubscribeState, form: FormData): Promise<SubscribeState> {
  if (form.get("website")) return { status: "ok", message: "Thanks, you're subscribed." }
  const parsed = email.safeParse(form.get("email"))
  if (!parsed.success) return { status: "error", message: "Please enter a valid email address." }
  try {
    await getDb().insert(subscribers).values({ email: parsed.data }).onConflictDoNothing()
    return { status: "ok", message: "Thanks, you're subscribed." }
  } catch (e) {
    console.error("subscribe failed:", e instanceof Error ? e.message : e)
    return { status: "error", message: "Couldn't subscribe right now. Please try again later." }
  }
}
