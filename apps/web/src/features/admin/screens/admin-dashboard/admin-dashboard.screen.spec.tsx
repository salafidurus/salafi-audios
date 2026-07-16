import { vi, type Mock } from "vitest";
import { render, screen } from "@testing-library/react";
import { AdminDashboardScreen } from "./admin-dashboard.screen";
import { useAdminPermissions } from "@/features/admin/hooks/use-admin-permissions";

vi.mock("@/features/admin/hooks/use-admin-permissions", () => ({
  useAdminPermissions: vi.fn<any>(),
}));

describe("AdminDashboardScreen", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders loading state when fetching permissions", () => {
    (useAdminPermissions as Mock).mockReturnValue({
      data: undefined,
      isFetching: true,
    });

    render(<AdminDashboardScreen />);
    expect(screen.getByText("Loading…")).toBeInTheDocument();
  });

  it("shows cards when user has only view-level permissions", () => {
    (useAdminPermissions as Mock).mockReturnValue({
      data: {
        permissions: ["SCHOLARS_VIEW", "LISTINGS_VIEW", "USERS_VIEW", "LIVE_VIEW"],
      },
      isFetching: false,
    });

    render(<AdminDashboardScreen />);

    expect(screen.getByRole("link", { name: /scholars/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /contents/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /users/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /livestreams/i })).toBeInTheDocument();
  });

  it("renders sections based on user permissions", () => {
    (useAdminPermissions as Mock).mockReturnValue({
      data: {
        permissions: ["SCHOLARS_VIEW", "LISTINGS_VIEW", "USERS_VIEW", "LIVE_VIEW"],
      },
      isFetching: false,
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

    // Check Livestreams section
    const livestreamsLink = screen.getByRole("link", { name: /livestreams/i });
    expect(livestreamsLink).toBeInTheDocument();
    expect(livestreamsLink).toHaveAttribute("href", "/admin/live");
  });
});
