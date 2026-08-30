import { render, screen } from "@testing-library/react-native";

import { AppText } from "./AppText";

describe("AppText", () => {
  it("renders through Expo UI Text with the selected typography and line limit", async () => {
    await render(
      <AppText variant="titleMd" numberOfLines={2}>
        Native title
      </AppText>,
    );

    const text = screen.getByText("Native title");
    expect(text).toBeTruthy();
    expect(text.props.numberOfLines).toBe(2);
    expect(text.props.textStyle).toEqual(
      expect.objectContaining({
        fontFamily: "Manrope-Medium",
        fontSize: 18,
      }),
    );
  });
});
