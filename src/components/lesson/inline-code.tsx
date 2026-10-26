/** Renders `backtick` spans in short titles (questions, problem titles) as inline code. */
export function InlineCode({ text }: { text: string }) {
  const parts = text.split(/`([^`]+)`/)
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <code key={i} className="bg-surface-2 rounded px-1 font-mono text-[0.9em]">
            {part}
          </code>
        ) : (
          part
        ),
      )}
    </>
  )
}

/** The same text without backticks, for places that only take plain text (titles, bookmarks). */
export const plainText = (text: string) => text.replace(/`([^`]+)`/g, "$1")
