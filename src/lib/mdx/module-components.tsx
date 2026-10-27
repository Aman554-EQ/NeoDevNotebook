import type { MDXComponents } from "mdx/types"
import { Callout } from "@/components/lesson/callout"
import { KeyTakeaways } from "@/components/lesson/key-takeaways"
import { Reveal } from "@/components/lesson/reveal"
import { CallStack } from "@/components/viz/_shared/call-stack/call-stack"
import { CodeStepper } from "@/components/viz/_shared/code-stepper"
import { HttpExchange, OrmToSql, SqlPlayground } from "@/components/viz/_shared/web/recorded"
import { vizComponents } from "@/components/viz/__generated__/registry"

type Bound<T extends (props: never) => unknown> = Omit<Parameters<T>[0], "module">

/**
 * Components available to lesson and project MDX. Data-driven visuals read files of the page's own
 * module (content/<module>/traces/ and content/<module>/recordings/), so `module` is bound here.
 */
export function moduleComponents(module: string): MDXComponents {
  return {
    Callout,
    Reveal,
    KeyTakeaways,
    CodeStepper: (props: Bound<typeof CodeStepper>) => <CodeStepper module={module} {...props} />,
    CallStack: (props: Bound<typeof CallStack>) => <CallStack module={module} {...props} />,
    HttpExchange: (props: Bound<typeof HttpExchange>) => (
      <HttpExchange module={module} {...props} />
    ),
    OrmToSql: (props: Bound<typeof OrmToSql>) => <OrmToSql module={module} {...props} />,
    SqlPlayground: (props: Bound<typeof SqlPlayground>) => (
      <SqlPlayground module={module} {...props} />
    ),
    ...vizComponents,
  }
}
