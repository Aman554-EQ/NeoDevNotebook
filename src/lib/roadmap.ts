/**
 * The full learning path (see plan/README.md). A part shows as available as soon as
 * any of its module folders exists in content/; otherwise it is listed as upcoming.
 */
export const ROADMAP = [
  { part: 0, title: "Start Here", blurb: "How this notebook teaches, and how to use it." },
  { part: 1, title: "Python", blurb: "Basics, data structures, debugging, 50+ problems." },
  {
    part: 2,
    title: "Django · Flask · FastAPI",
    blurb: "Three frameworks, CRUD, APIs, databases, caching.",
  },
  { part: 3, title: "Git & GitHub", blurb: "Version control, branching, reviews, recovery." },
  { part: 4, title: "Docker", blurb: "Images, containers, Dockerfiles for Python and Node." },
  { part: 5, title: "PyTorch", blurb: "Tensors, autograd, training loops, 10+ models." },
  {
    part: 6,
    title: "ML & LLMs",
    blurb: "Backprop, loss, gradient descent, LoRA, attention, KV cache.",
  },
] as const
