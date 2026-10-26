import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"
import { DifficultyBadge } from "@/components/lesson/badges"
import { Callout } from "@/components/lesson/callout"
import { CopyButton, copyText } from "@/components/lesson/copy-button"
import { Reveal } from "@/components/lesson/reveal"
import { applyFilters, parseFilters, type BrowserItem } from "@/components/problem/item-browser"
import { Snippet } from "@/components/search/search-dialog"

afterEach(() => vi.restoreAllMocks())

describe("CopyButton", () => {
  it("copies the exact text with the Clipboard API and confirms", async () => {
    const user = userEvent.setup()
    const writeText = vi.spyOn(navigator.clipboard, "writeText").mockResolvedValue()
    const code = 'def f():\n    return {"a": 1}\n'
    render(<CopyButton text={code} />)
    await user.click(screen.getByRole("button", { name: "Copy code" }))
    expect(writeText).toHaveBeenCalledWith(code)
    expect(await screen.findByText("Copied!")).toBeInTheDocument()
  })

  it("falls back to execCommand when the Clipboard API fails", async () => {
    vi.spyOn(navigator.clipboard, "writeText").mockRejectedValue(new Error("denied"))
    const exec = vi.fn().mockReturnValue(true)
    document.execCommand = exec
    expect(await copyText("x")).toBe(true)
    expect(exec).toHaveBeenCalledWith("copy")
  })

  it("tells the user to copy manually when everything fails", async () => {
    const user = userEvent.setup()
    vi.spyOn(navigator.clipboard, "writeText").mockRejectedValue(new Error("denied"))
    document.execCommand = vi.fn().mockReturnValue(false)
    render(<CopyButton text="x" />)
    await user.click(screen.getByRole("button", { name: "Copy code" }))
    expect(await screen.findByText("Press Ctrl+C")).toBeInTheDocument()
  })
})

describe("lesson components", () => {
  it("Reveal hides content until opened", async () => {
    render(
      <Reveal label="Show solution">
        <p>secret</p>
      </Reveal>,
    )
    const details = screen.getByTestId("reveal-solution")
    expect(details).not.toHaveAttribute("open")
    await userEvent.click(screen.getByText("Show solution"))
    expect(details).toHaveAttribute("open")
  })

  it("Callout shows its default title per type", () => {
    render(<Callout type="warning">careful</Callout>)
    expect(screen.getByText("Watch out")).toBeInTheDocument()
    expect(screen.getByText("careful")).toBeInTheDocument()
  })

  it("DifficultyBadge exposes the level", () => {
    render(<DifficultyBadge level="hard" />)
    expect(screen.getByTestId("difficulty-badge")).toHaveAttribute("data-difficulty", "hard")
  })
})

describe("search snippet", () => {
  it("highlights only <b> markers and renders everything else as text", () => {
    const { container } = render(
      <Snippet text={"use <b>append</b> not <script>alert(1)</script>"} />,
    )
    expect(container.querySelectorAll("mark")).toHaveLength(1)
    expect(container.querySelector("mark")).toHaveTextContent("append")
    expect(container.querySelector("script")).toBeNull()
    expect(container).toHaveTextContent("<script>alert(1)</script>")
  })
})

describe("problem filters", () => {
  const items: BrowserItem[] = [
    {
      key: "problem:a-p-001",
      id: "a-p-001",
      title: "Reverse a list",
      difficulty: "easy",
      tags: ["lists"],
      href: "/1",
    },
    {
      key: "problem:a-p-002",
      id: "a-p-002",
      title: "Merge intervals",
      difficulty: "hard",
      tags: ["sorting"],
      href: "/2",
    },
    {
      key: "problem:a-p-003",
      id: "a-p-003",
      title: "Two pointers",
      difficulty: "medium",
      tags: ["lists"],
      href: "/3",
    },
  ]
  const none = () => false

  it("parses URL params and drops unknown values", () => {
    expect(
      parseFilters(new URLSearchParams("difficulty=easy,bogus,hard&tag=lists&q=rev&status=done")),
    ).toEqual({
      q: "rev",
      difficulty: ["easy", "hard"],
      tag: "lists",
      status: "done",
    })
    expect(parseFilters(new URLSearchParams("status=weird")).status).toBe("all")
  })

  it("combines difficulty, tag, text and status filters", () => {
    const f = (s: string) =>
      applyFilters(items, parseFilters(new URLSearchParams(s)), none).map((i) => i.id)
    expect(f("")).toHaveLength(3)
    expect(f("difficulty=easy,medium")).toEqual(["a-p-001", "a-p-003"])
    expect(f("tag=lists&difficulty=medium")).toEqual(["a-p-003"])
    expect(f("q=MERGE")).toEqual(["a-p-002"])
    expect(f("q=p-003")).toEqual(["a-p-003"])
    const isDone = (k: string) => k === "problem:a-p-002"
    expect(
      applyFilters(items, parseFilters(new URLSearchParams("status=done")), isDone).map(
        (i) => i.id,
      ),
    ).toEqual(["a-p-002"])
  })
})
