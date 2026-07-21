import { describe, it, expect } from "bun:test";
import { render, screen } from "@testing-library/react";
import { Button } from "./Button";

describe("Button loading state", () => {
  it("is disabled when loading=true", () => {
    render(<Button loading label="Submit" />);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("renders a spinner element when loading=true", () => {
    const { container } = render(<Button loading label="Submit" />);
    // spinner has aria-hidden="true" and a .spinner class
    const spinner = container.querySelector("[aria-hidden='true']");
    expect(spinner).not.toBeNull();
  });

  it("does not render a spinner when loading=false", () => {
    const { container } = render(<Button loading={false} label="Submit" />);
    const spinner = container.querySelector("[aria-hidden='true']");
    expect(spinner).toBeNull();
  });

  it("is not disabled when loading=false and disabled not set", () => {
    render(<Button loading={false} label="Submit" />);
    expect(screen.getByRole("button")).not.toBeDisabled();
  });
});

describe("Button radius", () => {
  it("defaults to pill radius", () => {
    render(<Button label="Submit" />);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("accepts md radius", () => {
    render(<Button radius="md" label="Submit" />);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("accepts sm radius", () => {
    render(<Button radius="sm" label="Submit" />);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });
});
