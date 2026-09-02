import { render, screen, fireEvent } from "@testing-library/react-native";

import { SearchResultItem } from "./SearchResultItem";

jest.mock("@/core/i18n/use-translation", () => ({
  useTranslation: () => ({ t: (_key: string, fallback: string) => fallback }),
}));

describe("SearchResultItem", () => {
  it("renders as an accessible native list row and preserves activation", async () => {
    const onPress = jest.fn();

    await render(
      <SearchResultItem
        title="The Book of Tawheed"
        scholarName="Ibn Baz"
        lectureCount={12}
        durationSeconds={3600}
        onPress={onPress}
      />,
    );

    expect(screen.getByTestId("native-list-item")).toBeTruthy();
    expect(screen.getByText("The Book of Tawheed")).toBeTruthy();
    expect(screen.getByText(/Ibn Baz/)).toBeTruthy();

    await fireEvent.press(screen.getByTestId("native-list-item"));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
