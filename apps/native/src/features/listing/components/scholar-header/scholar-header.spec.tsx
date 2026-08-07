import type { ScholarDetailDto } from "@sd/core-contracts";

import { render, screen } from "@testing-library/react-native";
import React from "react";

import { ScholarHeader } from "./scholar-header";

jest.mock("expo-router", () => ({
  useRouter: () => ({ back: jest.fn() }),
}));

jest.mock("expo-image", () => ({
  Image: "Image",
}));

jest.mock("@sd/domain-content", () => ({
  useFormatScholarName:
    () => (scholar: { name?: string; title?: string | null } | string | null | undefined) => {
      if (!scholar) return "";
      const name = typeof scholar === "string" ? scholar : scholar.name;
      const title = typeof scholar === "string" ? undefined : scholar.title;
      if (!name) return "";
      return title ? `Shaykh Allamah ${name}` : name;
    },
}));

const baseScholar = {
  id: "scholar-1",
  slug: "scholar-one",
  name: "Scholar One",
  bio: null,
  country: null,
  mainLanguage: null,
  imageUrl: undefined,
  socialWebsite: null,
  socialYoutube: null,
  socialTwitter: null,
  socialTelegram: null,
  lectureCount: 12,
  seriesCount: 2,
  totalDurationSeconds: 0,
} as unknown as ScholarDetailDto & {
  lectureCount: number;
  seriesCount: number;
  totalDurationSeconds: number;
};

describe("ScholarHeader", () => {
  it("renders the scholar name when no title is set", async () => {
    await render(<ScholarHeader scholar={baseScholar} />);
    expect(screen.getByText("Scholar One")).toBeTruthy();
  });

  it("renders the scholar's name with translated honorific title", async () => {
    await render(<ScholarHeader scholar={{ ...baseScholar, title: "allamah" }} />);
    expect(screen.getByText("Shaykh Allamah Scholar One")).toBeTruthy();
  });
});
