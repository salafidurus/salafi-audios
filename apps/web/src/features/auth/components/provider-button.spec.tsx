import React from "react";
import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import { GoogleButton, AppleButton } from "./provider-button";

describe("GoogleButton", () => {
  it("renders with correct aria-label", () => {
    render(<GoogleButton onClick={vi.fn()} />);
    expect(screen.getByLabelText("Continue with Google")).toBeInTheDocument();
  });

  it("renders Google SVG icon", () => {
    const { container } = render(<GoogleButton onClick={vi.fn()} />);
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("renders with 'Sign in with Google' text", () => {
    render(<GoogleButton onClick={vi.fn()} />);
    expect(screen.getByRole("button", { name: /Continue with Google/ })).toBeInTheDocument();
  });

  it("calls onClick when clicked", () => {
    const onClick = vi.fn();
    render(<GoogleButton onClick={onClick} />);
    screen.getByLabelText("Continue with Google").click();
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("does not call onClick when disabled", () => {
    const onClick = vi.fn();
    render(<GoogleButton onClick={onClick} disabled />);
    const button = screen.getByLabelText("Continue with Google");
    expect(button).toBeDisabled();
    button.click();
    expect(onClick).not.toHaveBeenCalled();
  });
});

describe("AppleButton", () => {
  it("renders with correct aria-label", () => {
    render(<AppleButton onClick={vi.fn()} />);
    expect(screen.getByLabelText("Continue with Apple")).toBeInTheDocument();
  });

  it("renders Apple SVG icon", () => {
    const { container } = render(<AppleButton onClick={vi.fn()} />);
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("renders with 'Sign in with Apple' text", () => {
    render(<AppleButton onClick={vi.fn()} />);
    expect(screen.getByText("Sign in with Apple")).toBeInTheDocument();
  });

  it("calls onClick when clicked", () => {
    const onClick = vi.fn();
    render(<AppleButton onClick={onClick} />);
    screen.getByLabelText("Continue with Apple").click();
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("does not call onClick when disabled", () => {
    const onClick = vi.fn();
    render(<AppleButton onClick={onClick} disabled />);
    const button = screen.getByLabelText("Continue with Apple");
    expect(button).toBeDisabled();
    button.click();
    expect(onClick).not.toHaveBeenCalled();
  });
});
