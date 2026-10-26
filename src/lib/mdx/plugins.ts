/**
 * Small rehype plugins (hand-rolled tree walks keep dependencies minimal).
 * Runs inside @mdx-js/mdx on the server, so plugin options may be functions.
 */

type HastNode = {
  type: string
  tagName?: string
  value?: string
  properties?: Record<string, unknown>
  children?: HastNode[]
  data?: { meta?: string | null }
  [key: string]: unknown
}

export type TocEntry = { id: string; text: string; depth: 2 | 3 }

export function textOf(node: HastNode): string {
  if (node.type === "text") return node.value ?? ""
  return (node.children ?? []).map(textOf).join("")
}

function classList(node: HastNode): string[] {
  const c = node.properties?.className
  return Array.isArray(c) ? c.map(String) : typeof c === "string" ? c.split(" ") : []
}

/** Parses fence meta like: title="app.py" {2,4-5} */
export function parseCodeMeta(meta: string | null | undefined) {
  const title = /title="([^"]*)"/.exec(meta ?? "")?.[1]
  const highlightLines = /\{([\d,\s-]+)\}/.exec(meta ?? "")?.[1]?.replace(/\s/g, "")
  return { title, highlightLines }
}

/**
 * Replaces every fenced ```lang block with <CodeBlock code=… language=… />
 * so lessons and YAML markdown share one server-rendered, copyable component.
 * Math blocks (handled by rehype-katex beforehand) are left alone.
 */
export function rehypeCodeBlocks() {
  return (tree: HastNode) => {
    const walk = (node: HastNode) => {
      node.children?.forEach((child, i) => {
        const code =
          child.tagName === "pre" ? child.children?.find((c) => c.tagName === "code") : undefined
        if (code && !classList(code).some((c) => c.includes("math"))) {
          const language =
            classList(code)
              .find((c) => c.startsWith("language-"))
              ?.slice("language-".length) ?? "text"
          const { title, highlightLines } = parseCodeMeta(code.data?.meta)
          const attr = (name: string, value: string | undefined) =>
            value === undefined ? [] : [{ type: "mdxJsxAttribute", name, value }]
          node.children![i] = {
            type: "mdxJsxFlowElement",
            name: "CodeBlock",
            attributes: [
              ...attr("code", textOf(code)),
              ...attr("language", language),
              ...attr("title", title),
              ...attr("highlightLines", highlightLines),
            ],
            children: [],
          }
        } else {
          walk(child)
        }
      })
    }
    walk(tree)
  }
}

/** Display equations can scroll sideways on small screens, so they must be keyboard-focusable. */
export function rehypeFocusableMath() {
  return (tree: HastNode) => {
    const walk = (node: HastNode) => {
      for (const child of node.children ?? []) {
        if (classList(child).includes("katex-display")) {
          child.properties = { ...child.properties, tabIndex: 0 }
        } else {
          walk(child)
        }
      }
    }
    walk(tree)
  }
}

/** Collects h2/h3 (after rehype-slug added ids) into `toc`. */
export function rehypeCollectToc(toc: TocEntry[]) {
  return () => (tree: HastNode) => {
    const walk = (node: HastNode) => {
      for (const child of node.children ?? []) {
        if ((child.tagName === "h2" || child.tagName === "h3") && child.properties?.id) {
          toc.push({
            id: String(child.properties.id),
            text: textOf(child),
            depth: child.tagName === "h2" ? 2 : 3,
          })
        }
        walk(child)
      }
    }
    walk(tree)
  }
}
