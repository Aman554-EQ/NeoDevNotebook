"use client"

import { useEffect, useRef, useState, useSyncExternalStore } from "react"

/** True once the element has come within `rootMargin` of the viewport (stays true). */
export function useInView<T extends Element>(rootMargin = "200px") {
  const ref = useRef<T>(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el || inView) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setInView(true)
          io.disconnect()
        }
      },
      { rootMargin },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [inView, rootMargin])
  return [ref, inView] as const
}

const QUERY = "(prefers-reduced-motion: reduce)"

export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    (cb) => {
      const mq = window.matchMedia(QUERY)
      mq.addEventListener("change", cb)
      return () => mq.removeEventListener("change", cb)
    },
    () => window.matchMedia(QUERY).matches,
    () => false,
  )
}

let webglCache: boolean | undefined

/** Cached: creating a WebGL context is expensive, and support cannot change during a visit. */
export function useWebGLSupport(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => (webglCache ??= hasWebGL()),
    () => true,
  )
}

export function hasWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas")
    return Boolean(canvas.getContext("webgl2") ?? canvas.getContext("webgl"))
  } catch {
    return false
  }
}
