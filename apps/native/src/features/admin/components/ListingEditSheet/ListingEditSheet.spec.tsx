import { createMongoAbility } from "@casl/ability";
import { useAbility } from "@sd/domain-account";
import { render, screen } from "@testing-library/react-native";
import React from "react";

import { ListingEditSheet } from "./ListingEditSheet";

jest.mock("@/core/i18n/use-translation", () => ({
  useTranslation: () => ({
    t: (_key: string, fallback: string) => fallback,
  }),
}));

jest.mock("@sd/domain-account", () => ({
  useAbility: jest.fn(),
}));

jest.mock("@/core/auth/use-auth", () => ({
  useAuth: jest.fn(() => ({ isAuthenticated: true, isLoading: false, user: undefined })),
}));

jest.mock("@/features/admin/api/admin-listings.api", () => ({
  fetchAdminListingDetail: jest.fn().mockResolvedValue({
    id: "lst-1",
    title: "Test Listing",
    status: "draft",
    audioKey: "audio/test.mp3",
    scholarId: "sch-1",
    scholarSlug: "scholar-one",
  }),
  updateListing: jest.fn(),
}));

const mockedUseAbility = jest.mocked(useAbility) as any;

describe("ListingEditSheet", () => {
  beforeEach(() => {
    mockedUseAbility.mockReturnValue({
      ability: createMongoAbility([
        { action: "update", subject: "Listing", conditions: { scholarSlug: "scholar-one" } },
      ]),
      isLoading: false,
    });
  });

  it("renders nothing when listingId is null", async () => {
    await render(<ListingEditSheet listingId={null} onClose={() => {}} onSaved={() => {}} />);
    expect(screen.toJSON()).toBeNull();
  });

  it("renders edit form when listingId is provided", async () => {
    await render(<ListingEditSheet listingId="lst-1" onClose={() => {}} onSaved={() => {}} />);
    // findByText waits for the useEffect's async fetch to settle.
    expect(await screen.findByText("Edit Listing")).toBeTruthy();
    expect(screen.getByText("Title")).toBeTruthy();
  }, 15000);

  it("enables Save when the ability grants update for this listing's scholar", async () => {
    await render(<ListingEditSheet listingId="lst-1" onClose={() => {}} onSaved={() => {}} />);
    await screen.findByText("Edit Listing");

    const saveButton = screen.getByRole("button", { name: "Save" });
    expect(saveButton?.props.accessibilityState?.disabled).toBeFalsy();
  }, 15000);

  it("disables Save when the ability does not grant update for this listing's scholar", async () => {
    mockedUseAbility.mockReturnValue({
      ability: createMongoAbility([
        { action: "update", subject: "Listing", conditions: { scholarSlug: "some-other-scholar" } },
      ]),
      isLoading: false,
    });

    await render(<ListingEditSheet listingId="lst-1" onClose={() => {}} onSaved={() => {}} />);
    await screen.findByText("Edit Listing");

    const saveButton = screen.getByRole("button", { name: "Save" });
    expect(saveButton?.props.accessibilityState?.disabled).toBe(true);
  }, 15000);
});
