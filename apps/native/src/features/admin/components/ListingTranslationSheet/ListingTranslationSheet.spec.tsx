import { endpoints, httpClient } from "@sd/core-contracts";
import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import React from "react";

import { ListingTranslationSheet } from "./ListingTranslationSheet";

jest.mock("../../api/admin-listings.api", () => ({
  fetchAdminListingDetail: jest.fn(() => Promise.resolve({ slug: "a-listing" })),
}));

jest.mock("@sd/core-contracts", () => ({
  endpoints: {
    translations: {
      listings: {
        list: (slug: string) => `/listings/${slug}/translations`,
        save: (slug: string) => `/listings/${slug}/translations`,
      },
    },
  },
  httpClient: jest.fn(),
}));

const mockedHttpClient = jest.mocked(httpClient);

describe("ListingTranslationSheet", () => {
  beforeEach(() => {
    mockedHttpClient.mockResolvedValue([]);
  });

  it("uses the public listing slug and the listing translation contract", async () => {
    await render(
      <ListingTranslationSheet listingId="listing-id" onClose={() => {}} onSaved={() => {}} />,
    );

    await waitFor(() => {
      expect(mockedHttpClient).toHaveBeenCalledWith({
        url: endpoints.translations.listings.list("a-listing"),
        method: "GET",
      });
    });

    await fireEvent.changeText(screen.getByTestId("listing-translation-locale"), "ar");
    await fireEvent.changeText(screen.getByTestId("listing-translation-title"), "عنوان");
    await fireEvent.press(screen.getByRole("button", { name: "Save translation" }));

    await waitFor(() => {
      expect(mockedHttpClient).toHaveBeenLastCalledWith({
        url: endpoints.translations.listings.save("a-listing"),
        method: "POST",
        body: { locale: "ar", title: "عنوان" },
      });
    });
  });
});
