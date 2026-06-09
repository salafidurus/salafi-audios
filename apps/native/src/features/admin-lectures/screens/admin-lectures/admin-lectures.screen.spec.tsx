import React from "react";
import renderer, { act } from "react-test-renderer";
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
  it("renders loading state when loading", () => {
    mockUseAdminLectures.mockReturnValue({
      data: undefined,
      isLoading: true,
      refetch: jest.fn(),
    });

    let tree: ReturnType<typeof renderer.create>;
    act(() => {
      tree = renderer.create(<AdminLecturesScreen />);
    });
    expect(JSON.stringify(tree!.toJSON())).toContain("Loading");
  });

  it("renders lectures list when data is loaded", () => {
    mockUseAdminLectures.mockReturnValue({
      data: {
        items: [{ id: "lec-1", title: "Lecture One", scholarName: "Scholar A", status: "draft" }],
        total: 1,
        page: 1,
      },
      isLoading: false,
      refetch: jest.fn(),
    });

    let tree: ReturnType<typeof renderer.create>;
    act(() => {
      tree = renderer.create(<AdminLecturesScreen />);
    });
    const rendered = JSON.stringify(tree!.toJSON());
    expect(rendered).toContain("Lecture One");
    expect(rendered).toContain("Scholar A");
  });
});
