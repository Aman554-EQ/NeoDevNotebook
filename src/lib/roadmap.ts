import type { TechLogoName } from "@/components/brand/tech-logo"

/**
 * The full learning path, in order. A track shows as available as soon as content/<slug>/
 * exists; otherwise it is listed as coming soon.
 */
export type Track = {
  slug: string
  title: string
  blurb: string
  /** Brand logos shown on the card; Start Here has none (it uses its module icon). */
  logos: TechLogoName[]
}

export const ROADMAP: Track[] = [
  {
    slug: "start-here",
    title: "Start Here",
    blurb: "How this notebook teaches, and how to use it.",
    logos: [],
  },
  {
    slug: "python",
    title: "Python",
    blurb: "Basics, data structures, debugging, 50+ problems.",
    logos: ["python"],
  },
  {
    slug: "django",
    title: "Django",
    blurb: "Models, the ORM, DRF APIs, auth, testing and deployment, with real projects.",
    logos: ["django"],
  },
  {
    slug: "fastapi",
    title: "FastAPI",
    blurb: "Typed async APIs: Pydantic, dependencies, auth, background work and tests.",
    logos: ["fastapi"],
  },
  {
    slug: "git",
    title: "Git & GitHub",
    blurb: "Version control, branching, reviews, recovery.",
    logos: ["git", "github"],
  },
  {
    slug: "docker",
    title: "Docker",
    blurb: "Images, containers, Dockerfiles for Python and Node.",
    logos: ["docker"],
  },
  {
    slug: "pytorch",
    title: "PyTorch",
    blurb: "Tensors, autograd, training loops, 10+ models.",
    logos: ["pytorch"],
  },
  {
    slug: "ml",
    title: "Machine Learning",
    blurb: "Loss, gradient descent, backprop, regularisation and evaluation.",
    logos: ["ml"],
  },
  {
    slug: "llm",
    title: "LLMs",
    blurb: "Tokens, attention, the KV cache, LoRA fine-tuning and retrieval.",
    logos: ["llm"],
  },
]
