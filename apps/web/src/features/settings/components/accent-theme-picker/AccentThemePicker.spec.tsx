import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "bun:test";
import React from "react";

import { AccentThemePicker } from "./AccentThemePicker";

describe("AccentThemePicker", () => {
  it("renders system, parchment, and midnight themes", () => {
    render(<AccentThemePicker value="system" onChange={vi.fn()} />);
    expect(screen.getByRole("radio", { name: /System/ })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: /Parchment/ })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: /Midnight/ })).toBeInTheDocument();
    expect(screen.queryByRole("radio", { name: /Manuscript/ })).not.toBeInTheDocument();
    expect(screen.queryByRole("radio", { name: /Ember/ })).not.toBeInTheDocument();
  });

  it("marks the active theme as checked", () => {
    render(<AccentThemePicker value="midnight" onChange={vi.fn()} />);
    expect(screen.getByRole("radio", { name: /Midnight/ })).toHaveAttribute("aria-checked", "true");
    expect(screen.getByRole("radio", { name: /Parchment/ })).toHaveAttribute(
      "aria-checked",
      "false",
    );
  });

  it("calls onChange when a theme card is clicked", () => {
    const handleChange = vi.fn();
    render(<AccentThemePicker value="system" onChange={handleChange} />);
    fireEvent.click(screen.getByRole("radio", { name: /Midnight/ }));
    expect(handleChange).toHaveBeenCalledWith("midnight");
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
