import React from "react";
import { vi, type Mock } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { Sidebar } from "./sidebar";
import { useAuth, authClient } from "@/core/auth";
import { useAdminPermissions } from "@/features/admin/hooks/use-admin-permissions";
import { usePathname, useRouter } from "next/navigation";
import { routes } from "@sd/core-contracts";

vi.mock("@/shared/hooks/use-responsive", () => ({
  useResponsive: vi.fn().mockReturnValue({ isMobile: false, isTablet: false, isWeb: true }),
}));

vi.mock("@/shared/hooks/use-is-hydrated", () => ({
  useIsHydrated: vi.fn().mockReturnValue(true),
}));

vi.mock("@/core/auth", () => ({
  useAuth: vi.fn(),
  authClient: {
    signOut: vi.fn(() => Promise.resolve()),
  },
}));

vi.mock("@/features/admin/hooks/use-admin-permissions", () => ({
  useAdminPermissions: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  usePathname: vi.fn(),
  useRouter: vi.fn(),
}));

vi.mock("@/core/i18n/use-translation", () => ({
  useTranslation: () => ({
    t: (key: string, fallback?: string) => fallback || key,
  }),
}));

describe("Sidebar component", () => {
  const mockPush = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (usePathname as Mock).mockReturnValue("/");
    (useRouter as Mock).mockReturnValue({ push: mockPush });
  });

  it("renders basic navigation links (Search, Explore, Live, Library, Settings)", () => {
    (useAuth as Mock).mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      user: null,
    });
    (useAdminPermissions as Mock).mockReturnValue({
      data: undefined,
    });

    render(<Sidebar />);

    // Basic nav checks
    expect(screen.getByText("Search")).toBeInTheDocument();
    expect(screen.getByText("Explore")).toBeInTheDocument();
    expect(screen.getByText("Live")).toBeInTheDocument();
    expect(screen.getByText("Library")).toBeInTheDocument();
    expect(screen.getByText("Settings")).toBeInTheDocument();
  });

  it("renders Sign In button when unauthenticated", () => {
    (useAuth as Mock).mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      user: null,
    });
    (useAdminPermissions as Mock).mockReturnValue({
      data: undefined,
    });

    render(<Sidebar />);

    expect(screen.getByRole("button", { name: "Sign In" })).toBeInTheDocument();
    expect(screen.queryByText("ADMIN")).not.toBeInTheDocument();
  });

  it("renders profile details and Sign Out when authenticated (non-admin)", () => {
    (useAuth as Mock).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { name: "Test User", email: "test@example.com" },
    });
    (useAdminPermissions as Mock).mockReturnValue({
      data: { permissions: [] },
    });

    render(<Sidebar />);

    expect(screen.getByText("Test User")).toBeInTheDocument();
    expect(screen.getByText("test@example.com")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sign Out" })).toBeInTheDocument();
    expect(screen.queryByText("ADMIN")).not.toBeInTheDocument();
  });

  it("calls authClient.signOut and redirects when Sign Out is clicked", async () => {
    (useAuth as Mock).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { name: "Test User", email: "test@example.com" },
    });
    (useAdminPermissions as Mock).mockReturnValue({
      data: { permissions: [] },
    });

    render(<Sidebar />);

    const signOutBtn = screen.getByRole("button", { name: "Sign Out" });
    await act(async () => {
      fireEvent.click(signOutBtn);
    });

    expect(authClient.signOut).toHaveBeenCalled();
    await vi.waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith(routes.home);
    });
  });

  it("renders ADMIN section with sub-routes only when user has admin permissions", () => {
    (useAuth as Mock).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { name: "Admin User", email: "admin@example.com" },
    });
    (useAdminPermissions as Mock).mockReturnValue({
      data: { permissions: [{ permission: "manage:scholars" }] },
    });

    render(<Sidebar />);

    expect(screen.getByText("ADMIN")).toBeInTheDocument();
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Stats")).toBeInTheDocument();
    expect(screen.getByText("Users")).toBeInTheDocument();
    expect(screen.getByText("Contents")).toBeInTheDocument();
    expect(screen.getByText("Scholars")).toBeInTheDocument();
  });
});
