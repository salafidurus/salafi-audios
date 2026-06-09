import React from "react";
import renderer, { act } from "react-test-renderer";
import { AdminScholarDetailScreen } from "./admin-scholar-detail.screen";
import { useApiQuery } from "@sd/core-contracts";
import { useAdminSeries, useAdminCollections } from "../../hooks/use-admin-scholars";

jest.mock("@sd/core-contracts", () => ({
  useApiQuery: jest.fn(),
  httpClient: jest.fn(),
  endpoints: {
    scholars: {
      detail: (slug: string) => `/scholars/${slug}`,
    },
  },
}));

jest.mock("../../hooks/use-admin-scholars", () => ({
  useAdminSeries: jest.fn(),
  useAdminCollections: jest.fn(),
}));

jest.mock("@/shared/components/DraggableList", () => {
  const { FlatList } = require("react-native");
  return {
    DraggableList: FlatList,
  };
});

jest.mock("react-native-gesture-handler", () => {
  const { View } = require("react-native");
  return {
    GestureHandlerRootView: View,
    GestureDetector: View,
    Gesture: {
      Pan: jest.fn().mockReturnValue({
        onChange: jest.fn(),
      }),
    },
  };
});

const mockUseApiQuery = useApiQuery as jest.Mock;
const mockUseAdminSeries = useAdminSeries as jest.Mock;
const mockUseAdminCollections = useAdminCollections as jest.Mock;

describe("AdminScholarDetailScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders loading indicator when scholar detail is loading", () => {
    mockUseApiQuery.mockReturnValue({
      data: null,
      isLoading: true,
    });
    mockUseAdminSeries.mockReturnValue({ data: [], refetch: jest.fn() });
    mockUseAdminCollections.mockReturnValue({ data: [], refetch: jest.fn() });

    let tree: ReturnType<typeof renderer.create>;
    act(() => {
      tree = renderer.create(<AdminScholarDetailScreen scholarSlug="scholar-one" />);
    });
    const rendered = JSON.stringify(tree!.toJSON());
    // Since it just returns ActivityIndicator, it should not contain "Series"
    expect(rendered).not.toContain("Series");
  });

  it("renders scholar details, series and collections lists when loaded", () => {
    mockUseApiQuery.mockReturnValue({
      data: {
        id: "s1",
        name: "Scholar One",
        slug: "scholar-one",
      },
      isLoading: false,
    });
    mockUseAdminSeries.mockReturnValue({
      data: [{ id: "ser1", title: "Series Title", publishedLectureCount: 5, status: "published" }],
      refetch: jest.fn(),
    });
    mockUseAdminCollections.mockReturnValue({
      data: [{ id: "col1", title: "Collection Title", status: "published" }],
      refetch: jest.fn(),
    });

    let tree: ReturnType<typeof renderer.create>;
    act(() => {
      tree = renderer.create(<AdminScholarDetailScreen scholarSlug="scholar-one" />);
    });
    const rendered = JSON.stringify(tree!.toJSON());
    expect(rendered).toContain("Scholar One");
    expect(rendered).toContain("scholar-one");
    expect(rendered).toContain("Series Title");
    expect(rendered).toContain("Collection Title");
  });
});
