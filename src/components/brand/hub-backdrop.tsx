import { LogoPattern } from "./logo-pattern"

/** A faint strip of the logo wallpaper behind a hub page's heading (Learn, Practice, …). */
export function HubBackdrop() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute -inset-x-4 -top-8 -z-10 h-72 overflow-hidden sm:-inset-x-8 lg:-top-10"
    >
      <LogoPattern />
    </div>
  )
}
