import { describe, it, expect, vi } from "bun:test";
import { render, screen } from "@testing-library/react";
import { ExploreScholarScreen } from "./explore-scholar.screen";

vi.mock("@sd/domain-content", () => ({
  useInfiniteScholarsList: vi.fn(() => ({
    data: { pages: [] },
    isFetching: false,
    isError: false,
    hasNextPage: false,
    fetchNextPage: vi.fn(),
    refetch: vi.fn(),
  })),
}));
vi.mock("@/core/i18n/use-translation", () => ({
  useTranslation: () => ({
    t: (key: string, defaultVal: string) => defaultVal,
  }),
}));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));
vi.mock("@/shared/hooks/use-responsive", () => ({
  useIsDesktop: () => true,
}));

describe("ExploreScholarScreen", () => {
  it("renders the scholars screen with title", () => {
    render(<ExploreScholarScreen />);

    expect(screen.getByText("Scholars")).toBeInTheDocument();
  });

  it("renders search bar", () => {
    render(<ExploreScholarScreen />);

    const searchInput = screen.getByPlaceholderText(/search scholars/i);
    expect(searchInput).toBeInTheDocument();
  });
});
