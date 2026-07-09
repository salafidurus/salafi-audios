import { vi, type Mock } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { SearchProcessingScreen } from "./search-processing.screen";
import { useSearchProcessing } from "@sd/domain-search";
import { routes } from "@sd/core-contracts";

const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

vi.mock("@sd/domain-search", () => ({
  useSearchProcessing: vi.fn(),
}));

const mockUseIsDesktop = vi.fn().mockReturnValue(true);
vi.mock("@/shared/hooks/use-responsive", () => ({
  useIsDesktop: () => mockUseIsDesktop(),
}));

describe("SearchProcessingScreen", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseIsDesktop.mockReturnValue(true);
  });

  it("navigates to series detail on series item click (desktop)", () => {
    (useSearchProcessing as Mock).mockReturnValue({
      query: "jurisprudence",
      setQuery: vi.fn(),
      filter: [],
      setFilter: vi.fn(),
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

    render(<SearchProcessingScreen searchKey="jurisprudence" />);

    // Click the search result item
    const item = screen.getByText("Test Series");
    fireEvent.click(item);

    expect(mockPush).toHaveBeenCalledWith(routes.series.detail("123"));
  });

  it("navigates to series detail on series item click (mobile)", () => {
    mockUseIsDesktop.mockReturnValue(false);
    (useSearchProcessing as Mock).mockReturnValue({
      query: "jurisprudence",
      setQuery: vi.fn(),
      filter: [],
      setFilter: vi.fn(),
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

    render(<SearchProcessingScreen searchKey="jurisprudence" />);

    // Click the search result item
    const item = screen.getByText("Test Series");
    fireEvent.click(item);

    expect(mockPush).toHaveBeenCalledWith(routes.series.detail("123"));
  });
});
