import { vi, type Mock } from "vitest";
import { render, screen } from "@testing-library/react";
import { AdminDashboardScreen } from "./admin-dashboard.screen";
import { useAdminPermissions } from "@/features/admin/hooks/use-admin-permissions";

vi.mock("@/features/admin/hooks/use-admin-permissions", () => ({
  useAdminPermissions: vi.fn(),
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
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("renders sections based on user permissions", () => {
    (useAdminPermissions as Mock).mockReturnValue({
      data: {
        permissions: ["manage:scholars", "manage:content", "manage:livestreams"],
      },
      isFetching: false,
    });

    render(<AdminDashboardScreen />);

    // Check Scholars section
    const scholarsLink = screen.getByRole("link", { name: /scholars/i });
    expect(scholarsLink).toBeInTheDocument();
    expect(scholarsLink).toHaveAttribute("href", "/admin/scholars");

    // Check Lectures section (uses manage:content)
    const lecturesLink = screen.getByRole("link", { name: /lectures/i });
    expect(lecturesLink).toBeInTheDocument();
    expect(lecturesLink).toHaveAttribute("href", "/admin/lectures");

    // Check Livestreams section (links to /admin/live)
    const livestreamsLink = screen.getByRole("link", { name: /livestreams/i });
    expect(livestreamsLink).toBeInTheDocument();
    expect(livestreamsLink).toHaveAttribute("href", "/admin/live");
  });
});
