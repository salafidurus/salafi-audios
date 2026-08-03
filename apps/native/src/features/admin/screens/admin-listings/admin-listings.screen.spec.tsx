import { createMongoAbility } from "@casl/ability";
import { useAbility } from "@sd/domain-account";
import { render, screen, fireEvent } from "@testing-library/react-native";
import React from "react";

import { useAdminListings } from "../../hooks/use-admin-listings";
import { AdminListingsScreen } from "./admin-listings.screen";

jest.mock("expo-router", () => ({
  Stack: { Screen: () => null },
}));
jest.mock("@sd/domain-account", () => ({
  useAbility: jest.fn(),
}));
jest.mock("@/core/auth/use-auth", () => ({
  useAuth: jest.fn(() => ({ isAuthenticated: true, isLoading: false, user: undefined })),
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

const mockUseFormattedScholarName = jest.fn(
  (scholarName: string, _scholarSlug?: string) => scholarName,
);

jest.mock("@sd/domain-content", () => ({
  useFormattedScholarName: (scholarName: string, scholarSlug: string) =>
    mockUseFormattedScholarName(scholarName, scholarSlug),
}));

const mockUseAdminListings = useAdminListings as jest.Mock;
const mockedUseAbility = jest.mocked(useAbility) as any;

const FULL_LISTING_ABILITY = createMongoAbility([
  { action: "update", subject: "Listing" },
  { action: "publish", subject: "Listing" },
  { action: "archive", subject: "Listing" },
  { action: "upload", subject: "Media" },
]);

describe("AdminListingsScreen", () => {
  beforeEach(() => {
    mockedUseAbility.mockReturnValue({ ability: FULL_LISTING_ABILITY, isLoading: false });
  });

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

  it("uses the shared Expo UI host and native listing row trigger", async () => {
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

    expect(screen.getByTestId("admin-listings-host")).toBeTruthy();
    expect(screen.getByTestId("admin-listing-row-lst-1-trigger")).toBeTruthy();
  });

  it("renders the scholar name with honorific title when available", async () => {
    mockUseFormattedScholarName.mockReturnValueOnce("Shaykh Scholar A");
    mockUseAdminListings.mockReturnValue({
      data: {
        items: [
          {
            id: "lst-1",
            title: "Listing One",
            scholarName: "Scholar A",
            scholarSlug: "scholar-a",
            status: "draft",
          },
        ],
        total: 1,
        page: 1,
      },
      isLoading: false,
      refetch: jest.fn(),
    });

    await render(<AdminListingsScreen />);

    expect(mockUseFormattedScholarName).toHaveBeenCalledWith("Scholar A", "scholar-a");
    expect(screen.getByText("Shaykh Scholar A", { exact: false })).toBeTruthy();
  });

  it("opens the edit sheet when the Compose list row is pressed", async () => {
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
    await fireEvent.press(screen.getByTestId("admin-listing-row-lst-1-trigger"));

    expect(screen.getByText("editing:lst-1")).toBeTruthy();
  });

  it("shows the Upload button when the ability grants media upload", async () => {
    mockUseAdminListings.mockReturnValue({
      data: { items: [], total: 0, page: 1 },
      isLoading: false,
      refetch: jest.fn(),
    });

    await render(<AdminListingsScreen />);

    expect(screen.getByText("Upload")).toBeTruthy();
  });

  it("hides the Upload button when the ability does not grant media upload", async () => {
    mockedUseAbility.mockReturnValue({
      ability: createMongoAbility([{ action: "update", subject: "Listing" }]),
      isLoading: false,
    });
    mockUseAdminListings.mockReturnValue({
      data: { items: [], total: 0, page: 1 },
      isLoading: false,
      refetch: jest.fn(),
    });

    await render(<AdminListingsScreen />);

    expect(screen.queryByText("+ Upload")).toBeNull();
  });
});
