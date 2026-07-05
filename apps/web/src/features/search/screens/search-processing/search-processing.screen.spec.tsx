import { vi, type Mock } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { SearchProcessingDesktopScreen } from "./search-processing.screen.desktop";
import { SearchProcessingMobileScreen } from "./search-processing.screen.mobile";
import { useSearchProcessing } from "@sd/domain-search";
import { routes } from "@sd/core-contracts";

const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

vi.mock("@sd/domain-search", () => ({
  useSearchProcessing: vi.fn(),
}));

describe("SearchProcessingScreen", () => {
  beforeEach(() => {
    vi.clearAllMocks();
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

    render(<SearchProcessingDesktopScreen />);

    // Click the search result item
    const item = screen.getByText("Test Series");
    fireEvent.click(item);

    expect(mockPush).toHaveBeenCalledWith(routes.series.detail("123"));
  });

  it("navigates to series detail on series item click (mobile)", () => {
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

    render(<SearchProcessingMobileScreen />);

    // Click the search result item
    const item = screen.getByText("Test Series");
    fireEvent.click(item);

    expect(mockPush).toHaveBeenCalledWith(routes.series.detail("123"));
  });
});
