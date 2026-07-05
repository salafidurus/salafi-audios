import React from "react";
import { render, screen } from "@testing-library/react";
import { SettingsSection } from "./SettingsSection";

describe("SettingsSection", () => {
  it("renders the section title", () => {
    render(
      <SettingsSection title="Language">
        <div>child</div>
      </SettingsSection>,
    );
    expect(screen.getByText("Language")).toBeInTheDocument();
  });

  it("renders description when provided", () => {
    render(
      <SettingsSection title="Display" description="Choose a theme.">
        <div>child</div>
      </SettingsSection>,
    );
    expect(screen.getByText("Choose a theme.")).toBeInTheDocument();
  });

  it("does not render description when omitted", () => {
    render(
      <SettingsSection title="Display">
        <div>child</div>
      </SettingsSection>,
    );
    expect(screen.queryByText("Choose a theme.")).not.toBeInTheDocument();
  });

  it("renders children", () => {
    render(
      <SettingsSection title="Display">
        <span data-testid="child-node">Row Content</span>
      </SettingsSection>,
    );
    expect(screen.getByTestId("child-node")).toBeInTheDocument();
  });
});
