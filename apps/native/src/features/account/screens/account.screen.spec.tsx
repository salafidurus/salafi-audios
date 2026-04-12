import React from "react";
import renderer, { act } from "react-test-renderer";
import { useAccountScreen } from "@sd/domain-account";
import { AccountScreen } from "./account.screen";

jest.mock("@sd/domain-account", () => ({
  useAccountScreen: jest.fn(),
}));

jest.mock("@/core/i18n/use-translation", () => ({
  useTranslation: () => ({
    t: (_key: string, fallback: string) => fallback,
  }),
}));

jest.mock("../../i18n", () => ({
  LanguageSwitch: () => "LanguageSwitch",
}));

const mockedUseAccountScreen = jest.mocked(useAccountScreen);

describe("AccountScreen", () => {
  beforeEach(() => {
    mockedUseAccountScreen.mockReturnValue({
      profile: undefined,
      isFetching: false,
      error: null,
    });
  });

  it("renders a loading state while the account query is fetching", () => {
    mockedUseAccountScreen.mockReturnValue({
      profile: undefined,
      isFetching: true,
      error: null,
    });

    let tree: ReturnType<typeof renderer.create>;

    act(() => {
      tree = renderer.create(<AccountScreen />);
    });

    expect(JSON.stringify(tree!.toJSON())).toContain("Loading account...");
  });

  it("renders profile details and language controls", () => {
    mockedUseAccountScreen.mockReturnValue({
      profile: {
        id: "user-1",
        email: "user@example.com",
        displayName: "Test User",
        createdAt: "2026-04-11T00:00:00.000Z",
        updatedAt: "2026-04-11T00:00:00.000Z",
      },
      isFetching: false,
      error: null,
    });

    let tree: ReturnType<typeof renderer.create>;

    act(() => {
      tree = renderer.create(<AccountScreen />);
    });

    const rendered = JSON.stringify(tree!.toJSON());

    expect(rendered).toContain("Account");
    expect(rendered).toContain("Test User");
    expect(rendered).toContain("user@example.com");
    expect(rendered).toContain("Edit Profile");
    expect(rendered).toContain("Legal");
    expect(rendered).toContain("Sign Out");
    expect(rendered).toContain("Language");
    expect(rendered).toContain("LanguageSwitch");
  });
});
