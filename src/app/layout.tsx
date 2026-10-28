import type { Metadata, Viewport } from "next"
import { Fraunces, Inter, JetBrains_Mono } from "next/font/google"
import { ExtensionAttrScript } from "@/components/layout/extension-attr-script"
import { ThemeScript } from "@/components/layout/theme-script"
import { TopBar } from "@/components/layout/top-bar"
import { SITE_NAME } from "@/lib/utils"
import "./globals.css"

// Above-the-fold fonts use display "optional": no late swap that would delay LCP or shift text.
// The metric-matched fallback (next/font adjustFontFallback) keeps the first paint close to the final look.
const inter = Inter({ variable: "--font-inter", subsets: ["latin"], display: "optional" })
// Headings only use weight 600, so one static weight replaces the much larger variable font.
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: "600",
  display: "optional",
})
// Code font is mostly below the fold: not preloaded, swapped in when ready.
const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
  preload: false,
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: { default: `${SITE_NAME} — learn by seeing`, template: `%s · ${SITE_NAME}` },
  description:
    "A visual, tutor-style digital notebook for Python, Django, Flask, FastAPI, Git, Docker, PyTorch, ML and LLM interview preparation.",
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbfaf7" },
    { media: "(prefers-color-scheme: dark)", color: "#0f1216" },
  ],
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${fraunces.variable} ${jetbrains.variable} antialiased`}
    >
      <head>
        <ThemeScript />
        <ExtensionAttrScript />
      </head>
      <body className="flex min-h-dvh flex-col">
        <a
          href="#main"
          className="bg-accent text-accent-ink sr-only z-50 rounded-md px-4 py-2 focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
        >
          Skip to content
        </a>
        <TopBar />
        <div id="main" className="flex-1">
          {children}
        </div>
        <footer className="border-rule text-muted border-t py-8 text-center text-sm">
          <p>{SITE_NAME} · concept → visual → example → practice</p>
        </footer>
      </body>
    </html>
  )
}
