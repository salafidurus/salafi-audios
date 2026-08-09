import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "bun:test";
import React from "react";

import { AccentThemePicker } from "./AccentThemePicker";

describe("AccentThemePicker", () => {
  it("renders the system theme and all named accents", () => {
    render(<AccentThemePicker value="system" onChange={vi.fn()} />);
    expect(screen.getByRole("radio", { name: /System/ })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: /Parchment/ })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: /Manuscript/ })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: /Midnight/ })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: /Ember/ })).toBeInTheDocument();
  });

  it("marks the active theme as checked", () => {
    render(<AccentThemePicker value="midnight" onChange={vi.fn()} />);
    expect(screen.getByRole("radio", { name: /Midnight/ })).toHaveAttribute("aria-checked", "true");
    expect(screen.getByRole("radio", { name: /Manuscript/ })).toHaveAttribute(
      "aria-checked",
      "false",
    );
  });

  it("calls onChange when a theme card is clicked", () => {
    const handleChange = vi.fn();
    render(<AccentThemePicker value="system" onChange={handleChange} />);
    fireEvent.click(screen.getByRole("radio", { name: /Ember/ }));
    expect(handleChange).toHaveBeenCalledWith("ember");
  });

  it("renders the optional title and description", () => {
    render(
      <AccentThemePicker
        value="system"
        onChange={vi.fn()}
        title="Accent theme"
        description="Pick a palette"
      />,
    );
    expect(screen.getByText("Accent theme")).toBeInTheDocument();
    expect(screen.getByText("Pick a palette")).toBeInTheDocument();
  });
});
