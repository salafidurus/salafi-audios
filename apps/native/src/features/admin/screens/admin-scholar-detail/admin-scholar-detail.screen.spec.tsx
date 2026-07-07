import React from "react";
import { render, screen } from "@testing-library/react-native";
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
  const { FlatList } = jest.requireActual<typeof import("react-native")>("react-native");
  return {
    DraggableList: FlatList,
  };
});

jest.mock("react-native-gesture-handler", () => {
  const { View } = jest.requireActual<typeof import("react-native")>("react-native");
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

  it("renders loading indicator when scholar detail is loading", async () => {
    mockUseApiQuery.mockReturnValue({
      data: null,
      isLoading: true,
    });
    mockUseAdminSeries.mockReturnValue({ data: [], refetch: jest.fn() });
    mockUseAdminCollections.mockReturnValue({ data: [], refetch: jest.fn() });

    await render(<AdminScholarDetailScreen scholarSlug="scholar-one" />);
    // Since it just returns ActivityIndicator, it should not contain "Series"
    expect(screen.queryByText("Series", { exact: false })).toBeNull();
  });

  it("renders scholar details, series and collections lists when loaded", async () => {
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
      data: [
        { id: "col1", title: "Collection Title", status: "published", publishedLectureCount: 0 },
      ],
      refetch: jest.fn(),
    });

    await render(<AdminScholarDetailScreen scholarSlug="scholar-one" />);
    expect(screen.getByText("Scholar One")).toBeTruthy();
    expect(screen.getByText("scholar-one", { exact: false })).toBeTruthy();
    expect(screen.getByText("Series Title")).toBeTruthy();
    expect(screen.getByText("Collection Title")).toBeTruthy();
  });
});
