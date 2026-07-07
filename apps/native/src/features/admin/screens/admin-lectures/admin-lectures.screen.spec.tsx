import React from "react";
import { render, screen } from "@testing-library/react-native";
import { AdminLecturesScreen } from "./admin-lectures.screen";
import { useAdminLectures } from "../../hooks/use-admin-lectures";

jest.mock("../../hooks/use-admin-lectures", () => ({
  useAdminLectures: jest.fn(),
}));
jest.mock("@shopify/flash-list", () => {
  const { FlatList } = jest.requireActual<typeof import("react-native")>("react-native");
  return {
    FlashList: FlatList,
  };
});
jest.mock("../../api/admin-lectures.api", () => ({
  bulkLectureAction: jest.fn(),
}));
jest.mock("../../components/AudioUploaderSheet/AudioUploaderSheet", () => ({
  AudioUploaderSheet: () => null,
}));
jest.mock("../../components/LectureEditSheet/LectureEditSheet", () => ({
  LectureEditSheet: () => null,
}));
jest.mock("../../components/BulkActionBar/BulkActionBar", () => ({
  BulkActionBar: () => null,
}));

const mockUseAdminLectures = useAdminLectures as jest.Mock;

describe("AdminLecturesScreen", () => {
  it("renders loading state when loading", async () => {
    mockUseAdminLectures.mockReturnValue({
      data: undefined,
      isLoading: true,
      refetch: jest.fn(),
    });

    await render(<AdminLecturesScreen />);
    expect(screen.getByText("Loading", { exact: false })).toBeTruthy();
  });

  it("renders lectures list when data is loaded", async () => {
    mockUseAdminLectures.mockReturnValue({
      data: {
        items: [{ id: "lec-1", title: "Lecture One", scholarName: "Scholar A", status: "draft" }],
        total: 1,
        page: 1,
      },
      isLoading: false,
      refetch: jest.fn(),
    });

    await render(<AdminLecturesScreen />);
    expect(screen.getByText("Lecture One")).toBeTruthy();
    expect(screen.getByText("Scholar A", { exact: false })).toBeTruthy();
  });
});
