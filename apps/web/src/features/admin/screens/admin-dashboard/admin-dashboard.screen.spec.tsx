import { createMongoAbility } from "@casl/ability";
import { useApiQuery } from "@sd/core-contracts";
import { useAbility } from "@sd/domain-account";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi, type Mock } from "bun:test";

import { useAuth } from "@/core/auth/use-auth";

import { AdminDashboardScreen } from "./admin-dashboard.screen";

vi.mock("@sd/domain-account", () => ({
  useAbility: vi.fn(),
  hasAnyAdminAccess: (ability: any) => ability.rules.length > 0,
}));

vi.mock("@sd/core-contracts", () => ({
  queryKeys: { admin: { dashboard: vi.fn(() => ["admin", "dashboard"]) } },
  useApiQuery: vi.fn(),
}));

vi.mock("@/core/auth/use-auth", () => ({
  useAuth: vi.fn(),
}));

describe("AdminDashboardScreen", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useAuth as Mock<any>).mockReturnValue({ isAuthenticated: true });
    (useApiQuery as Mock<any>).mockReturnValue({
      isLoading: false,
      isError: false,
      data: {
        metrics: { scholars: 2, listings: 4, users: 1 },
        activity: [],
        pendingWork: [],
      },
    });
  });

  it("renders loading state when fetching access", () => {
    (useAbility as Mock<any>).mockReturnValue({
      ability: createMongoAbility([]),
      isLoading: true,
    });

    render(<AdminDashboardScreen />);
    expect(screen.getByText("Loading…")).toBeInTheDocument();
  });

  it("shows cards when user has only view-level access", () => {
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

  it("shows the relevant shortcut for an editorial capability", () => {
    (useAbility as Mock<any>).mockReturnValue({
      ability: createMongoAbility([{ action: "write", subject: "Listing" }]),
      isLoading: false,
    });

    render(<AdminDashboardScreen />);

    expect(screen.getByRole("link", { name: /contents/i })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /scholars/i })).not.toBeInTheDocument();
  });

  it("shows the content shortcut for a topic capability", () => {
    (useAbility as Mock<any>).mockReturnValue({
      ability: createMongoAbility([{ action: "write", subject: "Topic" }]),
      isLoading: false,
    });

    render(<AdminDashboardScreen />);

    expect(screen.getByRole("link", { name: /contents/i })).toBeInTheDocument();
  });

  it("renders sections based on user access", () => {
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

  it("renders the dashboard metrics without auxiliary activity panels", () => {
    (useAbility as Mock<any>).mockReturnValue({
      ability: createMongoAbility([{ action: "read", subject: "Listing" }]),
      isLoading: false,
    });
    (useApiQuery as Mock<any>).mockReturnValue({
      isLoading: false,
      isError: false,
      data: {
        metrics: { listings: 1 },
        activity: [
          {
            id: "l1",
            type: "listing",
            title: "Recent lesson",
            occurredAt: "2026-08-24",
            href: "/admin/contents?listing=l1",
          },
        ],
        pendingWork: [
          {
            id: "l2",
            title: "Needs review",
            scholarName: "Scholar",
            status: "review",
            updatedAt: "2026-08-24",
            href: "/admin/contents?listing=l2",
          },
        ],
      },
    });

    render(<AdminDashboardScreen />);

    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.queryByText("Needs review")).not.toBeInTheDocument();
    expect(screen.queryByText("Recent lesson")).not.toBeInTheDocument();
  });
});
