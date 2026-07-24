import { describe, it, expect, beforeEach, vi, type Mock } from "bun:test";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PermissionsDialog } from "./PermissionsDialog";
import * as adminApi from "@/features/admin/api/admin.api";

vi.mock("@/features/admin/api/admin.api", () => ({
  fetchUserPermissions: vi.fn(),
  grantPermission: vi.fn(),
  revokePermission: vi.fn(),
}));
vi.mock("@/core/i18n/use-translation", () => ({
  useTranslation: () => ({
    t: (key: string, fallback: string) => fallback,
  }),
}));

describe("PermissionsDialog", () => {
  let queryClient: QueryClient;
  let mockFetchUserPermissions: Mock<any>;
  let mockGrantPermission: Mock<any>;
  let mockRevokePermission: Mock<any>;
  let mockOnPermissionsChange: Mock<any>;
  let mockOnClose: Mock<any>;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });

    mockFetchUserPermissions = adminApi.fetchUserPermissions as Mock<any>;
    mockGrantPermission = adminApi.grantPermission as Mock<any>;
    mockRevokePermission = adminApi.revokePermission as Mock<any>;
    mockOnPermissionsChange = vi.fn();
    mockOnClose = vi.fn();

    mockFetchUserPermissions.mockResolvedValue({
      permissions: [
        { permission: "SCHOLARS_VIEW" as const, createdAt: "2024-01-01" },
        { permission: "LISTINGS_VIEW" as const, createdAt: "2024-01-02" },
      ],
    });
    mockGrantPermission.mockResolvedValue(undefined);
    mockRevokePermission.mockResolvedValue(undefined);
  });

  const renderWithProviders = (component: React.ReactElement) => {
    return render(<QueryClientProvider client={queryClient}>{component}</QueryClientProvider>);
  };

  it("renders loading state initially", () => {
    renderWithProviders(
      <PermissionsDialog
        isOpen={true}
        onClose={mockOnClose}
        userId="user-123"
        onPermissionsChange={mockOnPermissionsChange}
      />,
    );

    expect(screen.getByText("Loading permissions…")).toBeInTheDocument();
  });

  it("fetches user permissions when opened", async () => {
    renderWithProviders(
      <PermissionsDialog
        isOpen={true}
        onClose={mockOnClose}
        userId="user-123"
        onPermissionsChange={mockOnPermissionsChange}
      />,
    );

    await waitFor(() => {
      expect(mockFetchUserPermissions).toHaveBeenCalledWith("user-123");
    });
  });

  it("does not fetch permissions when closed", () => {
    mockFetchUserPermissions.mockClear();
    renderWithProviders(
      <PermissionsDialog
        isOpen={false}
        onClose={mockOnClose}
        userId="user-123"
        onPermissionsChange={mockOnPermissionsChange}
      />,
    );

    expect(mockFetchUserPermissions).not.toHaveBeenCalled();
  });

  it("invalidates with base prefix key after successful permission update", async () => {
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    renderWithProviders(
      <PermissionsDialog
        isOpen={true}
        onClose={mockOnClose}
        userId="user-123"
        onPermissionsChange={mockOnPermissionsChange}
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

  it("calls onPermissionsChange callback after successful update", async () => {
    renderWithProviders(
      <PermissionsDialog
        isOpen={true}
        onClose={mockOnClose}
        userId="user-123"
        onPermissionsChange={mockOnPermissionsChange}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText("Done")).toBeInTheDocument();
    });

    const doneButton = screen.getByRole("button", { name: "Done" });
    fireEvent.click(doneButton);

    await waitFor(() => {
      expect(mockOnPermissionsChange).toHaveBeenCalled();
    });
  });
});
