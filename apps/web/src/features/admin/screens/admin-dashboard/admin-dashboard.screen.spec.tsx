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
    expect(screen.getByText("Loading…")).toBeInTheDocument();
  });

  it("renders sections based on user permissions", () => {
    (useAdminPermissions as Mock).mockReturnValue({
      data: {
        permissions: ["manage:scholars", "manage:content", "manage:admin", "manage:livestreams"],
      },
      isFetching: false,
    });

    render(<AdminDashboardScreen />);

    // Check Scholars section
    const scholarsLink = screen.getByRole("link", { name: /scholars/i });
    expect(scholarsLink).toBeInTheDocument();
    expect(scholarsLink).toHaveAttribute("href", "/admin/scholars");

    // Check Contents section (uses manage:content, consolidated Topics/Lectures)
    const contentsLink = screen.getByRole("link", { name: /contents/i });
    expect(contentsLink).toBeInTheDocument();
    expect(contentsLink).toHaveAttribute("href", "/admin/contents");

    // Check Users section (uses manage:admin, consolidated permissions)
    const usersLink = screen.getByRole("link", { name: /users/i });
    expect(usersLink).toBeInTheDocument();
    expect(usersLink).toHaveAttribute("href", "/admin/users");

    // Check Livestreams section
    const livestreamsLink = screen.getByRole("link", { name: /livestreams/i });
    expect(livestreamsLink).toBeInTheDocument();
    expect(livestreamsLink).toHaveAttribute("href", "/admin/livestreams");
  });
});
