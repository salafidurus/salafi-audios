import { render, screen, fireEvent, waitFor } from "@testing-library/react-native";
import React from "react";

import { bulkListingAction } from "../../api/admin-listings.api";
import { useAdminListings } from "../../hooks/use-admin-listings";
import { AdminListingsScreen } from "./admin-listings.screen";

jest.mock("expo-router", () => ({
  Stack: { Screen: () => null },
}));
jest.mock("../../hooks/use-admin-listings", () => ({
  useAdminListings: jest.fn(),
}));
jest.mock("@shopify/flash-list", () => {
  const { FlatList } = jest.requireActual<typeof import("react-native")>("react-native");
  return {
    FlashList: FlatList,
  };
});
jest.mock("../../api/admin-listings.api", () => ({
  bulkListingAction: jest.fn().mockResolvedValue({ succeeded: [], failed: [] }),
}));
jest.mock("../../components/AudioUploaderSheet/AudioUploaderSheet", () => ({
  AudioUploaderSheet: () => null,
}));
jest.mock("../../components/ListingEditSheet/ListingEditSheet", () => {
  const { Text: RNText } = jest.requireActual<typeof import("react-native")>("react-native");
  return {
    ListingEditSheet: ({ listingId }: { listingId: string | null }) =>
      listingId ? <RNText>{`editing:${listingId}`}</RNText> : null,
  };
});
jest.mock("../../components/BulkActionBar/BulkActionBar", () => ({
  BulkActionBar: () => null,
}));

const mockUseAdminListings = useAdminListings as jest.Mock;
const mockBulkListingAction = bulkListingAction as jest.Mock;

describe("AdminListingsScreen", () => {
  it("renders loading state when loading", async () => {
    mockUseAdminListings.mockReturnValue({
      data: undefined,
      isLoading: true,
      refetch: jest.fn(),
    });

    await render(<AdminListingsScreen />);
    expect(screen.getByText("Loading", { exact: false })).toBeTruthy();
  });

  it("renders listings list when data is loaded", async () => {
    mockUseAdminListings.mockReturnValue({
      data: {
        items: [{ id: "lst-1", title: "Listing One", scholarName: "Scholar A", status: "draft" }],
        total: 1,
        page: 1,
      },
      isLoading: false,
      refetch: jest.fn(),
    });

    await render(<AdminListingsScreen />);
    expect(screen.getByText("Listing One")).toBeTruthy();
    expect(screen.getByText("Scholar A", { exact: false })).toBeTruthy();
  });

  it("opens the edit sheet when the row's Edit long-press action is pressed", async () => {
    mockUseAdminListings.mockReturnValue({
      data: {
        items: [{ id: "lst-1", title: "Listing One", scholarName: "Scholar A", status: "draft" }],
        total: 1,
        page: 1,
      },
      isLoading: false,
      refetch: jest.fn(),
    });

    await render(<AdminListingsScreen />);
    await fireEvent.press(screen.getByTestId("admin-listing-row-lst-1-action-edit"));

    expect(screen.getByText("editing:lst-1")).toBeTruthy();
  });

  it("publishes a listing via the row's Publish long-press action", async () => {
    const refetch = jest.fn();
    mockUseAdminListings.mockReturnValue({
      data: {
        items: [{ id: "lst-1", title: "Listing One", scholarName: "Scholar A", status: "draft" }],
        total: 1,
        page: 1,
      },
      isLoading: false,
      refetch,
    });

    await render(<AdminListingsScreen />);
    await fireEvent.press(screen.getByTestId("admin-listing-row-lst-1-action-publish"));

    await waitFor(() =>
      expect(mockBulkListingAction).toHaveBeenCalledWith({ action: "publish", ids: ["lst-1"] }),
    );
    await waitFor(() => expect(refetch).toHaveBeenCalled());
  });

  it("archives a listing via the row's Archive long-press action", async () => {
    const refetch = jest.fn();
    mockUseAdminListings.mockReturnValue({
      data: {
        items: [
          { id: "lst-1", title: "Listing One", scholarName: "Scholar A", status: "published" },
        ],
        total: 1,
        page: 1,
      },
      isLoading: false,
      refetch,
    });

    await render(<AdminListingsScreen />);
    await fireEvent.press(screen.getByTestId("admin-listing-row-lst-1-action-archive"));

    await waitFor(() =>
      expect(mockBulkListingAction).toHaveBeenCalledWith({ action: "archive", ids: ["lst-1"] }),
    );
    await waitFor(() => expect(refetch).toHaveBeenCalled());
  });
});
