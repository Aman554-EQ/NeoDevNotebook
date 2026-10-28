import { Brain, Code, Compass, Container, Flame, Server, Sparkles } from "lucide-react"
import { TechLogo, type TechLogoName } from "@/components/brand/tech-logo"
import type { ModuleMeta } from "@/lib/content/schema"

const ICONS = {
  compass: Compass,
  code: Code,
  server: Server,
  container: Container,
  flame: Flame,
  brain: Brain,
  sparkles: Sparkles,
}

type LucideName = keyof typeof ICONS
type LogoName = Exclude<ModuleMeta["icon"], LucideName>
// Every module icon is either a lucide icon or a tech logo.
const isLogo = (icon: ModuleMeta["icon"]): icon is LogoName & TechLogoName => !(icon in ICONS)

/**
 * A module's icon. Tech logos keep their brand colour; lucide icons take the text colour
 * (callers pass `text-accent` etc.).
 */
export function ModuleIcon({ icon, className }: { icon: ModuleMeta["icon"]; className?: string }) {
  if (isLogo(icon)) return <TechLogo name={icon} className={className} />
  const Icon = ICONS[icon]
  return <Icon className={className} aria-hidden />
}
