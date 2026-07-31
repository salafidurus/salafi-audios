import type { ContentSuggestionDto } from "@sd/core-contracts";

import { render, screen, fireEvent } from "@testing-library/react-native";
import React from "react";

import { ExploreTopicRow } from "./explore-topic-row";

const baseItem: ContentSuggestionDto = {
  id: "sugg-1",
  title: "Suggested Lecture",
  slug: "suggested-lecture",
  kind: "single",
  scholarName: "Scholar Name",
  scholarSlug: "scholar-name",
  thumbnailUrl: null,
  durationSeconds: 600,
};

jest.mock("@sd/core-i18n", () => ({
  pickContentField: jest.fn((t: string) => t),
}));

jest.mock("@/features/settings/content-preference", () => ({
  useShowOriginalContent: jest.fn(() => false),
}));

jest.mock("@/core/i18n/use-translation", () => ({
  useTranslation: () => ({
    t: (_key: string, defaultValue: string, opts?: { topic?: string }) =>
      opts?.topic ? defaultValue.replace("{{topic}}", opts.topic) : defaultValue,
  }),
}));

const mockUseFormattedScholarName = jest.fn(
  (scholarName: string, _scholarSlug?: string) => scholarName,
);

jest.mock("@sd/domain-content", () => ({
  useFormattedScholarName: (scholarName: string, scholarSlug: string) =>
    mockUseFormattedScholarName(scholarName, scholarSlug),
}));

describe("ExploreTopicRow", () => {
  it("renders the topic heading", async () => {
    await render(<ExploreTopicRow topicName="Aqeedah" items={[baseItem]} />);
    expect(screen.getByText("New in Aqeedah")).toBeTruthy();
  });

  it("renders nothing when there are no items", async () => {
    const { toJSON } = await render(<ExploreTopicRow topicName="Aqeedah" items={[]} />);
    expect(toJSON()).toBeNull();
  });

  it("renders each item's title and scholar name", async () => {
    await render(<ExploreTopicRow topicName="Aqeedah" items={[baseItem]} />);
    expect(screen.getByText("Suggested Lecture")).toBeTruthy();
    expect(screen.getByText("Scholar Name")).toBeTruthy();
  });

  it("renders the scholar name with honorific title when available", async () => {
    mockUseFormattedScholarName.mockReturnValueOnce("Shaykh Scholar Name");
    await render(<ExploreTopicRow topicName="Aqeedah" items={[baseItem]} />);
    expect(mockUseFormattedScholarName).toHaveBeenCalledWith("Scholar Name", "scholar-name");
    expect(screen.getByText("Shaykh Scholar Name")).toBeTruthy();
  });

  it("calls onItemPress with the item's slug when pressed", async () => {
    const onItemPress = jest.fn();
    await render(
      <ExploreTopicRow topicName="Aqeedah" items={[baseItem]} onItemPress={onItemPress} />,
    );
    await fireEvent.press(screen.getByText("Suggested Lecture"));
    expect(onItemPress).toHaveBeenCalledWith("suggested-lecture");
  });
});
