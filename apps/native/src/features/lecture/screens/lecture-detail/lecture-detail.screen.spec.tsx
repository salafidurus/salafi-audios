import React from "react";
import renderer, { act } from "react-test-renderer";
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
  ScreenView: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock("../../../../shared/components/AppText/AppText", () => ({
  AppText: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock("../../components/lecture-meta/lecture-meta", () => ({
  LectureMeta: ({ lecture }: { lecture: { scholar: { name: string } } }) =>
    `Meta:${lecture.scholar.name}`,
}));

jest.mock("../../components/topic-chips/topic-chips", () => ({
  TopicChips: ({ topics }: { topics: { name: string }[] }) => `Topics:${topics.length}`,
}));

jest.mock("../../components/series-context-bar/series-context-bar", () => ({
  SeriesContextBar: ({ seriesContext }: { seriesContext: { seriesTitle: string } }) =>
    `Series:${seriesContext.seriesTitle}`,
}));

const mockedUseLectureDetailScreen = jest.mocked(useLectureDetailScreen);

describe("LectureDetailScreen", () => {
  it("renders a loading state while lecture detail is fetching", () => {
    mockedUseLectureDetailScreen.mockReturnValue({
      lecture: undefined,
      isFetching: true,
      error: null,
    });

    let tree: ReturnType<typeof renderer.create>;

    act(() => {
      tree = renderer.create(<LectureDetailScreen id="lecture-1" />);
    });

    expect(tree!.toJSON()).toBe("Loading lecture…");
  });

  it("renders an empty state when the lecture is missing", () => {
    mockedUseLectureDetailScreen.mockReturnValue({
      lecture: undefined,
      isFetching: false,
      error: null,
    });

    let tree: ReturnType<typeof renderer.create>;

    act(() => {
      tree = renderer.create(<LectureDetailScreen id="missing" />);
    });

    expect(tree!.toJSON()).toBe("Lecture not found");
  });

  it("renders lecture details when data exists", () => {
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

    let tree: ReturnType<typeof renderer.create>;

    act(() => {
      tree = renderer.create(<LectureDetailScreen id="lecture-1" />);
    });

    const rendered = JSON.stringify(tree!.toJSON());

    expect(rendered).toContain("An Example Lecture");
    expect(rendered).toContain("Meta:Ibn Baz");
    expect(rendered).toContain("Topics:2");
    expect(rendered).toContain("Useful lecture description.");
    expect(rendered).toContain("Series:Important Series");
  });
});
