import React from "react";
import { render, screen } from "@testing-library/react-native";
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
  it("renders a loading indicator when loading", async () => {
    mockUseApiQuery.mockReturnValue({
      data: null,
      isLoading: true,
    });

    await render(<AdminScholarsScreen onNavigateToScholar={() => {}} />);
    expect(screen.getByText("Loading…")).toBeTruthy();
  });

  it("renders the list of scholars when loaded", async () => {
    mockUseApiQuery.mockReturnValue({
      data: [
        { id: "s1", name: "Scholar One", slug: "scholar-one" },
        { id: "s2", name: "Scholar Two", slug: "scholar-two" },
      ],
      isLoading: false,
    });

    await render(<AdminScholarsScreen onNavigateToScholar={() => {}} />);
    expect(screen.getByText("Scholars")).toBeTruthy();
    expect(screen.getByText("Scholar One")).toBeTruthy();
    expect(screen.getByText("scholar-one", { exact: false })).toBeTruthy();
    expect(screen.getByText("Scholar Two")).toBeTruthy();
    expect(screen.getByText("scholar-two", { exact: false })).toBeTruthy();
  });
});
