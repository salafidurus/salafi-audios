import { fireEvent, render, screen } from "@testing-library/react-native";
import React from "react";

import { GlobalSearchButton } from "./GlobalSearchButton";

const mockOpen = jest.fn();

jest.mock("../SearchPalette/SearchPalette", () => ({
  useSearchPalette: () => ({ open: mockOpen }),
}));

jest.mock("@/core/i18n/use-translation", () => ({
  useTranslation: () => ({ t: (_key: string, fallback: string) => fallback }),
}));

describe("GlobalSearchButton", () => {
  beforeEach(() => jest.clearAllMocks());

  it("pushes the public search route from a labeled button", async () => {
    await render(<GlobalSearchButton />);

    fireEvent.press(screen.getByRole("button", { name: "Search" }));

    expect(mockOpen).toHaveBeenCalled();
  });
});
