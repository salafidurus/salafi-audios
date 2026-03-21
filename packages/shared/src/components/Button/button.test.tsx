import { render, screen } from "@testing-library/react";
import { ButtonDesktopWeb } from "./Button.desktop.web";
// @ts-ignore
import type { Matchers } from "@testing-library/jest-dom";

describe("Button", () => {
  it("renders with default variant and size", () => {
    render(<ButtonDesktopWeb>Click me</ButtonDesktopWeb>);

    const button = screen.getByRole("button", { name: /click me/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass("variant-surface");
    expect(button).toHaveClass("size-md");
  });

  it("applies custom variant classes", () => {
    render(<ButtonDesktopWeb variant="primary">Primary</ButtonDesktopWeb>);

    const button = screen.getByRole("button", { name: /primary/i });
    expect(button).toHaveClass("variant-primary");
  });

  it("applies custom size classes", () => {
    render(<ButtonDesktopWeb size="lg">Large</ButtonDesktopWeb>);

    const button = screen.getByRole("button", { name: /large/i });
    expect(button).toHaveClass("size-lg");
  });

  it("merges custom className with default classes", () => {
    render(<ButtonDesktopWeb className="custom-class">Custom</ButtonDesktopWeb>);

    const button = screen.getByRole("button", { name: /custom/i });
    expect(button).toHaveClass("custom-class");
    expect(button).toHaveClass("variant-surface");
    expect(button).toHaveClass("size-md");
  });

  it("forwards additional button attributes", () => {
    render(
      <ButtonDesktopWeb disabled aria-label="Test button">
        Disabled
      </ButtonDesktopWeb>,
    );

    const button = screen.getByRole("button", { name: /test button/i });
    expect(button).toBeDisabled();
  });

  it("sets button type correctly", () => {
    render(<ButtonDesktopWeb type="submit">Submit</ButtonDesktopWeb>);

    const button = screen.getByRole("button", { name: /submit/i });
    expect(button).toHaveAttribute("type", "submit");
  });

  it("defaults to button type", () => {
    render(<ButtonDesktopWeb>Default</ButtonDesktopWeb>);

    const button = screen.getByRole("button", { name: /default/i });
    expect(button).toHaveAttribute("type", "button");
  });
});
