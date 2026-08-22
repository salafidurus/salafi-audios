import { createMongoAbility } from "@casl/ability";
import { useAbility } from "@sd/domain-account";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi, type Mock } from "bun:test";
import React from "react";

import { useAuth } from "@/core/auth";
import { useResponsive } from "@/shared/hooks/use-responsive";

import { PublicNavigation } from "./public-navigation";

vi.mock("@/core/auth", () => ({
  useAuth: vi.fn(),
  authClient: { signOut: vi.fn(() => Promise.resolve()) },
}));

vi.mock("@sd/domain-account", () => ({
  useAbility: vi.fn(),
  hasAnyAdminAccess: (ability: { rules: unknown[] }) => ability.rules.length > 0,
}));

vi.mock("@/core/i18n/use-translation", () => ({
  useTranslation: () => ({
    t: (_key: string, fallback?: string) => fallback || _key,
    i18n: { dir: () => "ltr" },
  }),
}));

vi.mock("next/navigation", () => ({
  usePathname: vi.fn(() => "/"),
  useRouter: vi.fn(() => ({ push: vi.fn() })),
}));

vi.mock("@/shared/hooks/use-responsive", () => ({
  useResponsive: vi.fn(() => ({ isMobile: false, isTablet: false, isWeb: true })),
}));

vi.mock("@/features/settings", () => ({
  LanguageSwitch: () => <button type="button">Language</button>,
}));

vi.mock("next/image", () => ({ default: () => <span aria-hidden="true" /> }));
vi.mock("next/link", () => ({
  default: ({ children, ...props }: React.ComponentProps<"a">) => <a {...props}>{children}</a>,
}));

describe("PublicNavigation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useResponsive as Mock<any>).mockReturnValue({ isMobile: false, isTablet: false, isWeb: true });
    (useAuth as Mock<any>).mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      user: null,
    });
    (useAbility as Mock<any>).mockReturnValue({ ability: createMongoAbility([]) });
  });

  it("renders the public workspace landmarks without a sidebar", () => {
    render(<PublicNavigation />);

    expect(screen.getByRole("banner")).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "Main" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Explore" })).toHaveAttribute("href", "/explore");
    expect(screen.queryByTestId("sidebar")).not.toBeInTheDocument();
  });

  it("keeps account controls clear for signed-out visitors", () => {
    render(<PublicNavigation />);

    expect(screen.getByRole("link", { name: "Sign In" })).toHaveAttribute("href", "/sign-in");
    expect(screen.queryByRole("button", { name: "Account" })).not.toBeInTheDocument();
  });

  it("exposes Admin workspace only when backend-derived access exists", () => {
    (useAuth as Mock<any>).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { name: "Admin User", email: "admin@example.com" },
    });
    (useAbility as Mock<any>).mockReturnValue({
      ability: createMongoAbility([{ action: "read", subject: "Scholar" }]),
    });

    render(<PublicNavigation />);

    expect(screen.getByRole("button", { name: "Account" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Account" }));
    expect(screen.getByRole("menuitem", { name: "Admin workspace" })).toHaveAttribute(
      "href",
      "/admin",
    );
    fireEvent.click(screen.getByRole("menuitem", { name: "Sign Out" }));
    expect(
      screen.getByRole("heading", { name: "Are you sure you want to sign out?" }),
    ).toBeInTheDocument();
  });

  it("uses a mobile Sheet for the same public destinations", () => {
    (useResponsive as Mock<any>).mockReturnValue({ isMobile: true, isTablet: false, isWeb: false });

    render(<PublicNavigation />);

    expect(screen.queryByRole("navigation", { name: "Main" })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Main" }));
    expect(screen.getByRole("navigation", { name: "Main" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Explore" })).toHaveAttribute("href", "/explore");
  });
});
