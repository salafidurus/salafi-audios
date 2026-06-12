import React from "react";
import renderer, { act } from "react-test-renderer";
import { AdminScholarsScreen } from "./admin-scholars.screen";
import { useApiQuery } from "@sd/core-contracts";

jest.mock("@sd/core-contracts", () => ({
  useApiQuery: jest.fn(),
  httpClient: jest.fn(),
  endpoints: { scholars: { list: "/scholars" } },
}));

jest.mock("@shopify/flash-list", () => {
  const { FlatList } = jest.requireActual<typeof import("react-native")>("react-native");
  return {
    FlashList: FlatList,
  };
});

const mockUseApiQuery = useApiQuery as jest.Mock;

describe("AdminScholarsScreen", () => {
  it("renders a loading indicator when loading", () => {
    mockUseApiQuery.mockReturnValue({
      data: null,
      isLoading: true,
    });

    let tree: ReturnType<typeof renderer.create>;
    act(() => {
      tree = renderer.create(<AdminScholarsScreen onNavigateToScholar={() => {}} />);
    });
    expect(JSON.stringify(tree!.toJSON())).toContain("Loading…");
  });

  it("renders the list of scholars when loaded", () => {
    mockUseApiQuery.mockReturnValue({
      data: [
        { id: "s1", name: "Scholar One", slug: "scholar-one" },
        { id: "s2", name: "Scholar Two", slug: "scholar-two" },
      ],
      isLoading: false,
    });

    let tree: ReturnType<typeof renderer.create>;
    act(() => {
      tree = renderer.create(<AdminScholarsScreen onNavigateToScholar={() => {}} />);
    });
    const rendered = JSON.stringify(tree!.toJSON());
    expect(rendered).toContain("Scholars");
    expect(rendered).toContain("Scholar One");
    expect(rendered).toContain("scholar-one");
    expect(rendered).toContain("Scholar Two");
    expect(rendered).toContain("scholar-two");
  });
});
