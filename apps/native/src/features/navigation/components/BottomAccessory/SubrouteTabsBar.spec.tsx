import { fireEvent, render, screen } from "@testing-library/react-native";
import React from "react";

import { SubrouteTabsBar } from "./SubrouteTabsBar";

const mockReplace = jest.fn();
const mockUsePathname = jest.fn();

jest.mock("expo-router", () => ({
  usePathname: () => mockUsePathname(),
  useRouter: () => ({ replace: mockReplace }),
}));

jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (_key: string, fallback: string) => fallback }),
}));

jest.mock(
  "lucide-react-native",
  () =>
    new Proxy(
      {},
      {
        get: () => "Icon",
      },
    ),
);

describe("SubrouteTabsBar", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it.each([
    ["explore", "/recent", ["Recent", "Scholars", "Curation"], ["/", "/scholar", "/curation"]],
    [
      "library",
      "/library/started",
      ["Started", "Saved", "Completed"],
      ["/library", "/library/saved", "/library/completed"],
    ],
    ["settings", "/settings", ["General", "Profile"], ["/settings", "/settings/profile"]],
  ])("routes every %s tab correctly", async (_section, pathname, labels, routes) => {
    mockUsePathname.mockReturnValue(pathname);

    await render(<SubrouteTabsBar />);

    for (const [index, label] of labels.entries()) {
      await fireEvent.press(screen.getByText(label));
      expect(mockReplace).toHaveBeenLastCalledWith(routes[index]);
    }
  });
});
