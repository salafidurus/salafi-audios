import { render, fireEvent } from "@testing-library/react-native";
import React from "react";

import { ScreenHeader } from "./ScreenHeader";

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 44, bottom: 34, left: 0, right: 0 }),
}));

describe("ScreenHeader", () => {
  it("renders title correctly", async () => {
    const { getByText } = await render(<ScreenHeader title="Explore" />);
    expect(getByText("Explore")).toBeTruthy();
  });

  it("renders back button when showBack and onBack are provided", async () => {
    const onBackMock = jest.fn();
    const { getByTestId } = await render(
      <ScreenHeader title="Explore" showBack onBack={onBackMock} />,
    );
    const backBtn = getByTestId("header-back-button");
    expect(backBtn).toBeTruthy();

    fireEvent.press(backBtn);
    expect(onBackMock).toHaveBeenCalledTimes(1);
  });

  it("renders search input and responds to change text", async () => {
    const onSearchChangeMock = jest.fn();
    const { getByPlaceholderText } = await render(
      <ScreenHeader
        title="Home"
        searchQuery="hadith"
        onSearchChange={onSearchChangeMock}
        searchPlaceholder="Search lessons..."
      />,
    );

    const input = getByPlaceholderText("Search lessons...");
    expect(input.props.value).toBe("hadith");

    fireEvent.changeText(input, "fiqh");
    expect(onSearchChangeMock).toHaveBeenCalledWith("fiqh");
  });
});
