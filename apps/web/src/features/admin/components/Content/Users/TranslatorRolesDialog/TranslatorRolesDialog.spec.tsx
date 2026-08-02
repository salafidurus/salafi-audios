import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi, type Mock } from "bun:test";

import * as adminApi from "@/features/admin/api/admin.api";

import { TranslatorRolesDialog } from "./TranslatorRolesDialog";

vi.mock("@/features/admin/api/admin.api", () => ({
  fetchUserTranslatorRoles: vi.fn(),
  syncTranslatorRoles: vi.fn(),
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

describe("TranslatorRolesDialog", () => {
  let queryClient: QueryClient;
  let mockFetchUserTranslatorRoles: Mock<any>;
  let mockSyncTranslatorRoles: Mock<any>;
  let mockOnTranslatorRolesChange: Mock<any>;
  let mockOnClose: Mock<any>;

  beforeEach(() => {
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

    mockFetchUserTranslatorRoles = adminApi.fetchUserTranslatorRoles as Mock<any>;
    mockSyncTranslatorRoles = adminApi.syncTranslatorRoles as Mock<any>;
    mockOnTranslatorRolesChange = vi.fn();
    mockOnClose = vi.fn();

    mockFetchUserTranslatorRoles.mockResolvedValue({
      translatorRoles: [
        {
          id: "role-1",
          scholarId: null,
          scholarSlug: null,
          scholarName: null,
          locale: "ar",
          canPublish: false,
        },
      ],
    });
    mockSyncTranslatorRoles.mockResolvedValue({ success: true, message: "ok" });
  });

  const renderWithProviders = (component: React.ReactElement) => {
    return render(<QueryClientProvider client={queryClient}>{component}</QueryClientProvider>);
  };

  it("does not fetch translator roles when closed", () => {
    renderWithProviders(
      <TranslatorRolesDialog
        isOpen={false}
        onClose={mockOnClose}
        userId="user-123"
        onTranslatorRolesChange={mockOnTranslatorRolesChange}
      />,
    );

    expect(mockFetchUserTranslatorRoles).not.toHaveBeenCalled();
  });

  it("fetches and pre-fills the locale checkboxes for the 'all scholars' scope", async () => {
    renderWithProviders(
      <TranslatorRolesDialog
        isOpen={true}
        onClose={mockOnClose}
        userId="user-123"
        onTranslatorRolesChange={mockOnTranslatorRolesChange}
      />,
    );

    await waitFor(() => {
      expect(mockFetchUserTranslatorRoles).toHaveBeenCalledWith("user-123");
    });

    const arCheckbox = (await screen.findByRole("checkbox", {
      name: "AR",
    })) as HTMLInputElement;
    await waitFor(() => expect(arCheckbox.checked).toBe(true));

    const enCheckbox = screen.getByRole("checkbox", { name: "EN" }) as HTMLInputElement;
    expect(enCheckbox.checked).toBe(false);
  });

  it("syncs the selected locale set and publish flag for the current scope", async () => {
    renderWithProviders(
      <TranslatorRolesDialog
        isOpen={true}
        onClose={mockOnClose}
        userId="user-123"
        onTranslatorRolesChange={mockOnTranslatorRolesChange}
      />,
    );

    const arCheckbox = (await screen.findByRole("checkbox", {
      name: "AR",
    })) as HTMLInputElement;
    await waitFor(() => expect(arCheckbox.checked).toBe(true));

    fireEvent.click(screen.getByRole("checkbox", { name: "EN" }));

    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => {
      expect(mockSyncTranslatorRoles).toHaveBeenCalledWith(
        "user-123",
        null,
        expect.arrayContaining(["ar", "en"]),
        false,
      );
    });
    await waitFor(() => expect(mockOnTranslatorRolesChange).toHaveBeenCalled());
  });

  it("scopes the sync call to the selected scholar's slug when a specific scope is chosen", async () => {
    renderWithProviders(
      <TranslatorRolesDialog
        isOpen={true}
        onClose={mockOnClose}
        userId="user-123"
        onTranslatorRolesChange={mockOnTranslatorRolesChange}
      />,
    );

    await waitFor(() => expect(screen.getByText("All scholars")).toBeInTheDocument());

    fireEvent.change(screen.getByRole("combobox", { name: "Scope" }), {
      target: { value: "scholar-one" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => {
      expect(mockSyncTranslatorRoles).toHaveBeenCalledWith(
        "user-123",
        "scholar-one",
        expect.any(Array),
        expect.any(Boolean),
      );
    });
  });
});
