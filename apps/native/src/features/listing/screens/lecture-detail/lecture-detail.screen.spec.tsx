import { useListingDetail } from "@sd/domain-content";
import { render, screen } from "@testing-library/react-native";
import React from "react";

import { LectureDetailScreen } from "./lecture-detail.screen";

jest.mock("react-native-unistyles", () => ({
  StyleSheet: {
    create: (styles: unknown) =>
      typeof styles === "function"
        ? styles({
            spacing: {
              layout: { sectionY: 24, pageX: 16, pageY: 16 },
              component: { gapLg: 16, gapSm: 8 },
              scale: { md: 12, sm: 8, lg: 16 },
            },
            colors: {
              content: { strong: "#000", muted: "#666", onPrimary: "#fff", default: "#000" },
              action: { primary: "#0070f3" },
              surface: { elevated: "#eee" },
              border: { default: "#ccc" },
            },
            radius: { component: { chip: 16 } },
            shadows: { xs: {}, sm: {} },
            recipes: {
              primaryCta: {
                backgroundColor: "#0070f3",
                borderColor: "#0070f3",
                textColor: "#fff",
                linear: { colors: [], start: {}, end: {} },
                radial: { center: {}, radius: 0, centerColor: "", edgeColor: "" },
              },
            },
          })
        : styles,
  },
  useUnistyles: () => ({
    theme: {
      colors: {
        content: { strong: "#000", muted: "#666", onPrimary: "#fff", default: "#000" },
        action: { primary: "#0070f3" },
        surface: { elevated: "#eee" },
        border: { default: "#ccc" },
      },
      radius: { component: { chip: 16 } },
      shadows: { xs: {}, sm: {} },
      recipes: {
        primaryCta: {
          backgroundColor: "#0070f3",
          borderColor: "#0070f3",
          textColor: "#fff",
          linear: { colors: [], start: {}, end: {} },
          radial: { center: {}, radius: 0, centerColor: "", edgeColor: "" },
        },
      },
      spacing: {
        scale: { sm: 8, md: 12, lg: 16 },
        component: { gapSm: 8, chipY: 4, chipX: 8 },
      },
      typography: { bodySm: {}, labelMd: {}, bodyLg: {} },
    },
  }),
}));

jest.mock("@sd/domain-content", () => ({
  useListingDetail: jest.fn(),
}));

jest.mock("@sd/domain-audio", () => ({
  useAudio: jest.fn(() => ({
    isPlaying: false,
    currentTrack: null,
    playListing: jest.fn(),
    pause: jest.fn(),
    resume: jest.fn(),
  })),
  useProgressStore: jest.fn(() => ({
    actions: {
      isSaved: jest.fn(() => false),
      addSaved: jest.fn(),
      removeSaved: jest.fn(),
    },
  })),
}));

jest.mock("@/features/audio", () => ({
  audioService: {
    playListing: jest.fn(),
    pause: jest.fn(),
    resume: jest.fn(),
  },
}));

jest.mock("@/shared/components/ScreenView/ScreenView", () => ({
  ScreenView: ({ children }: { children: React.ReactNode }) => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const ReactM = require("react");
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { View } = require("react-native");
    return ReactM.createElement(View, null, children);
  },
}));

jest.mock("@/shared/components/AppText/AppText", () => ({
  AppText: ({ children }: { children: React.ReactNode }) => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const ReactM = require("react");
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { Text } = require("react-native");
    return ReactM.createElement(Text, null, children);
  },
}));

jest.mock("@/features/listing/components/lecture-meta/lecture-meta", () => ({
  LectureMeta: ({ lecture }: { lecture: { scholar: { name: string } } }) => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const ReactM = require("react");
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { Text } = require("react-native");
    return ReactM.createElement(Text, null, `Meta:${lecture.scholar.name}`);
  },
}));

jest.mock("@/features/listing/components/topic-chips/topic-chips", () => ({
  TopicChips: ({ topics }: { topics: { name: string }[] }) => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const ReactM = require("react");
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { Text } = require("react-native");
    return ReactM.createElement(Text, null, `Topics:${topics.length}`);
  },
}));

jest.mock("@/features/listing/components/series-context-bar/series-context-bar", () => ({
  SeriesContextBar: ({ seriesContext }: { seriesContext: { seriesTitle: string } }) => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const ReactM = require("react");
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { Text } = require("react-native");
    return ReactM.createElement(Text, null, `Series:${seriesContext.seriesTitle}`);
  },
}));

const mockedUseListingDetail = jest.mocked(useListingDetail) as any;

describe("LectureDetailScreen", () => {
  it("renders a loading state while lecture detail is fetching", async () => {
    mockedUseListingDetail.mockReturnValue({
      data: undefined,
      isFetching: true,
      error: null,
    });

    await render(<LectureDetailScreen slug="lecture-1" />);

    expect(screen.getByText("Loading lecture…")).toBeTruthy();
  });

  it("renders an empty state when the lecture is missing", async () => {
    mockedUseListingDetail.mockReturnValue({
      data: undefined,
      isFetching: false,
      error: null,
    });

    await render(<LectureDetailScreen slug="missing" />);

    expect(screen.getByText("Lecture not found")).toBeTruthy();
  });

  it("renders lecture details when data exists", async () => {
    mockedUseListingDetail.mockReturnValue({
      data: {
        id: "lecture-1",
        slug: "an-example-lecture",
        title: "An Example Lecture",
        description: "Useful lecture description.",
        format: "single",
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

    await render(<LectureDetailScreen slug="lecture-1" />);

    expect(screen.getByText("An Example Lecture")).toBeTruthy();
    expect(screen.getByText("Meta:Ibn Baz")).toBeTruthy();
    expect(screen.getByText("Topics:2")).toBeTruthy();
    expect(screen.getByText("Useful lecture description.")).toBeTruthy();
    expect(screen.getByText("Series:Important Series")).toBeTruthy();
  }, 15000);
});
