import { vi, type Mock } from "vitest";
import React from "react";
import { render } from "@testing-library/react";
import HomePage from "./page";
import { SearchHomeScreen } from "@/features/search/screens/search-home/search-home.screen";
import { useRouter } from "next/navigation";
import { routes } from "@sd/core-contracts";

vi.mock("next/navigation", () => {
  const push = vi.fn<any>();
  return {
    useRouter: () => ({ push }),
  };
});

vi.mock("@/features/search/screens/search-home/search-home.screen", () => ({
  SearchHomeScreen: vi.fn<() => JSX.Element>(() => <div data-testid="search-home" />),
}));

describe("HomePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("passes navigation callbacks to SearchHomeScreen", () => {
    render(<HomePage />);

    const mockSearchHomeScreen = SearchHomeScreen as unknown as Mock;
    expect(mockSearchHomeScreen).toHaveBeenCalled();

    const calls = mockSearchHomeScreen.mock.calls;
    expect(calls.length).toBeGreaterThan(0);
    const props = calls[0]?.[0];
    if (!props) {
      throw new Error("No props passed to SearchHomeScreen");
    }
    const { push } = useRouter();

    props.onOpenSearch();
    expect(push).toHaveBeenCalledWith(routes.search);

    props.onSelectCategory("tauheed");
    expect(push).toHaveBeenCalledWith(`${routes.search}?searchKey=tauheed`);

    props.onSelectScholar("ibn-baz");
    expect(push).toHaveBeenCalledWith(routes.scholars.detail("ibn-baz"));

    props.onSelectSuggestion("series-id", "series");
    expect(push).toHaveBeenCalledWith(routes.series.detail("series-id"));

    props.onSelectSuggestion("collection-id", "collection");
    expect(push).toHaveBeenCalledWith(routes.collections.detail("collection-id"));

    props.onSelectSuggestion("single-id", "single");
    expect(push).toHaveBeenCalledWith(routes.lectures.detail("single-id"));

    props.onContinueListening("lecture-id");
    expect(push).toHaveBeenCalledWith(routes.lectures.detail("lecture-id"));
  });
});
