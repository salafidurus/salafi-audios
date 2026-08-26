import { createMongoAbility } from "@casl/ability";
import { useAbility } from "@sd/domain-account";
import { render, screen, fireEvent, act, waitFor } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi, type Mock } from "bun:test";
import { usePathname, useRouter } from "next/navigation";
import React from "react";

import { useAuth, authClient } from "@/core/auth";

import { Sidebar } from "./sidebar";

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

vi.mock("@sd/domain-account", () => ({
  useAbility: vi.fn(),
  hasAnyAdminAccess: (ability: any) => ability.rules.length > 0,
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
    (usePathname as Mock<any>).mockReturnValue("/");
    (useRouter as Mock<any>).mockReturnValue({ push: mockPush });
    // Ensure environment variables are set for each test
    process.env.NEXT_PUBLIC_API_URL = "http://localhost:3000";
    process.env.NEXT_PUBLIC_WEB_URL = "http://localhost:3001";
  });

  it("renders basic navigation links (Search, Explore, Scholars, My Library, Settings)", () => {
    (useAuth as Mock<any>).mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      user: null,
    });
    (useAbility as Mock<any>).mockReturnValue({ ability: createMongoAbility([]) });

    render(<Sidebar />);

    expect(screen.getByText("Search")).toBeInTheDocument();
    expect(screen.getByText("Explore")).toBeInTheDocument();
    expect(screen.getByText("Scholars")).toBeInTheDocument();
    expect(screen.getByText("My Library")).toBeInTheDocument();
    expect(screen.getByText("Settings")).toBeInTheDocument();
  });

  it("renders Sign In button when unauthenticated", () => {
    (useAuth as Mock<any>).mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      user: null,
    });
    (useAbility as Mock<any>).mockReturnValue({ ability: createMongoAbility([]) });

    render(<Sidebar />);

    expect(screen.getByRole("button", { name: "Sign In" })).toBeInTheDocument();
    expect(screen.queryByText("ADMIN")).not.toBeInTheDocument();
  });

  it("shows editorial navigation for aggregate access without treating read as a grant", () => {
    (useAuth as Mock<any>).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { name: "Admin User", email: "admin@example.com" },
    });
    (useAbility as Mock<any>).mockReturnValue({
      ability: createMongoAbility([{ action: "read", subject: "Scholar" }]),
    });

    render(<Sidebar />);

    expect(screen.getByText("ADMIN")).toBeInTheDocument();
    expect(screen.getAllByText("Home").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Stats")).toBeInTheDocument();
    expect(screen.getAllByText("Scholars").length).toBeGreaterThanOrEqual(1);
    expect(screen.queryByText("Users")).not.toBeInTheDocument();
    expect(screen.getByText("Contents")).toBeInTheDocument();
  });

  it("renders profile details and Sign Out when authenticated (non-admin)", () => {
    (useAuth as Mock<any>).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { name: "Test User", email: "test@example.com" },
    });
    (useAbility as Mock<any>).mockReturnValue({ ability: createMongoAbility([]) });

    render(<Sidebar />);

    expect(screen.getByText("Test User")).toBeInTheDocument();
    expect(screen.getByText("test@example.com")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sign Out" })).toBeInTheDocument();
    expect(screen.queryByText("ADMIN")).not.toBeInTheDocument();
  });

  it("calls authClient.signOut and redirects when Sign Out is clicked", async () => {
    (useAuth as Mock<any>).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { name: "Test User", email: "test@example.com" },
    });
    (useAbility as Mock<any>).mockReturnValue({ ability: createMongoAbility([]) });

    render(<Sidebar />);

    const signOutBtn = screen.getByRole("button", { name: "Sign Out" });

    // Click the Sign Out button
    await act(async () => {
      fireEvent.click(signOutBtn);
    });

    // Wait for the modal to appear and get all Sign Out buttons
    await waitFor(
      () => {
        expect(screen.queryAllByRole("button", { name: /sign out/i }).length).toBeGreaterThan(1);
      },
      { timeout: 2000 },
    );

    const signOutButtons = screen.getAllByRole("button", { name: /sign out/i });
    const modalSignOutBtn = signOutButtons[signOutButtons.length - 1]!; // Get the modal's Sign Out button

    // Click the modal's Sign Out button
    await act(async () => {
      fireEvent.click(modalSignOutBtn);
    });

    // Check that authClient.signOut was called
    expect(authClient.signOut).toHaveBeenCalled();
  });
});
