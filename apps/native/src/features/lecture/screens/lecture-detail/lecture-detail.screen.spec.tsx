import React from "react";
import { render, screen } from "@testing-library/react-native";
import { useLectureDetailScreen } from "@sd/domain-content";
import { LectureDetailScreen } from "./lecture-detail.screen";

jest.mock("react-native-unistyles", () => ({
  StyleSheet: {
    create: (styles: unknown) =>
      typeof styles === "function"
        ? styles({
            spacing: {
              layout: { sectionY: 24 },
              component: { gapLg: 16 },
            },
          })
        : styles,
  },
}));

jest.mock("@sd/domain-content", () => ({
  useLectureDetailScreen: jest.fn(),
}));

jest.mock("../../../../shared/components/ScreenView/ScreenView", () => ({
  ScreenView: ({ children }: { children: React.ReactNode }) => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const ReactM = require("react");
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { View } = require("react-native");
    return ReactM.createElement(View, null, children);
  },
}));

jest.mock("../../../../shared/components/AppText/AppText", () => ({
  AppText: ({ children }: { children: React.ReactNode }) => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const ReactM = require("react");
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { Text } = require("react-native");
    return ReactM.createElement(Text, null, children);
  },
}));

jest.mock("../../components/lecture-meta/lecture-meta", () => ({
  LectureMeta: ({ lecture }: { lecture: { scholar: { name: string } } }) => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const ReactM = require("react");
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { Text } = require("react-native");
    return ReactM.createElement(Text, null, `Meta:${lecture.scholar.name}`);
  },
}));

jest.mock("../../components/topic-chips/topic-chips", () => ({
  TopicChips: ({ topics }: { topics: { name: string }[] }) => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const ReactM = require("react");
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { Text } = require("react-native");
    return ReactM.createElement(Text, null, `Topics:${topics.length}`);
  },
}));

jest.mock("../../components/series-context-bar/series-context-bar", () => ({
  SeriesContextBar: ({ seriesContext }: { seriesContext: { seriesTitle: string } }) => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const ReactM = require("react");
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { Text } = require("react-native");
    return ReactM.createElement(Text, null, `Series:${seriesContext.seriesTitle}`);
  },
}));

const mockedUseLectureDetailScreen = jest.mocked(useLectureDetailScreen);

describe("LectureDetailScreen", () => {
  it("renders a loading state while lecture detail is fetching", async () => {
    mockedUseLectureDetailScreen.mockReturnValue({
      lecture: undefined,
      isFetching: true,
      error: null,
    });

    await render(<LectureDetailScreen id="lecture-1" />);

    expect(screen.getByText("Loading lecture…")).toBeTruthy();
  });

  it("renders an empty state when the lecture is missing", async () => {
    mockedUseLectureDetailScreen.mockReturnValue({
      lecture: undefined,
      isFetching: false,
      error: null,
    });

    await render(<LectureDetailScreen id="missing" />);

    expect(screen.getByText("Lecture not found")).toBeTruthy();
  });

  it("renders lecture details when data exists", async () => {
    mockedUseLectureDetailScreen.mockReturnValue({
      lecture: {
        id: "lecture-1",
        slug: "an-example-lecture",
        title: "An Example Lecture",
        description: "Useful lecture description.",
        language: "en",
        durationSeconds: 3600,
        publishedAt: "2026-04-11T00:00:00.000Z",
        scholar: {
          id: "scholar-1",
          slug: "ibn-baz",
          name: "Ibn Baz",
          imageUrl: undefined,
        },
        topics: [
          { id: "topic-1", slug: "aqidah", name: "Aqidah" },
          { id: "topic-2", slug: "fiqh", name: "Fiqh" },
        ],
        primaryAudioAsset: null,
        seriesContext: {
          seriesId: "series-1",
          seriesSlug: "series",
          seriesTitle: "Important Series",
          prevLecture: null,
          nextLecture: null,
        },
      },
      isFetching: false,
      error: null,
    });

    await render(<LectureDetailScreen id="lecture-1" />);

    expect(screen.getByText("An Example Lecture")).toBeTruthy();
    expect(screen.getByText("Meta:Ibn Baz")).toBeTruthy();
    expect(screen.getByText("Topics:2")).toBeTruthy();
    expect(screen.getByText("Useful lecture description.")).toBeTruthy();
    expect(screen.getByText("Series:Important Series")).toBeTruthy();
  });
});
