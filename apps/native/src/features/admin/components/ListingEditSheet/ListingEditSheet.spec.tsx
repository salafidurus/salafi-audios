import { render, screen } from "@testing-library/react-native";
import React from "react";

import { ListingEditSheet } from "./ListingEditSheet";

jest.mock("@/core/i18n/use-translation", () => ({
  useTranslation: () => ({
    t: (_key: string, fallback: string) => fallback,
  }),
}));

jest.mock("@/features/admin/api/admin-listings.api", () => ({
  fetchAdminListingDetail: jest.fn().mockResolvedValue({
    id: "lst-1",
    title: "Test Listing",
    status: "draft",
    audioKey: "audio/test.mp3",
  }),
  updateListing: jest.fn(),
}));

describe("ListingEditSheet", () => {
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
});
