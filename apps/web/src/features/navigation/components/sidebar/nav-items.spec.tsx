import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, type Mock } from "bun:test";
import { usePathname, useRouter } from "next/navigation";
import React from "react";

import { useAuth } from "@/core/auth";

import { NavItems } from "./nav-items";

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
  useAbility: vi
    .fn()
    .mockReturnValue({ ability: { rules: [], can: () => false }, isLoading: false }),
  hasAnyAdminAccess: (ability: any) => ability.rules.length > 0,
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
  LanguageSwitch: () => <div data-testid="mock-language-switch">Language Switch</div>,
}));

function setup() {
  process.env.NEXT_PUBLIC_API_URL = "http://localhost:3000";
  process.env.NEXT_PUBLIC_WEB_URL = "http://localhost:3001";
  (usePathname as Mock<any>).mockReturnValue("/");
  (useRouter as Mock<any>).mockReturnValue({ push: vi.fn() });
  (useAuth as Mock<any>).mockReturnValue({ isAuthenticated: false, user: null, isLoading: false });
}

describe("NavItems", () => {
  it("shows LanguageSwitch on tablet", () => {
    setup();
    const { useResponsive } = require("@/shared/hooks/use-responsive");
    (useResponsive as Mock<any>).mockReturnValue({ isMobile: false, isTablet: true, isWeb: false });

    render(<NavItems />);

    expect(screen.getByTestId("mock-language-switch")).toBeInTheDocument();
  });

  it("shows LanguageSwitch on mobile", () => {
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
});
