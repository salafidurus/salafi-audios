import { render, screen } from "@testing-library/react";
import { Button } from "./button";

describe("Button", () => {
  it("renders with default variant and size", () => {
    render(<Button>Click me</Button>);

    const button = screen.getByRole("button", { name: /click me/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass("variant-surface");
    expect(button).toHaveClass("size-md");
  });

  it("applies custom variant classes", () => {
    render(<Button variant="primary">Primary</Button>);

    const button = screen.getByRole("button", { name: /primary/i });
    expect(button).toHaveClass("variant-primary");
  });

  it("applies custom size classes", () => {
    render(<Button size="lg">Large</Button>);

    const button = screen.getByRole("button", { name: /large/i });
    expect(button).toHaveClass("size-lg");
  });

  it("merges custom className with default classes", () => {
    render(<Button className="custom-class">Custom</Button>);

    const button = screen.getByRole("button", { name: /custom/i });
    expect(button).toHaveClass("custom-class");
    expect(button).toHaveClass("variant-surface");
    expect(button).toHaveClass("size-md");
  });

  it("forwards additional button attributes", () => {
    render(
      <Button disabled aria-label="Test button">
        Disabled
      </Button>,
    );

    const button = screen.getByRole("button", { name: /test button/i });
    expect(button).toBeDisabled();
  });

  it("sets button type correctly", () => {
    render(<Button type="submit">Submit</Button>);

    const button = screen.getByRole("button", { name: /submit/i });
    expect(button).toHaveAttribute("type", "submit");
  });

  it("defaults to button type", () => {
    render(<Button>Default</Button>);

    const button = screen.getByRole("button", { name: /default/i });
    expect(button).toHaveAttribute("type", "button");
  });
});
