import React from "react";
import { render, screen, fireEvent } from "@testing-library/react-native";
import type { ScholarListItemDto } from "@sd/core-contracts";
import { ScholarRow } from "./scholar-row";

const baseScholar: ScholarListItemDto = {
  id: "scholar-1",
  slug: "scholar-one",
  name: "Scholar One",
  imageUrl: undefined,
  mainLanguage: "ar",
  lectureCount: 45,
};

describe("ScholarRow", () => {
  it("renders scholar name", async () => {
    await render(<ScholarRow scholar={baseScholar} />);
    expect(screen.getByText("Scholar One")).toBeTruthy();
  });

  it("shows lecture count", async () => {
    await render(<ScholarRow scholar={baseScholar} />);
    expect(screen.getByText("45 lectures")).toBeTruthy();
  });

  it("shows language when available", async () => {
    await render(<ScholarRow scholar={baseScholar} />);
    expect(screen.getByText("ar")).toBeTruthy();
  });

  it("hides language when not set", async () => {
    await render(<ScholarRow scholar={{ ...baseScholar, mainLanguage: undefined }} />);
    expect(screen.queryByText("ar")).toBeNull();
  });

  it("renders avatar image when imageUrl is set", async () => {
    await render(
      <ScholarRow scholar={{ ...baseScholar, imageUrl: "https://example.com/avatar.jpg" }} />,
    );
    expect(screen.getByTestId("scholar-row-avatar")).toBeTruthy();
  });

  it("renders placeholder when no imageUrl", async () => {
    await render(<ScholarRow scholar={baseScholar} />);
    expect(screen.getByTestId("scholar-row-avatar-placeholder")).toBeTruthy();
  });

  it("calls onPress with slug when pressed", async () => {
    const onPress = jest.fn();
    await render(<ScholarRow scholar={baseScholar} onPress={onPress} />);
    await fireEvent.press(screen.getByTestId("scholar-row"));
    expect(onPress).toHaveBeenCalledWith("scholar-one");
  });
});
