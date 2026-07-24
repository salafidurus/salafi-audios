import { describe, it, expect } from "bun:test";
import React from "react";
import { render, screen } from "@testing-library/react";
import { SettingsRow } from "./SettingsRow";

describe("SettingsRow", () => {
  it("renders the label", () => {
    render(<SettingsRow label="App Language" />);
    expect(screen.getByText("App Language")).toBeInTheDocument();
  });

  it("renders sublabel when provided", () => {
    render(<SettingsRow label="App Language" sublabel="Interface locale" />);
    expect(screen.getByText("Interface locale")).toBeInTheDocument();
  });

  it("renders children in the control slot", () => {
    render(
      <SettingsRow label="Theme">
        <button type="button">System</button>
      </SettingsRow>,
    );
    expect(screen.getByRole("button", { name: "System" })).toBeInTheDocument();
  });

  it("renders fullWidth variant without label column", () => {
    render(
      <SettingsRow label="hidden" fullWidth>
        <span data-testid="full-content">Full width content</span>
      </SettingsRow>,
    );
    // The label text should not appear in the fullWidth variant
    expect(screen.queryByText("hidden")).not.toBeInTheDocument();
    expect(screen.getByTestId("full-content")).toBeInTheDocument();
  });
});
