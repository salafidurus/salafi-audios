import { fireEvent, render, screen } from "@testing-library/react-native";
import React from "react";

import { ScholarMedallion } from "./scholar-medallion";

describe("ScholarMedallion", () => {
  const mockScholar = {
    id: "fawzan",
    slug: "fawzan",
    name: "Shaykh Allamah Salih ibn Fawzan al-Fawzan",
    lectureCount: 108,
  };

  it("renders scholar initials and formatted name", async () => {
    await render(<ScholarMedallion scholar={mockScholar} />);

    expect(screen.getByText("S")).toBeTruthy();
    expect(screen.getByText("Salih ibn Fawzan al-Fawzan")).toBeTruthy();
  });

  it("triggers onPress with scholar slug when tapped", async () => {
    const onPress = jest.fn();
    await render(<ScholarMedallion scholar={mockScholar} onPress={onPress} />);

    fireEvent.press(screen.getByTestId("scholar-medallion-fawzan"));
    expect(onPress).toHaveBeenCalledWith("fawzan");
  });
});
