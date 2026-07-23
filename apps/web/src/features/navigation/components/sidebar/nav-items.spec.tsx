import { describe, it, expect, vi, type Mock } from "bun:test";
import React from "react";
import { render, screen } from "@testing-library/react";
import { NavItems } from "./nav-items";
import { useAuth } from "@/core/auth";
import { useAdminPermissions } from "@sd/domain-account";
import { usePathname, useRouter } from "next/navigation";

vi.mock("@/shared/hooks/use-responsive", () => ({
  useResponsive: vi.fn().mockReturnValue({ isMobile: false, isTablet: false, isWeb: true }),
}));

vi.mock("@/shared/hooks/use-is-hydrated", () => ({
  useIsHydrated: vi.fn().mockReturnValue(true),
}));

vi.mock("@/core/auth", () => ({
  useAuth: vi.fn(),
  authClient: { signOut: vi.fn(() => Promise.resolve()) },
}));

vi.mock("@sd/domain-account", () => ({
  useAdminPermissions: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  usePathname: vi.fn(),
  useRouter: vi.fn(),
}));

vi.mock("@/core/i18n/use-translation", () => ({
  useTranslation: () => ({
    t: (key: string, fallback?: string) => fallback ?? key,
  }),
}));

vi.mock("@/features/settings", () => ({
  LanguageSwitch: ({ collapsed }: { collapsed?: boolean }) => (
    <div data-testid="mock-language-switch" data-collapsed={String(collapsed)}>
      Language Switch
    </div>
  ),
}));

function setup() {
  process.env.NEXT_PUBLIC_API_URL = "http://localhost:3000";
  process.env.NEXT_PUBLIC_WEB_URL = "http://localhost:3001";
  (usePathname as Mock<any>).mockReturnValue("/");
  (useRouter as Mock<any>).mockReturnValue({ push: vi.fn() });
  (useAuth as Mock<any>).mockReturnValue({ isAuthenticated: false, isLoading: false, user: null });
  (useAdminPermissions as Mock<any>).mockReturnValue({ data: undefined });
}

describe("NavItems > language switch visibility", () => {
  it("shows LanguageSwitch when isTablet is true", () => {
    setup();
    const { useResponsive } = require("@/shared/hooks/use-responsive");
    (useResponsive as Mock<any>).mockReturnValue({ isMobile: false, isTablet: true, isWeb: false });

    render(<NavItems />);

    expect(screen.getByTestId("mock-language-switch")).toBeInTheDocument();
  });

  it("shows LanguageSwitch when isMobile is true", () => {
    setup();
    const { useResponsive } = require("@/shared/hooks/use-responsive");
    (useResponsive as Mock<any>).mockReturnValue({ isMobile: true, isTablet: false, isWeb: false });

    render(<NavItems />);

    expect(screen.getByTestId("mock-language-switch")).toBeInTheDocument();
  });

  it("hides LanguageSwitch on desktop", () => {
    setup();
    const { useResponsive } = require("@/shared/hooks/use-responsive");
    (useResponsive as Mock<any>).mockReturnValue({ isMobile: false, isTablet: false, isWeb: true });

    render(<NavItems />);

    expect(screen.queryByTestId("mock-language-switch")).not.toBeInTheDocument();
  });

  it("passes collapsed=true to LanguageSwitch when sidebar is collapsed on tablet", () => {
    setup();
    const { useResponsive } = require("@/shared/hooks/use-responsive");
    (useResponsive as Mock<any>).mockReturnValue({ isMobile: false, isTablet: true, isWeb: false });

    render(<NavItems collapsed={true} />);

    const switchEl = screen.getByTestId("mock-language-switch");
    expect(switchEl).toBeInTheDocument();
    expect(switchEl).toHaveAttribute("data-collapsed", "true");
  });
});
