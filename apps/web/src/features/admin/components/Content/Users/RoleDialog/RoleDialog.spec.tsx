import { describe, it, expect, beforeEach, vi, type Mock } from "bun:test";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RoleDialog } from "./RoleDialog";
import * as adminApi from "@/features/admin/api/admin.api";

vi.mock("@/features/admin/api/admin.api", () => ({
  fetchUserRoles: vi.fn(),
  grantRole: vi.fn(),
  revokeRole: vi.fn(),
}));
vi.mock("@/core/i18n/use-translation", () => ({
  useTranslation: () => ({
    t: (key: string, fallback: string) => fallback,
  }),
}));

describe("RoleDialog", () => {
  let queryClient: QueryClient;
  let mockFetchUserRoles: Mock<any>;
  let mockGrantRole: Mock<any>;
  let mockRevokeRole: Mock<any>;
  let mockOnRolesChange: Mock<any>;
  let mockOnClose: Mock<any>;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });

    mockFetchUserRoles = adminApi.fetchUserRoles as Mock<any>;
    mockGrantRole = adminApi.grantRole as Mock<any>;
    mockRevokeRole = adminApi.revokeRole as Mock<any>;
    mockOnRolesChange = vi.fn();
    mockOnClose = vi.fn();

    mockFetchUserRoles.mockResolvedValue({
      roles: [
        { role: "admin" as const, createdAt: "2024-01-01" },
        { role: "moderator" as const, createdAt: "2024-01-02" },
      ],
    });
    mockGrantRole.mockResolvedValue(undefined);
    mockRevokeRole.mockResolvedValue(undefined);
  });

  const renderWithProviders = (component: React.ReactElement) => {
    return render(<QueryClientProvider client={queryClient}>{component}</QueryClientProvider>);
  };

  it("renders loading state initially", () => {
    renderWithProviders(
      <RoleDialog
        isOpen={true}
        onClose={mockOnClose}
        userId="user-123"
        onRolesChange={mockOnRolesChange}
      />,
    );

    expect(screen.getByText("Loading roles…")).toBeInTheDocument();
  });

  it("fetches user roles when opened", async () => {
    renderWithProviders(
      <RoleDialog
        isOpen={true}
        onClose={mockOnClose}
        userId="user-123"
        onRolesChange={mockOnRolesChange}
      />,
    );

    await waitFor(() => {
      expect(mockFetchUserRoles).toHaveBeenCalledWith("user-123");
    });
  });

  it("does not fetch roles when closed", () => {
    mockFetchUserRoles.mockClear();
    renderWithProviders(
      <RoleDialog
        isOpen={false}
        onClose={mockOnClose}
        userId="user-123"
        onRolesChange={mockOnRolesChange}
      />,
    );

    expect(mockFetchUserRoles).not.toHaveBeenCalled();
  });

  it("invalidates with base prefix key after successful role update", async () => {
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    renderWithProviders(
      <RoleDialog
        isOpen={true}
        onClose={mockOnClose}
        userId="user-123"
        onRolesChange={mockOnRolesChange}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText("Done")).toBeInTheDocument();
    });

    const doneButton = screen.getByRole("button", { name: "Done" });
    fireEvent.click(doneButton);

    await waitFor(() => {
      expect(invalidateSpy).toHaveBeenCalled();
    });

    const callArgs = invalidateSpy.mock.calls[0]?.[0];
    expect(callArgs?.queryKey).toEqual(["admin", "users"]);
  });

  it("calls onRolesChange callback after successful update", async () => {
    renderWithProviders(
      <RoleDialog
        isOpen={true}
        onClose={mockOnClose}
        userId="user-123"
        onRolesChange={mockOnRolesChange}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText("Done")).toBeInTheDocument();
    });

    const doneButton = screen.getByRole("button", { name: "Done" });
    fireEvent.click(doneButton);

    await waitFor(() => {
      expect(mockOnRolesChange).toHaveBeenCalled();
    });
  });
});
