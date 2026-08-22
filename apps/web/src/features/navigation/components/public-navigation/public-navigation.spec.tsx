import { createMongoAbility } from "@casl/ability";
import { useAbility } from "@sd/domain-account";
import { fireEvent, render, screen, within } from "@testing-library/react";
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

const mockUsePathname = vi.fn(() => "/");
const mockRouterPush = vi.fn();

vi.mock("next/navigation", () => ({
  usePathname: mockUsePathname,
  useRouter: vi.fn(() => ({ push: mockRouterPush })),
}));

vi.mock("@/shared/hooks/use-responsive", () => ({
  useResponsive: vi.fn(() => ({ isMobile: false, isTablet: false, isWeb: true })),
}));

vi.mock("@/features/settings", () => ({
  LanguageSwitch: () => <button type="button">Language</button>,
}));

vi.mock("@/shared/components/ui/avatar", () => ({
  Avatar: ({ children }: React.PropsWithChildren) => <span>{children}</span>,
  AvatarImage: ({ src, alt }: { src: string; alt: string }) => (
    <img data-testid="avatar-image" src={src} alt={alt} />
  ),
  AvatarFallback: ({ children }: React.PropsWithChildren) => <span>{children}</span>,
}));

vi.mock("next/image", () => ({
  default: ({
    alt,
    priority: _priority,
    ...props
  }: React.ComponentProps<"img"> & {
    priority?: boolean;
  }) => <img alt={alt ?? ""} {...props} />,
}));
vi.mock("next/link", () => ({
  default: React.forwardRef<HTMLAnchorElement, React.ComponentProps<"a">>(
    ({ children, ...props }, ref) => (
      <a ref={ref} {...props}>
        {children}
      </a>
    ),
  ),
}));

describe("PublicNavigation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRouterPush.mockReset();
    mockUsePathname.mockReturnValue("/");
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
    const mainNavigation = screen.getByRole("navigation", { name: "Main" });
    expect(mainNavigation).toBeInTheDocument();
    expect(within(mainNavigation).queryByRole("link", { name: "Search" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Search anything" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Explore" })).toHaveAttribute("href", "/explore");
    expect(screen.queryByTestId("sidebar")).not.toBeInTheDocument();
  });

  it("opens search from the search trigger", () => {
    render(<PublicNavigation />);

    fireEvent.click(screen.getByRole("button", { name: "Search anything" }));

    expect(mockRouterPush).toHaveBeenCalledWith("/search");
  });

  it("keeps account controls clear for signed-out visitors", () => {
    render(<PublicNavigation />);

    expect(screen.getByRole("link", { name: "Sign In" })).toHaveAttribute("href", "/sign-in");
    expect(screen.queryByRole("button", { name: "Account" })).not.toBeInTheDocument();
  });

  it("exposes Admin Dashboard only when backend-derived access exists", () => {
    (useAuth as Mock<any>).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { name: "Admin User", email: "admin@example.com" },
    });
    (useAbility as Mock<any>).mockReturnValue({
      ability: createMongoAbility([{ action: "read", subject: "Scholar" }]),
    });

    render(<PublicNavigation />);

    expect(screen.getByRole("button", { name: "Account: Admin User" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Admin Dashboard" })).toHaveAttribute("href", "/admin");
    fireEvent.click(screen.getByRole("button", { name: "Account: Admin User" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Sign Out" }));
    expect(
      screen.getByRole("heading", { name: "Are you sure you want to sign out?" }),
    ).toBeInTheDocument();
  });

  it("uses the authenticated user's avatar image when available", () => {
    (useAuth as Mock<any>).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: {
        name: "Reader User",
        email: "reader@example.com",
        image: "https://example.com/avatar.png",
      },
    });

    render(<PublicNavigation />);

    expect(screen.getByTestId("avatar-image")).toHaveAttribute(
      "src",
      "https://example.com/avatar.png",
    );
  });

  it("uses a mobile Sheet for the same public destinations", () => {
    (useResponsive as Mock<any>).mockReturnValue({ isMobile: true, isTablet: false, isWeb: false });

    render(<PublicNavigation />);

    expect(screen.queryByRole("navigation", { name: "Main" })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Main" }));
    expect(screen.getByRole("navigation", { name: "Main" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Explore" })).toHaveAttribute("href", "/explore");
  });

  it("switches to the admin workspace navigation with a back-to-app link", () => {
    mockUsePathname.mockReturnValue("/admin/contents");
    (useAuth as Mock<any>).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { name: "Admin User", email: "admin@example.com" },
    });
    (useAbility as Mock<any>).mockReturnValue({
      ability: createMongoAbility([{ action: "read", subject: "Listing" }]),
    });

    render(<PublicNavigation />);

    expect(screen.getByRole("link", { name: "Back to app" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: "Dashboard" })).not.toHaveAttribute("aria-current");
    expect(screen.getByRole("link", { name: "Contents" })).toHaveAttribute(
      "href",
      "/admin/contents",
    );
    expect(screen.getByRole("link", { name: "Contents" })).toHaveAttribute("aria-current", "page");
  });
});
