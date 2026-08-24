import { createMongoAbility } from "@casl/ability";
import { useAbility, useInfiniteAdminUsers } from "@sd/domain-account";
import { useInfiniteAdminListings, useInfiniteAdminScholars } from "@sd/domain-content";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi, type Mock } from "bun:test";

import { useAuth } from "@/core/auth/use-auth";

import { AdminStatsScreen } from "./admin-stats.screen";

vi.mock("@sd/domain-account", () => ({
  useAbility: vi.fn(),
  useInfiniteAdminUsers: vi.fn(),
}));

vi.mock("@sd/domain-content", () => ({
  useInfiniteAdminListings: vi.fn(),
  useInfiniteAdminScholars: vi.fn(),
}));

vi.mock("@/core/auth/use-auth", () => ({ useAuth: vi.fn() }));

describe("AdminStatsScreen", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useAuth as Mock<any>).mockReturnValue({ isAuthenticated: true });
    (useAbility as Mock<any>).mockReturnValue({
      ability: createMongoAbility([]),
      isLoading: false,
    });
    (useInfiniteAdminListings as Mock<any>).mockReturnValue({ data: undefined, isLoading: false });
    (useInfiniteAdminScholars as Mock<any>).mockReturnValue({ data: undefined, isLoading: false });
    (useInfiniteAdminUsers as Mock<any>).mockReturnValue({ data: undefined, isLoading: false });
  });

  it("only requests and presents metrics for capabilities the user has", () => {
    (useInfiniteAdminListings as Mock<any>).mockReturnValue({
      data: {
        pages: [
          {
            items: [
              {
                id: "listing-1",
                title: "First lesson",
                scholarName: "Scholar",
                format: "single",
                status: "published",
                createdAt: "2026-01-01",
              },
            ],
          },
        ],
      },
      isLoading: false,
    });
    (useInfiniteAdminScholars as Mock<any>).mockReturnValue({
      data: {
        pages: [
          { items: [{ id: "scholar-1", name: "Scholar", slug: "scholar", lectureCount: 12 }] },
        ],
      },
      isLoading: false,
    });
    (useInfiniteAdminUsers as Mock<any>).mockReturnValue({ data: undefined, isLoading: false });

    const ability = createMongoAbility([
      { action: "read", subject: "Listing" },
      { action: "read", subject: "Scholar" },
    ]);
    (useAbility as Mock<any>).mockReturnValue({ ability, isLoading: false });

    render(<AdminStatsScreen />);

    expect(screen.getByText("First lesson")).toBeInTheDocument();
    expect(screen.getAllByTestId("admin-stat-value").map((value) => value.textContent)).toEqual([
      "1",
      "1",
    ]);
    expect(useInfiniteAdminUsers).toHaveBeenCalledWith(expect.objectContaining({ enabled: false }));
  });

  it("explains unavailable data when no authorized metrics exist", () => {
    render(<AdminStatsScreen />);

    expect(screen.getByText(/no authorized statistics are available/i)).toBeInTheDocument();
  });
});
