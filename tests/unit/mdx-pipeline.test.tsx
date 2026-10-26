import { evaluate } from "@mdx-js/mdx"
import * as runtime from "react/jsx-runtime"
import { renderToStaticMarkup } from "react-dom/server"
import rehypeKatex from "rehype-katex"
import rehypeSlug from "rehype-slug"
import remarkMath from "remark-math"
import { describe, expect, it } from "vitest"
import { normaliseLanguage, parseLineRanges } from "@/lib/mdx/highlight"
import { parseCodeMeta, rehypeCodeBlocks, rehypeCollectToc, type TocEntry } from "@/lib/mdx/plugins"

type CodeProps = { code: string; language: string; title?: string; highlightLines?: string }

/** Same plugin chain as src/lib/mdx/render.tsx, with a synchronous CodeBlock stand-in. */
async function render(source: string) {
  const toc: TocEntry[] = []
  const calls: CodeProps[] = []
  const { default: Content } = await evaluate(source, {
    ...runtime,
    remarkPlugins: [remarkMath],
    rehypePlugins: [rehypeKatex, rehypeCodeBlocks, rehypeSlug, rehypeCollectToc(toc)],
  })
  const CodeBlock = (p: CodeProps) => {
    calls.push(p)
    return <pre data-lang={p.language}>{p.code}</pre>
  }
  const html = renderToStaticMarkup(<Content components={{ CodeBlock }} />)
  return { html, toc, calls }
}

describe("MDX pipeline", () => {
  it("turns fenced code into <CodeBlock> with exact source, language, title and highlights", async () => {
    const { calls } = await render('```python title="demo.py" {1,3-4}\nx = {"a": 1}\nprint(x)\n```')
    expect(calls).toEqual([
      {
        code: 'x = {"a": 1}\nprint(x)\n',
        language: "python",
        title: "demo.py",
        highlightLines: "1,3-4",
      },
    ])
  })

  it("defaults the language to text", async () => {
    const { calls } = await render("```\nplain\n```")
    expect(calls[0]?.language).toBe("text")
  })

  it("renders display and inline math with KaTeX and leaves it out of CodeBlock", async () => {
    const { html, calls } = await render("Inline $a^2$.\n\n$$\n\\frac{n}{r}\n$$")
    expect(html).toContain('class="katex"')
    expect(html).toContain("katex-display")
    expect(calls).toHaveLength(0)
  })

  it("collects h2/h3 headings with slug ids for the outline", async () => {
    const { toc, html } = await render(
      "## First part\n\n### A detail\n\n#### ignored\n\n## Second part",
    )
    expect(toc).toEqual([
      { id: "first-part", text: "First part", depth: 2 },
      { id: "a-detail", text: "A detail", depth: 3 },
      { id: "second-part", text: "Second part", depth: 2 },
    ])
    expect(html).toContain('id="first-part"')
  })
})

describe("code meta & highlighting helpers", () => {
  it("parses fence meta", () => {
    expect(parseCodeMeta('title="a b.py" {2}')).toEqual({ title: "a b.py", highlightLines: "2" })
    expect(parseCodeMeta(undefined)).toEqual({ title: undefined, highlightLines: undefined })
  })

  it("parses line ranges", () => {
    expect([...parseLineRanges("1,3-5")]).toEqual([1, 3, 4, 5])
    expect(parseLineRanges("").size).toBe(0)
    expect(parseLineRanges("x,2").has(2)).toBe(true)
  })

  it("normalises language aliases and unknowns", () => {
    expect(normaliseLanguage("py")).toBe("python")
    expect(normaliseLanguage("sh")).toBe("bash")
    expect(normaliseLanguage("YML")).toBe("yaml")
    expect(normaliseLanguage("brainfuck")).toBe("text")
    expect(normaliseLanguage(undefined)).toBe("text")
  })
})
