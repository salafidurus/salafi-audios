import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "bun:test";
import React from "react";

import { SettingsGeneralScreen } from "./settings-general.screen";

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

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

const mockSearchParams = vi.fn(() => new URLSearchParams());

vi.mock("next/navigation", () => ({
  useSearchParams: () => mockSearchParams(),
}));

vi.mock("./settings-profile.screen", () => ({
  SettingsProfileScreen: () => <div data-testid="profile-panel">Profile panel</div>,
}));

const TabsChangeContext = React.createContext<(value: string) => void>(() => {});

vi.mock("@/shared/components/ui/tabs", () => ({
  Tabs: ({
    onValueChange,
    children,
  }: {
    onValueChange: (value: string) => void;
    children: React.ReactNode;
  }) => <TabsChangeContext.Provider value={onValueChange}>{children}</TabsChangeContext.Provider>,
  TabsList: ({ children }: { children: React.ReactNode }) => <div role="tablist">{children}</div>,
  TabsTrigger: ({ value, children }: { value: string; children: React.ReactNode }) => {
    const onValueChange = React.useContext(TabsChangeContext);
    return (
      <button role="tab" type="button" onClick={() => onValueChange(value)}>
        {children}
      </button>
    );
  },
}));

vi.mock("@/features/settings/components/SettingsSection/SettingsSection", () => ({
  SettingsSection: ({ title, children }: { title: string; children: React.ReactNode }) => (
    <section>
      <h2>{title}</h2>
      {children}
    </section>
  ),
}));

vi.mock("@/features/settings/components/SettingsRow/SettingsRow", () => ({
  SettingsRow: ({ label, children }: { label: string; children?: React.ReactNode }) => (
    <div>
      <span>{label}</span>
      {children}
    </div>
  ),
}));

vi.mock("@/features/settings/components/SegmentedControl/SegmentedControl", () => ({
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
    mockSearchParams.mockReturnValue(new URLSearchParams());
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

  it("exposes support and legal destinations through accessible Settings links", () => {
    render(<SettingsGeneralScreen />);

    expect(screen.getByRole("link", { name: "Contact Support" })).toHaveAttribute(
      "href",
      "/support",
    );
    expect(screen.getByRole("link", { name: "Terms and Conditions" })).toHaveAttribute(
      "href",
      "/terms-of-use",
    );
    expect(screen.getByRole("link", { name: "Privacy Policy" })).toHaveAttribute(
      "href",
      "/privacy",
    );
    expect(screen.getByRole("link", { name: "Cookie Policy" })).toHaveAttribute(
      "href",
      "/cookie-policy",
    );
  });

  it("does not render the mobile section", () => {
    render(<SettingsGeneralScreen />);
    expect(screen.queryByText("MOBILE")).not.toBeInTheDocument();
    expect(screen.queryByText("Download the app")).not.toBeInTheDocument();
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

  it("keeps the mode control available", () => {
    render(<SettingsGeneralScreen />);
    expect(screen.getByRole("button", { name: "Dark" })).toBeInTheDocument();
  });

  it("renders Profile when the URL selects the profile tab", () => {
    mockSearchParams.mockReturnValue(new URLSearchParams("tab=profile"));
    render(<SettingsGeneralScreen />);

    expect(screen.getByTestId("profile-panel")).toBeInTheDocument();
    expect(screen.queryByText("Language")).not.toBeInTheDocument();
  });

  it.each(["", "invalid", "general"])('renders General for tab value "%s"', (tab) => {
    mockSearchParams.mockReturnValue(new URLSearchParams(tab ? `tab=${tab}` : ""));
    render(<SettingsGeneralScreen />);

    expect(screen.getByText("Language")).toBeInTheDocument();
  });

  it("updates the URL when the Profile tab is selected", () => {
    render(<SettingsGeneralScreen />);

    const replaceStateSpy = vi.spyOn(window.history, "replaceState");
    fireEvent.click(screen.getByRole("tab", { name: "Profile" }));

    expect(replaceStateSpy).toHaveBeenCalledWith(window.history.state, "", "/settings?tab=profile");
  });
});
