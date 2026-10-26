import { Brain, Code, Compass, Container, Flame, GitBranch, Server, Sparkles } from "lucide-react"
import type { ModuleMeta } from "@/lib/content/schema"

const ICONS = {
  compass: Compass,
  code: Code,
  server: Server,
  git: GitBranch,
  container: Container,
  flame: Flame,
  brain: Brain,
  sparkles: Sparkles,
} satisfies Record<ModuleMeta["icon"], unknown>

export function ModuleIcon({ icon, className }: { icon: ModuleMeta["icon"]; className?: string }) {
  const Icon = ICONS[icon]
  return <Icon className={className} aria-hidden />
}
