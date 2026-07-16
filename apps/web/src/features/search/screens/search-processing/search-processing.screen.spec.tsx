import { vi, type Mock } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SearchProcessingScreen } from "./search-processing.screen";
import { useSearchProcessing } from "@sd/domain-search";
import { routes } from "@sd/core-contracts";

const mockPush = vi.fn<any>();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

vi.mock("@sd/domain-search", () => ({
  useSearchProcessing: vi.fn<any>(),
}));

const mockUseIsDesktop = vi.fn<any>().mockReturnValue(true);
vi.mock("@/shared/hooks/use-responsive", () => ({
  useIsDesktop: () => mockUseIsDesktop(),
  useResponsive: () => ({ isDesktop: mockUseIsDesktop() }),
}));

describe("SearchProcessingScreen", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseIsDesktop.mockReturnValue(true);
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
  });

  const renderWithProviders = (component: React.ReactElement) => {
    return render(<QueryClientProvider client={queryClient}>{component}</QueryClientProvider>);
  };

  it("navigates to series detail on series item click (desktop)", () => {
    (useSearchProcessing as Mock).mockReturnValue({
      query: "jurisprudence",
      setQuery: vi.fn<any>(),
      filter: [],
      setFilter: vi.fn<any>(),
      topics: [],
      items: [
        {
          id: "series:123",
          title: "Test Series",
          scholarName: "Ibn Uthaymeen",
          lectureCount: 10,
          durationSeconds: 3600,
        },
      ],
      isFetching: false,
      shouldSearch: true,
      errorMessage: undefined,
    });

    renderWithProviders(<SearchProcessingScreen searchKey="jurisprudence" />);

    // Click the search result item
    const item = screen.getByText("Test Series");
    fireEvent.click(item);

    expect(mockPush).toHaveBeenCalledWith(routes.series.detail("123"));
  });

  it("navigates to series detail on series item click (mobile)", () => {
    mockUseIsDesktop.mockReturnValue(false);
    (useSearchProcessing as Mock).mockReturnValue({
      query: "jurisprudence",
      setQuery: vi.fn<any>(),
      filter: [],
      setFilter: vi.fn<any>(),
      topics: [],
      items: [
        {
          id: "series:123",
          title: "Test Series",
          scholarName: "Ibn Uthaymeen",
          lectureCount: 10,
          durationSeconds: 3600,
        },
      ],
      isFetching: false,
      shouldSearch: true,
      errorMessage: undefined,
    });

    renderWithProviders(<SearchProcessingScreen searchKey="jurisprudence" />);

    // Click the search result item
    const item = screen.getByText("Test Series");
    fireEvent.click(item);

    expect(mockPush).toHaveBeenCalledWith(routes.series.detail("123"));
  });
});
