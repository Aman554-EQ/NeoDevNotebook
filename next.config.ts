import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  // content/ is read with fs (tracing is disabled on those calls); ship it with every route
  // so pages regenerated at runtime (ISR) can still read it.
  outputFileTracingIncludes: {
    "/*": ["./content/**/*"],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
}

export default nextConfig
