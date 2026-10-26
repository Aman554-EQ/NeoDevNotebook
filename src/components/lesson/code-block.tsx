import { highlight, LANGUAGE_LABEL } from "@/lib/mdx/highlight"
import { CopyButton } from "./copy-button"

type Props = {
  code: string
  language?: string
  title?: string
  /** Line ranges to highlight, e.g. "2,4-5" */
  highlightLines?: string
}

/**
 * Server-rendered code block: Shiki runs at build time (zero client JS for highlighting);
 * only the copy button hydrates. The copied text is exactly `code`.
 */
export async function CodeBlock({ code, language = "text", title, highlightLines }: Props) {
  const source = code.replace(/\n+$/, "")
  const html = await highlight(source, language, highlightLines)
  const label = LANGUAGE_LABEL[language] ?? language
  return (
    <figure
      data-testid="code-block"
      data-language={language}
      className="not-prose border-rule bg-code-bg my-6 overflow-hidden rounded-[var(--radius-card)] border"
    >
      <figcaption className="border-rule flex items-center justify-between gap-2 border-b px-3 py-1.5">
        <span className="text-muted truncate font-mono text-xs">{title ?? label}</span>
        <CopyButton text={source} label={`Copy ${title ?? label} code`} />
      </figcaption>
      <div
        tabIndex={0}
        role="region"
        aria-label={`${title ?? label} code`}
        className="overflow-x-auto py-3 font-mono text-[0.875rem] leading-relaxed [&_.line]:px-4 [&_pre]:min-w-max"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </figure>
  )
}
