// Windows limits a command line to ~8 KB, so big commits are split into chunks of files.
const CHUNK = 30
const quote = (f) => `"${f}"`
const chunks = (files) =>
  Array.from({ length: Math.ceil(files.length / CHUNK) }, (_, i) =>
    files
      .slice(i * CHUNK, (i + 1) * CHUNK)
      .map(quote)
      .join(" "),
  )

const config = {
  "*.{ts,tsx,js,mjs}": (files) =>
    chunks(files).flatMap((c) => [`eslint --fix ${c}`, `prettier --write ${c}`]),
  "*.{json,md,mdx,yaml,yml,css}": (files) => chunks(files).map((c) => `prettier --write ${c}`),
}

export default config
