import { execFileSync } from "node:child_process"
import path from "node:path"
import { act, render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeAll, describe, expect, it, vi } from "vitest"
import { CodeStepperView } from "@/components/viz/_shared/code-stepper-view"
import { describeStep, type Trace } from "@/lib/trace/narrate"

// jsdom has neither IntersectionObserver nor matchMedia; VizFrame needs both.
beforeAll(() => {
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      constructor(private cb: IntersectionObserverCallback) {}
      observe(el: Element) {
        this.cb([{ isIntersecting: true, target: el } as IntersectionObserverEntry], this as never)
      }
      disconnect() {}
      unobserve() {}
    },
  )
  vi.stubGlobal("matchMedia", (q: string) => ({
    matches: false,
    media: q,
    addEventListener() {},
    removeEventListener() {},
  }))
})

const trace = JSON.parse(
  execFileSync(
    "python",
    [
      path.resolve("scripts/trace_python.py"),
      "--one",
      path.resolve("tests/fixtures/traces/basics.py"),
    ],
    {
      encoding: "utf8",
    },
  ),
) as Trace
const sourceLines = trace.source.replace(/\n$/, "").split("\n")

function renderStepper() {
  return render(
    <CodeStepperView
      title="Demo run"
      caption="Watch total grow."
      steps={trace.steps.map((_, i) => describeStep(trace.steps, i, sourceLines))}
      trace={{ steps: trace.steps, truncated: false, python: trace.python }}
      lines={sourceLines.map((l) => l.replace(/&/g, "&amp;").replace(/</g, "&lt;"))}
    />,
  )
}

describe("CodeStepperView", () => {
  it("starts on step 1 with the first line marked and empty output", () => {
    renderStepper()
    expect(screen.getByText(/Real run · Python 3\.\d+/)).toBeInTheDocument()
    expect(screen.getByTestId("viz-narration")).toHaveTextContent("Step 1/20")
    const current = screen.getByTestId("stepper-code").querySelector("[data-current]")
    expect(current).toHaveAttribute("data-line", "1")
    expect(screen.getByTestId("stepper-output").querySelector("pre")!.textContent?.trim()).toBe("")
  })

  it("steps into a call: two frames, the inner one with its argument", async () => {
    const user = userEvent.setup()
    renderStepper()
    for (let i = 0; i < 4; i++) await user.click(screen.getByTestId("viz-step"))
    expect(screen.getByTestId("viz-narration")).toHaveTextContent("Call double")
    const frames = within(screen.getByTestId("stepper-frames")).getAllByRole("listitem")
    expect(frames.map((f) => f.querySelector("p")!.textContent)).toEqual(["global", "double()"])
    expect(frames[1]).toHaveTextContent("n0")
  })

  it("shows printed output and the caught exception at the right steps", async () => {
    const user = userEvent.setup()
    renderStepper()
    for (let i = 0; i < 16; i++) await user.click(screen.getByTestId("viz-step"))
    expect(screen.getByTestId("stepper-exception")).toHaveTextContent("ValueError")
    expect(screen.getByTestId("stepper-output")).toHaveTextContent("total 2")
    await act(async () => {
      await user.click(screen.getByTestId("viz-reset"))
    })
    expect(screen.getByTestId("viz-narration")).toHaveTextContent("Step 1/20")
  })

  it("uses a progress bar instead of 20 dots", () => {
    const { container } = renderStepper()
    expect(container.querySelectorAll("ol[aria-hidden] > li")).toHaveLength(0)
  })
})
