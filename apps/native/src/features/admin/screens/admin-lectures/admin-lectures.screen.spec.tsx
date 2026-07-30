import { render, screen, fireEvent, waitFor } from "@testing-library/react-native";
import React from "react";

import { bulkLectureAction } from "../../api/admin-lectures.api";
import { useAdminLectures } from "../../hooks/use-admin-lectures";
import { AdminLecturesScreen } from "./admin-lectures.screen";

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
  bulkLectureAction: jest.fn().mockResolvedValue({ succeeded: [], failed: [] }),
}));
jest.mock("../../components/AudioUploaderSheet/AudioUploaderSheet", () => ({
  AudioUploaderSheet: () => null,
}));
jest.mock("../../components/LectureEditSheet/LectureEditSheet", () => {
  const { Text: RNText } = jest.requireActual<typeof import("react-native")>("react-native");
  return {
    LectureEditSheet: ({ lectureId }: { lectureId: string | null }) =>
      lectureId ? <RNText>{`editing:${lectureId}`}</RNText> : null,
  };
});
jest.mock("../../components/BulkActionBar/BulkActionBar", () => ({
  BulkActionBar: () => null,
}));

const mockUseAdminLectures = useAdminLectures as jest.Mock;
const mockBulkLectureAction = bulkLectureAction as jest.Mock;

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

  it("opens the edit sheet when the row's Edit long-press action is pressed", async () => {
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
    await fireEvent.press(screen.getByTestId("admin-lecture-row-lec-1-action-edit"));

    expect(screen.getByText("editing:lec-1")).toBeTruthy();
  });

  it("publishes a lecture via the row's Publish long-press action", async () => {
    const refetch = jest.fn();
    mockUseAdminLectures.mockReturnValue({
      data: {
        items: [{ id: "lec-1", title: "Lecture One", scholarName: "Scholar A", status: "draft" }],
        total: 1,
        page: 1,
      },
      isLoading: false,
      refetch,
    });

    await render(<AdminLecturesScreen />);
    await fireEvent.press(screen.getByTestId("admin-lecture-row-lec-1-action-publish"));

    await waitFor(() =>
      expect(mockBulkLectureAction).toHaveBeenCalledWith({ action: "publish", ids: ["lec-1"] }),
    );
    await waitFor(() => expect(refetch).toHaveBeenCalled());
  });

  it("archives a lecture via the row's Archive long-press action", async () => {
    const refetch = jest.fn();
    mockUseAdminLectures.mockReturnValue({
      data: {
        items: [
          { id: "lec-1", title: "Lecture One", scholarName: "Scholar A", status: "published" },
        ],
        total: 1,
        page: 1,
      },
      isLoading: false,
      refetch,
    });

    await render(<AdminLecturesScreen />);
    await fireEvent.press(screen.getByTestId("admin-lecture-row-lec-1-action-archive"));

    await waitFor(() =>
      expect(mockBulkLectureAction).toHaveBeenCalledWith({ action: "archive", ids: ["lec-1"] }),
    );
    await waitFor(() => expect(refetch).toHaveBeenCalled());
  });
});
