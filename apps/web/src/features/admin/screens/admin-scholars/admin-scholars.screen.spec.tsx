import { describe, it, expect, beforeEach, vi, type Mock } from "bun:test";
import React from "react";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AdminScholarsScreen } from "./admin-scholars.screen";
import { useAdminPermissions } from "@/features/admin/hooks/use-admin-permissions";

vi.mock("@/features/admin/hooks/use-admin-permissions", () => ({
  useAdminPermissions: vi.fn(),
}));
vi.mock("@sd/core-contracts", () => {
  // Import the real module to preserve all exports
  const actual = require("@sd/core-contracts");
  return { ...actual, useApiQuery: vi.fn() };
});
vi.mock("@/shared/hooks/use-responsive", () => ({
  useResponsive: () => ({ isMobile: false }),
  useIsDesktop: () => true,
}));
vi.mock("@/shared/components/InfiniteScrollList", () => ({
  InfiniteScrollList: () => <div data-testid="infinite-scroll-list" />,
}));

describe("AdminScholarsScreen", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
    (useAdminPermissions as Mock<any>).mockReturnValue({
      data: { permissions: ["SCHOLARS_VIEW"] },
    });
  });

  const renderWithProviders = (component: React.ReactElement) => {
    return render(<QueryClientProvider client={queryClient}>{component}</QueryClientProvider>);
  };

  it("hides Add Scholar button when user lacks SCHOLARS_CREATE", () => {
    (useAdminPermissions as Mock<any>).mockReturnValue({
      data: { permissions: ["SCHOLARS_VIEW"] },
    });

    renderWithProviders(<AdminScholarsScreen />);

    expect(screen.queryByText("Add Scholar")).not.toBeInTheDocument();
    expect(screen.queryByText("Add")).not.toBeInTheDocument();
  });

  it("shows Add Scholar button when user has SCHOLARS_CREATE", () => {
    (useAdminPermissions as Mock<any>).mockReturnValue({
      data: { permissions: ["SCHOLARS_CREATE"] },
    });

    renderWithProviders(<AdminScholarsScreen />);

    expect(screen.getByText("Add Scholar")).toBeInTheDocument();
  });
});
