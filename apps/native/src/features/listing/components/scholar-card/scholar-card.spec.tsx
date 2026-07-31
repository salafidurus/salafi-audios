import type { ScholarListItemDto } from "@sd/core-contracts";

import { render, screen, fireEvent } from "@testing-library/react-native";
import React from "react";

import { ScholarCard } from "./scholar-card";

jest.mock("@sd/domain-content", () => ({
  useFormatScholarName:
    () => (scholar: { name?: string; title?: string | null } | string | null | undefined) => {
      if (!scholar) return "";
      const name = typeof scholar === "string" ? scholar : scholar.name;
      const title = typeof scholar === "string" ? undefined : scholar.title;
      if (!name) return "";
      return title ? `Ustadh ${name}` : name;
    },
}));

const baseScholar: ScholarListItemDto = {
  id: "scholar-1",
  slug: "scholar-one",
  name: "Scholar One",
  imageUrl: undefined,
  mainLanguage: "ar",
  lectureCount: 45,
};

describe("ScholarCard", () => {
  it("renders the scholar name when no title is set", async () => {
    await render(<ScholarCard scholar={baseScholar} />);
    expect(screen.getByText("Scholar One")).toBeTruthy();
  });

  it("renders the scholar's name with translated honorific title", async () => {
    await render(<ScholarCard scholar={{ ...baseScholar, title: "ustadh" }} />);
    expect(screen.getByText("Ustadh Scholar One")).toBeTruthy();
  });

  it("calls onPress with slug when pressed", async () => {
    const onPress = jest.fn();
    await render(<ScholarCard scholar={baseScholar} onPress={onPress} />);
    await fireEvent.press(screen.getByText("Scholar One"));
    expect(onPress).toHaveBeenCalledWith("scholar-one");
  });
});
