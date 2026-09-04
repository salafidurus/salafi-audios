import { createMongoAbility } from "@casl/ability";
import { useAbility } from "@sd/domain-account";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi, type Mock } from "bun:test";
import React from "react";

import { useAuth } from "@/core/auth";
import { useResponsive } from "@/shared/hooks/use-responsive";

import { ADMIN_RETURN_PATH_KEY } from "../../utils/admin-workspace";
import { PublicNavigation } from "./public-navigation";

vi.mock("@/core/auth", () => ({
  useAuth: vi.fn(),
  authClient: { signOut: vi.fn(() => Promise.resolve()) },
}));

vi.mock("@sd/domain-account", () => ({
  useAbility: vi.fn(),
  hasAnyAdminAccess: (ability: { rules: unknown[] }) => ability.rules.length > 0,
}));

vi.mock("@sd/domain-search", () => ({
  useSearchCatalog: vi.fn(() => ({ data: undefined, isLoading: false })),
  useTopicsList: vi.fn(() => ({ data: [], isLoading: false })),
}));

vi.mock("@sd/domain-content", () => ({
  useInfiniteScholarsList: vi.fn(() => ({ data: undefined, isLoading: false })),
}));

vi.mock("@/core/i18n/use-translation", () => ({
  useTranslation: () => ({
    t: (_key: string, fallback?: string) => fallback || _key,
    i18n: { dir: () => "ltr" },
  }),
}));

vi.mock("@/features/auth", () => ({
  AuthModal: ({ isOpen }: { isOpen: boolean }) =>
    isOpen ? <div role="dialog" aria-label="Auth modal" /> : null,
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
    expect(screen.getByRole("button", { name: "Search catalog" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Explore" })).toHaveAttribute("href", "/explore");
    expect(screen.queryByRole("link", { name: "Settings" })).not.toBeInTheDocument();
    expect(screen.queryByTestId("sidebar")).not.toBeInTheDocument();
  });

  it("opens the catalog palette from the search trigger", () => {
    render(<PublicNavigation />);

    fireEvent.click(screen.getByRole("button", { name: "Search catalog" }));

    expect(screen.getByRole("dialog", { name: "Search catalog" })).toBeInTheDocument();
  });

  it("shows guest settings and sign-in actions for signed-out visitors", () => {
    render(<PublicNavigation />);

    fireEvent.click(screen.getByRole("button", { name: "Account: Guest" }));
    expect(screen.getByRole("menuitem", { name: "Settings" })).toHaveAttribute("href", "/settings");
    expect(screen.getByRole("menuitem", { name: "Sign In" })).toBeInTheDocument();
  });

  it("opens the auth modal from the guest account menu", () => {
    render(<PublicNavigation />);

    fireEvent.click(screen.getByRole("button", { name: "Account: Guest" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Sign In" }));

    expect(screen.getByRole("dialog", { name: "Auth modal" })).toBeInTheDocument();
    expect(screen.queryByRole("menuitem", { name: "Sign In" })).not.toBeInTheDocument();
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
    expect(screen.queryByRole("menuitem", { name: "Admin Dashboard" })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Account: Admin User" }));
    fireEvent.pointerDown(document.body);
    expect(screen.queryByRole("menuitem", { name: "Sign Out" })).not.toBeInTheDocument();
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

  it("keeps search and account controls in the mobile top bar", () => {
    (useResponsive as Mock<any>).mockReturnValue({ isMobile: true, isTablet: false, isWeb: false });

    render(<PublicNavigation />);

    expect(screen.queryByRole("navigation", { name: "Main" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Search catalog" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Account: Guest" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Main" })).not.toBeInTheDocument();
  });

  it("keeps the full navigation on narrow desktop widths", () => {
    (useResponsive as Mock<any>).mockReturnValue({
      isMobile: false,
      isTablet: false,
      isNarrowDesktop: true,
      isWeb: true,
    });

    render(<PublicNavigation />);

    expect(screen.getByRole("navigation", { name: "Main" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Main" })).not.toBeInTheDocument();
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

    expect(screen.getByRole("link", { name: "Back to App" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: "Home" })).not.toHaveAttribute("aria-current");
    expect(screen.getByRole("link", { name: "Contents" })).toHaveAttribute(
      "href",
      "/admin/contents",
    );
    expect(screen.getByRole("link", { name: "Contents" })).toHaveAttribute("aria-current", "page");
    expect(screen.queryByRole("navigation", { name: "Breadcrumbs" })).not.toBeInTheDocument();
  });

  it("shows only admin destinations supported by the user's capabilities", () => {
    mockUsePathname.mockReturnValue("/admin");
    (useAuth as Mock<any>).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { name: "Scoped Editor", email: "editor@example.com" },
    });
    (useAbility as Mock<any>).mockReturnValue({
      ability: createMongoAbility([{ action: "read", subject: "Scholar" }]),
    });

    render(<PublicNavigation />);

    expect(screen.getByRole("link", { name: "Scholars" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Users" })).not.toBeInTheDocument();
  });

  it("returns to the last safe public path from the admin workspace", () => {
    window.sessionStorage.setItem(ADMIN_RETURN_PATH_KEY, "/my-library?tab=saved");
    mockUsePathname.mockReturnValue("/admin");
    (useAuth as Mock<any>).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { name: "Admin User", email: "admin@example.com" },
    });
    (useAbility as Mock<any>).mockReturnValue({
      ability: createMongoAbility([{ action: "read", subject: "Listing" }]),
    });

    render(<PublicNavigation />);

    expect(screen.getByRole("link", { name: "Back to App" })).toHaveAttribute(
      "href",
      "/my-library?tab=saved",
    );
    window.sessionStorage.removeItem(ADMIN_RETURN_PATH_KEY);
  });
});
