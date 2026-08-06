import { fireEvent, render, screen } from "@testing-library/react-native";
import React from "react";

import { CategoryChipsRail } from "./category-chips-rail";

describe("CategoryChipsRail", () => {
  it("renders category chips including All", async () => {
    await render(<CategoryChipsRail selectedCategory="all" />);

    expect(screen.getByTestId("category-chips-rail")).toBeTruthy();
    expect(screen.getByTestId("category-chip-all")).toBeTruthy();
    expect(screen.getByTestId("category-chip-aqeedah")).toBeTruthy();
    expect(screen.getByTestId("category-chip-tafsir")).toBeTruthy();
  });

  it("calls onSelectCategory when a chip is pressed", async () => {
    const onSelectCategory = jest.fn();
    await render(<CategoryChipsRail selectedCategory="all" onSelectCategory={onSelectCategory} />);

    fireEvent.press(screen.getByTestId("category-chip-fiqh"));
    expect(onSelectCategory).toHaveBeenCalledWith("fiqh");
  });
});
