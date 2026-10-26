import { render } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { InlineCode, plainText } from "@/components/lesson/inline-code"

describe("InlineCode", () => {
  it("renders backtick spans as code and keeps the rest as text", () => {
    const { container } = render(<InlineCode text="What do `*args` and `**kwargs` mean?" />)
    expect([...container.querySelectorAll("code")].map((c) => c.textContent)).toEqual([
      "*args",
      "**kwargs",
    ])
    expect(container.textContent).toBe("What do *args and **kwargs mean?")
  })

  it("plainText strips the backticks", () => {
    expect(plainText("`is` vs `==`")).toBe("is vs ==")
    expect(plainText("no code")).toBe("no code")
  })
})
