import { describe, it, expect, beforeEach, vi, type Mock } from "bun:test";
import React from "react";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AdminContentsScreen } from "./admin-contents.screen";
import { useAdminPermissions } from "@sd/domain-permissions";
import { useApiQuery } from "@sd/core-contracts";
import { usePathname } from "next/navigation";

vi.mock("@sd/domain-permissions", () => ({
  useAdminPermissions: vi.fn(),
}));
vi.mock("@sd/core-contracts", () => {
  // Import the real module to preserve all exports
  const actual = require("@sd/core-contracts");
  return { ...actual, useApiQuery: vi.fn() };
});
vi.mock("next/navigation", () => ({ usePathname: vi.fn() }));
vi.mock("@/shared/hooks/use-responsive", () => ({
  useResponsive: () => ({ isMobile: false }),
}));
vi.mock("@/shared/components/InfiniteScrollList", () => ({
  InfiniteScrollList: () => <div data-testid="infinite-scroll-list" />,
}));

describe("AdminContentsScreen — topics tab permission gates", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
    (usePathname as Mock<any>).mockReturnValue("/admin/contents");
    (useApiQuery as Mock<any>).mockReturnValue({ data: [], refetch: vi.fn() });
  });

  const renderWithProviders = (component: React.ReactElement) => {
    return render(<QueryClientProvider client={queryClient}>{component}</QueryClientProvider>);
  };

  it("hides Add Topic button when user lacks TOPICS_CREATE", () => {
    (useAdminPermissions as Mock<any>).mockReturnValue({
      data: { permissions: ["LISTINGS_VIEW"] },
    });

    renderWithProviders(<AdminContentsScreen />);

    expect(screen.queryByText("Add Topic")).not.toBeInTheDocument();
  });

  it("shows Add Topic button when user has TOPICS_CREATE", () => {
    (useAdminPermissions as Mock<any>).mockReturnValue({
      data: { permissions: ["TOPICS_CREATE"] },
    });

    renderWithProviders(<AdminContentsScreen />);

    expect(screen.getByText("Add Topic")).toBeInTheDocument();
  });
});
