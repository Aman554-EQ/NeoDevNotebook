/** The four-step difficulty ladder. Kept free of zod so client components can import it cheaply. */
export const DIFFICULTIES = ["easy", "simple", "medium", "hard"] as const
export type Difficulty = (typeof DIFFICULTIES)[number]
