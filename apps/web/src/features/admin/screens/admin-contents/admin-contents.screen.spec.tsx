import { createMongoAbility } from "@casl/ability";
import { useApiQuery } from "@sd/core-contracts";
import { useAbility } from "@sd/domain-account";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi, type Mock } from "bun:test";
import { usePathname } from "next/navigation";
import React from "react";

import { AdminContentsScreen } from "./admin-contents.screen";

vi.mock("@sd/domain-account", () => ({
  useAbility: vi.fn(),
}));
vi.mock("@sd/core-contracts", () => {
  // Import the real module to preserve all exports
  const actual = require("@sd/core-contracts");
  return {
    ...actual,
    useApiQuery: vi.fn(),
    httpClient: vi.fn(),
  };
});
vi.mock("next/navigation", () => ({ usePathname: vi.fn() }));
vi.mock("@/shared/hooks/use-responsive", () => ({
  useResponsive: () => ({ isMobile: false }),
}));
vi.mock("@/shared/components/InfiniteScrollList", () => ({
  InfiniteScrollList: () => <div data-testid="infinite-scroll-list" />,
}));

describe("AdminContentsScreen — topics tab access gates", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
    (usePathname as Mock<any>).mockReturnValue("/admin/contents");
    (useApiQuery as Mock<any>).mockReturnValue({ data: [], refetch: vi.fn() });
    (useAbility as Mock<any>).mockReturnValue({
      ability: createMongoAbility([{ action: "manage", subject: "all" }]),
    });
  });

  const renderWithProviders = (component: React.ReactElement) => {
    return render(<QueryClientProvider client={queryClient}>{component}</QueryClientProvider>);
  };

  it("hides Add Topic button when user cannot create topics", async () => {
    (useAbility as Mock<any>).mockReturnValue({
      ability: createMongoAbility([{ action: "read", subject: "Listing" }]),
    });

    renderWithProviders(<AdminContentsScreen />);

    // Switch to Topics tab
    await act(async () => fireEvent.mouseDown(screen.getByRole("tab", { name: "Topics" })));

    expect(screen.queryByText("Add Topic")).not.toBeInTheDocument();
  });

  it("shows Add Topic button when user can create topics", async () => {
    (useAbility as Mock<any>).mockReturnValue({
      ability: createMongoAbility([{ action: "create", subject: "Topic" }]),
    });

    renderWithProviders(<AdminContentsScreen />);

    // Switch to Topics tab
    await act(async () => fireEvent.mouseDown(screen.getByRole("tab", { name: "Topics" })));

    expect(screen.getByText("Add Topic")).toBeInTheDocument();
  });

  it("exposes Content sections as accessible tabs", async () => {
    renderWithProviders(<AdminContentsScreen />);

    expect(screen.getByRole("tablist", { name: "Content sections" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Listings" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tabpanel", { name: "Listings" })).toBeInTheDocument();

    await act(async () => fireEvent.mouseDown(screen.getByRole("tab", { name: "Topics" })));

    expect(screen.getByRole("tab", { name: "Topics" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tabpanel", { name: "Topics" })).toBeInTheDocument();
  });

  it("shows a denied state for Promotions when the user cannot write listings", async () => {
    (useAbility as Mock<any>).mockReturnValue({
      ability: createMongoAbility([{ action: "read", subject: "Listing" }]),
    });

    renderWithProviders(<AdminContentsScreen />);
    await act(async () => fireEvent.mouseDown(screen.getByRole("tab", { name: "Promotions" })));

    expect(screen.getByRole("heading", { name: "Access Denied" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Save Curation" })).not.toBeInTheDocument();
  });

  it("uses the correct query function to fetch topics", async () => {
    const { httpClient, endpoints, queryKeys } = require("@sd/core-contracts");
    (httpClient as Mock<any>).mockResolvedValue([]);

    renderWithProviders(<AdminContentsScreen />);

    // Find the call where the query key is queryKeys.admin.topics.all()
    const call = (useApiQuery as Mock<any>).mock.calls.find(
      (c) => JSON.stringify(c[0]) === JSON.stringify(queryKeys.admin.topics.all()),
    );

    expect(call).toBeDefined();
    if (!call) {
      throw new Error("useApiQuery was not called with admin topics list key");
    }
    const queryFn = call[1] as () => Promise<any>;
    expect(queryFn).toBeTypeOf("function");

    // Execute queryFn
    await queryFn();

    // Verify it called httpClient with correct url
    expect(httpClient).toHaveBeenCalledWith(
      expect.objectContaining({
        url: endpoints.admin.topics.list,
        method: "GET",
      }),
    );
  });
});
