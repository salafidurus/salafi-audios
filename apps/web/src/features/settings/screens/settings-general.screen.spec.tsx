import { describe, it, expect, vi, beforeEach } from "bun:test";
import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { SettingsGeneralScreen } from "./settings-general.screen";

vi.mock("@/features/settings/i18n", () => ({
  LanguageSwitch: () => <div data-testid="language-switch">LanguageSwitch</div>,
  ContentLanguageToggle: () => (
    <div data-testid="content-language-toggle">ContentLanguageToggle</div>
  ),
}));

vi.mock("@/shared/components/ScreenView/ScreenView", () => ({
  ScreenView: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="screen-view">{children}</div>
  ),
}));

vi.mock("@/shared/components/SettingsSection/SettingsSection", () => ({
  SettingsSection: ({ title, children }: { title: string; children: React.ReactNode }) => (
    <section>
      <h2>{title}</h2>
      {children}
    </section>
  ),
}));

vi.mock("@/shared/components/SettingsRow/SettingsRow", () => ({
  SettingsRow: ({ label, children }: { label: string; children?: React.ReactNode }) => (
    <div>
      <span>{label}</span>
      {children}
    </div>
  ),
}));

vi.mock("@/shared/components/SegmentedControl/SegmentedControl", () => ({
  SegmentedControl: ({
    options,
    value,
    onChange,
  }: {
    options: { value: string; label: string }[];
    value: string;
    onChange: (v: string) => void;
  }) => (
    <div role="group">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          aria-pressed={o.value === value}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  ),
}));

describe("SettingsGeneralScreen", () => {
  const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
      getItem: (key: string) => store[key] ?? null,
      setItem: (key: string, val: string) => {
        store[key] = val;
      },
      removeItem: (key: string) => {
        delete store[key];
      },
      clear: () => {
        store = {};
      },
    };
  })();

  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
    Object.defineProperty(window, "localStorage", {
      value: localStorageMock,
      writable: true,
    });
  });

  it("renders the Settings title", () => {
    render(<SettingsGeneralScreen />);
    expect(screen.getByText("Settings")).toBeInTheDocument();
  });

  it("renders Language section", () => {
    render(<SettingsGeneralScreen />);
    expect(screen.getByText("Language")).toBeInTheDocument();
  });

  it("renders Display section", () => {
    render(<SettingsGeneralScreen />);
    expect(screen.getByText("Display")).toBeInTheDocument();
  });

  it("renders Notifications section", () => {
    render(<SettingsGeneralScreen />);
    expect(screen.getByText("Notifications")).toBeInTheDocument();
  });

  it("renders LanguageSwitch and ContentLanguageToggle", () => {
    render(<SettingsGeneralScreen />);
    expect(screen.getByTestId("language-switch")).toBeInTheDocument();
    expect(screen.getByTestId("content-language-toggle")).toBeInTheDocument();
  });

  it("persists theme to localStorage when changed", async () => {
    const dispatchSpy = vi.spyOn(window, "dispatchEvent");
    render(<SettingsGeneralScreen />);

    // Wait for hydration
    await act(async () => {});

    const darkButton = screen.getByRole("button", { name: "Dark" });
    fireEvent.click(darkButton);

    expect(localStorageMock.getItem("theme-preference:v1")).toBe("dark");
    expect(dispatchSpy).toHaveBeenCalledWith(expect.any(Event));
  });

  it("shows sub-toggles when master notification is ON", async () => {
    render(<SettingsGeneralScreen />);
    await act(async () => {});
    expect(screen.getByText("Followed Scholars")).toBeInTheDocument();
    expect(screen.getByText("New Lectures")).toBeInTheDocument();
  });

  it("hides sub-toggles when master notification is turned OFF", async () => {
    render(<SettingsGeneralScreen />);
    await act(async () => {});

    // Master is the first switch; click to uncheck it
    const switches = screen.getAllByRole("switch");
    fireEvent.click(switches[0]!);

    expect(screen.queryByText("Followed Scholars")).not.toBeInTheDocument();
    expect(screen.queryByText("New Lectures")).not.toBeInTheDocument();
  });
});
