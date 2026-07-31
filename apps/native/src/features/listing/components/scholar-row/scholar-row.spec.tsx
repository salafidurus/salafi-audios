import type { ScholarListItemDto } from "@sd/core-contracts";

import { render, screen, fireEvent } from "@testing-library/react-native";
import React from "react";

import { ScholarRow } from "./scholar-row";

jest.mock("@sd/domain-content", () => ({
  useFormatScholarName:
    () => (scholar: { name?: string; title?: string | null } | string | null | undefined) => {
      if (!scholar) return "";
      const name = typeof scholar === "string" ? scholar : scholar.name;
      const title = typeof scholar === "string" ? undefined : scholar.title;
      if (!name) return "";
      return title ? `Shaykh ${name}` : name;
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

  it("renders the scholar name with translated honorific title prefix when title is set", async () => {
    await render(<ScholarRow scholar={{ ...baseScholar, title: "sheikh" }} />);
    expect(screen.getByText("Shaykh Scholar One")).toBeTruthy();
  });

  it("uses the raw name for avatar initials, not the honorific-prefixed name", async () => {
    await render(<ScholarRow scholar={{ ...baseScholar, name: "Ahmad", title: "sheikh" }} />);
    // Avatar initial should come from "Ahmad" ("A"), not "Shaykh Ahmad" ("S").
    expect(screen.getByTestId("scholar-row-avatar-placeholder")).toHaveTextContent("A");
  });
});
