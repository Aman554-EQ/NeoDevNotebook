import { evaluate } from "@mdx-js/mdx"
import * as runtime from "react/jsx-runtime"
import rehypeKatex from "rehype-katex"
import rehypeSlug from "rehype-slug"
import remarkGfm from "remark-gfm"
import remarkMath from "remark-math"
import type { MDXComponents } from "mdx/types"
import { CodeBlock } from "@/components/lesson/code-block"
import { rehypeCodeBlocks, rehypeCollectToc, rehypeFocusableMath, type TocEntry } from "./plugins"

type Options = {
  /** "mdx" for lessons (JSX allowed); "md" for markdown fields in YAML (no JSX). */
  format?: "mdx" | "md"
  components?: MDXComponents
}

/** Compiles MDX/Markdown on the server. Pages using it are prerendered at build time. */
export async function renderMdx(source: string, { format = "mdx", components = {} }: Options = {}) {
  const toc: TocEntry[] = []
  const { default: Content } = await evaluate(source, {
    ...runtime,
    format,
    development: false,
    remarkPlugins: [remarkGfm, remarkMath],
    rehypePlugins: [
      rehypeKatex,
      rehypeFocusableMath,
      rehypeCodeBlocks,
      rehypeSlug,
      rehypeCollectToc(toc),
    ],
  })
  const content = <Content components={{ CodeBlock, ...components }} />
  return { content, toc }
}

/** Convenience for short markdown fields (problem statements, answers, explanations). */
export async function Markdown({ source, className }: { source: string; className?: string }) {
  const { content } = await renderMdx(source, { format: "md" })
  return <div className={className ?? "prose-notebook"}>{content}</div>
}
