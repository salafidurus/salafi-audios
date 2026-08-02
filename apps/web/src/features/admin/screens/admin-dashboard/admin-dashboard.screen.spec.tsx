import { createMongoAbility } from "@casl/ability";
import { useAbility } from "@sd/domain-account";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi, type Mock } from "bun:test";

import { useAuth } from "@/core/auth/use-auth";

import { AdminDashboardScreen } from "./admin-dashboard.screen";

vi.mock("@sd/domain-account", () => ({
  useAbility: vi.fn(),
}));

vi.mock("@/core/auth/use-auth", () => ({
  useAuth: vi.fn(),
}));

describe("AdminDashboardScreen", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useAuth as Mock<any>).mockReturnValue({ isAuthenticated: true });
  });

  it("renders loading state when fetching permissions", () => {
    (useAbility as Mock<any>).mockReturnValue({
      ability: createMongoAbility([]),
      isLoading: true,
    });

    render(<AdminDashboardScreen />);
    expect(screen.getByText("Loading…")).toBeInTheDocument();
  });

  it("shows cards when user has only view-level permissions", () => {
    (useAbility as Mock<any>).mockReturnValue({
      ability: createMongoAbility([
        { action: "read", subject: "Scholar" },
        { action: "read", subject: "Listing" },
        { action: "read", subject: "User" },
      ]),
      isLoading: false,
    });

    render(<AdminDashboardScreen />);

    expect(screen.getByRole("link", { name: /scholars/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /contents/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /users/i })).toBeInTheDocument();
  });

  it("renders sections based on user permissions", () => {
    (useAbility as Mock<any>).mockReturnValue({
      ability: createMongoAbility([
        { action: "read", subject: "Scholar" },
        { action: "read", subject: "Listing" },
        { action: "read", subject: "User" },
      ]),
      isLoading: false,
    });

    render(<AdminDashboardScreen />);

    // Check Scholars section
    const scholarsLink = screen.getByRole("link", { name: /scholars/i });
    expect(scholarsLink).toBeInTheDocument();
    expect(scholarsLink).toHaveAttribute("href", "/admin/scholars");

    // Check Contents section (consolidated Topics/Lectures)
    const contentsLink = screen.getByRole("link", { name: /contents/i });
    expect(contentsLink).toBeInTheDocument();
    expect(contentsLink).toHaveAttribute("href", "/admin/contents");

    // Check Users section
    const usersLink = screen.getByRole("link", { name: /users/i });
    expect(usersLink).toBeInTheDocument();
    expect(usersLink).toHaveAttribute("href", "/admin/users");
  });

  it("hides sections the user has no read capability for", () => {
    (useAbility as Mock<any>).mockReturnValue({
      ability: createMongoAbility([{ action: "read", subject: "Scholar" }]),
      isLoading: false,
    });

    render(<AdminDashboardScreen />);

    expect(screen.getByRole("link", { name: /scholars/i })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /contents/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /users/i })).not.toBeInTheDocument();
  });
});
