import { describe, it, expect, vi } from "bun:test";
import React from "react";
import { render, screen } from "@testing-library/react";
import { SettingsLegalScreen } from "./settings-legal.screen";

vi.mock("@/shared/components/ScreenView/ScreenView", () => ({
  ScreenView: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="screen-view">{children}</div>
  ),
}));

vi.mock("@/shared/components/SettingsSection/SettingsSection", () => ({
  SettingsSection: ({
    title,
    description,
    children,
  }: {
    title: string;
    description?: string;
    children: React.ReactNode;
  }) => (
    <section>
      <h2>{title}</h2>
      {description && <p>{description}</p>}
      {children}
    </section>
  ),
}));

vi.mock("@/shared/components/SettingsRow/SettingsRow", () => ({
  SettingsRow: ({
    label,
    sublabel,
    children,
  }: {
    label: string;
    sublabel?: string;
    children?: React.ReactNode;
  }) => (
    <div>
      <span>{label}</span>
      {sublabel && <span>{sublabel}</span>}
      {children}
    </div>
  ),
}));

vi.mock("next/link", () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

describe("SettingsLegalScreen", () => {
  it("renders the Legal title", () => {
    render(<SettingsLegalScreen />);
    expect(screen.getByText("Legal")).toBeInTheDocument();
  });

  it("renders Privacy Policy section", () => {
    render(<SettingsLegalScreen />);
    expect(screen.getAllByText("Privacy Policy").length).toBeGreaterThan(0);
  });

  it("renders Terms of Use section", () => {
    render(<SettingsLegalScreen />);
    expect(screen.getAllByText("Terms of Use").length).toBeGreaterThan(0);
  });

  it("has a link to /privacy", () => {
    render(<SettingsLegalScreen />);
    const links = screen.getAllByRole("link");
    const privacyHref = links.find((l) => l.getAttribute("href") === "/privacy");
    expect(privacyHref).toBeTruthy();
  });

  it("has a link to /terms-of-use", () => {
    render(<SettingsLegalScreen />);
    const links = screen.getAllByRole("link");
    const termsHref = links.find((l) => l.getAttribute("href") === "/terms-of-use");
    expect(termsHref).toBeTruthy();
  });
});
