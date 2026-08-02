import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi, type Mock } from "bun:test";

import * as adminApi from "@/features/admin/api/admin.api";

import { ScholarRolesDialog } from "./ScholarRolesDialog";

vi.mock("@/features/admin/api/admin.api", () => ({
  fetchUserScholarRoles: vi.fn(),
  grantScholarRole: vi.fn(),
  revokeScholarRole: vi.fn(),
}));
vi.mock("@/core/i18n/use-translation", () => ({
  useTranslation: () => ({
    t: (key: string, fallback: string) => fallback,
  }),
}));
vi.mock("@sd/core-contracts", () => {
  const actual = require("@sd/core-contracts");
  return {
    ...actual,
    useApiQuery: vi.fn(() => ({
      data: {
        items: [
          { id: "scholar-1", name: "Scholar One", slug: "scholar-one" },
          { id: "scholar-2", name: "Scholar Two", slug: "scholar-two" },
        ],
      },
      isFetching: false,
    })),
  };
});

describe("ScholarRolesDialog", () => {
  let queryClient: QueryClient;
  let mockFetchUserScholarRoles: Mock<any>;
  let mockGrantScholarRole: Mock<any>;
  let mockRevokeScholarRole: Mock<any>;
  let mockOnScholarRolesChange: Mock<any>;
  let mockOnClose: Mock<any>;

  beforeEach(() => {
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

    mockFetchUserScholarRoles = adminApi.fetchUserScholarRoles as Mock<any>;
    mockGrantScholarRole = adminApi.grantScholarRole as Mock<any>;
    mockRevokeScholarRole = adminApi.revokeScholarRole as Mock<any>;
    mockOnScholarRolesChange = vi.fn();
    mockOnClose = vi.fn();

    mockFetchUserScholarRoles.mockResolvedValue({
      scholarRoles: [
        {
          id: "role-1",
          scholarId: "scholar-1",
          scholarSlug: "scholar-one",
          scholarName: "Scholar One",
          permissionType: "OWN_CONTENT",
        },
      ],
    });
    mockGrantScholarRole.mockResolvedValue({ success: true, message: "ok" });
    mockRevokeScholarRole.mockResolvedValue({ success: true, message: "ok" });
  });

  const renderWithProviders = (component: React.ReactElement) => {
    return render(<QueryClientProvider client={queryClient}>{component}</QueryClientProvider>);
  };

  it("does not fetch scholar roles when closed", () => {
    renderWithProviders(
      <ScholarRolesDialog
        isOpen={false}
        onClose={mockOnClose}
        userId="user-123"
        onScholarRolesChange={mockOnScholarRolesChange}
      />,
    );

    expect(mockFetchUserScholarRoles).not.toHaveBeenCalled();
  });

  it("fetches and lists the user's current scholar roles when opened", async () => {
    renderWithProviders(
      <ScholarRolesDialog
        isOpen={true}
        onClose={mockOnClose}
        userId="user-123"
        onScholarRolesChange={mockOnScholarRolesChange}
      />,
    );

    await waitFor(() => {
      expect(mockFetchUserScholarRoles).toHaveBeenCalledWith("user-123");
    });
    expect(await screen.findByText("OWN_CONTENT")).toBeInTheDocument();
    expect(screen.getAllByText("Scholar One").length).toBeGreaterThan(0);
  });

  it("grants a scholar role for the selected scholar and permission type", async () => {
    renderWithProviders(
      <ScholarRolesDialog
        isOpen={true}
        onClose={mockOnClose}
        userId="user-123"
        onScholarRolesChange={mockOnScholarRolesChange}
      />,
    );

    await waitFor(() => expect(screen.getByText("OWN_CONTENT")).toBeInTheDocument());

    fireEvent.click(screen.getByRole("button", { name: "Add" }));

    await waitFor(() => {
      expect(mockGrantScholarRole).toHaveBeenCalledWith("user-123", "scholar-one", "OWN_CONTENT");
    });
    await waitFor(() => expect(mockOnScholarRolesChange).toHaveBeenCalled());
  });

  it("revokes a scholar role when Revoke is clicked", async () => {
    renderWithProviders(
      <ScholarRolesDialog
        isOpen={true}
        onClose={mockOnClose}
        userId="user-123"
        onScholarRolesChange={mockOnScholarRolesChange}
      />,
    );

    const revokeButton = await screen.findByRole("button", { name: "Revoke" });
    fireEvent.click(revokeButton);

    await waitFor(() => {
      expect(mockRevokeScholarRole).toHaveBeenCalledWith("user-123", "scholar-one", "OWN_CONTENT");
    });
    await waitFor(() => expect(mockOnScholarRolesChange).toHaveBeenCalled());
  });

  it("shows an empty state when the user has no scholar roles", async () => {
    mockFetchUserScholarRoles.mockResolvedValue({ scholarRoles: [] });

    renderWithProviders(
      <ScholarRolesDialog
        isOpen={true}
        onClose={mockOnClose}
        userId="user-123"
        onScholarRolesChange={mockOnScholarRolesChange}
      />,
    );

    expect(await screen.findByText("No scholar-scoped access granted yet.")).toBeInTheDocument();
  });
});
