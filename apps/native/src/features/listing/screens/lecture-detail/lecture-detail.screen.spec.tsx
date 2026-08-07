import { useListingContents, useListingDetail } from "@sd/domain-content";
import { fireEvent, render, screen } from "@testing-library/react-native";
import React from "react";

import { LectureDetailScreen } from "./lecture-detail.screen";

const mockRouterReplace = jest.fn();
const mockUseLocalSearchParams = jest.fn(() => ({ slug: "lecture-1" }) as Record<string, string>);
const mockIsSaved = jest.fn(() => false);
const mockMarkSaved = jest.fn();
const mockMarkUnsaved = jest.fn();

jest.mock("expo-router", () => ({
  router: { replace: (...args: unknown[]) => mockRouterReplace(...args) },
  useLocalSearchParams: () => mockUseLocalSearchParams(),
}));

jest.mock("@/features/listing/components/listing-content-view/listing-content-view", () => ({
  ListingContentView: ({ highlightItemId }: { highlightItemId?: string }) => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const ReactM = require("react");
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { Text } = require("react-native");
    return ReactM.createElement(Text, null, `Contents anchor:${highlightItemId ?? "none"}`);
  },
}));

jest.mock("react-native-unistyles", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { lightNativeTheme } = require("@/core/styles/theme");
  return {
    StyleSheet: {
      create: (styles: unknown) =>
        typeof styles === "function" ? styles(lightNativeTheme) : styles,
    },
    useUnistyles: () => ({
      theme: lightNativeTheme,
    }),
  };
});

jest.mock("@sd/domain-content", () => ({
  useListingDetail: jest.fn(),
  useListingContents: jest.fn(() => ({ data: undefined })),
  useIsSaved: () => mockIsSaved(),
  markSaved: (...args: unknown[]) => mockMarkSaved(...args),
  markUnsaved: (...args: unknown[]) => mockMarkUnsaved(...args),
}));

jest.mock("@sd/domain-audio", () => {
  const actual = jest.requireActual("@sd/domain-audio");
  return {
    ...actual,
    useAudio: jest.fn(() => ({
      isPlaying: false,
      currentTrack: null,
      playListing: jest.fn(),
      pause: jest.fn(),
      resume: jest.fn(),
    })),
  };
});

jest.mock("@/features/audio", () => ({
  audioService: {
    playListing: jest.fn(),
    pause: jest.fn(),
    resume: jest.fn(),
  },
}));

const mockDownloadButton = jest.fn((_props: unknown) => null);
const mockDownloadProgress = jest.fn((_props: unknown) => null);

jest.mock("@/features/downloads/components/download-button/download-button", () => ({
  DownloadButton: (props: unknown) => {
    mockDownloadButton(props);
    return null;
  },
}));

jest.mock("@/features/downloads/components/download-progress/download-progress", () => ({
  DownloadProgress: (props: unknown) => {
    mockDownloadProgress(props);
    return null;
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
const mockedUseListingContents = jest.mocked(useListingContents) as any;
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { audioService } = require("@/features/audio");

beforeEach(() => {
  jest.clearAllMocks();
  mockedUseListingContents.mockReturnValue({ data: undefined });
  mockUseLocalSearchParams.mockReturnValue({ slug: "lecture-1" });
  mockIsSaved.mockReturnValue(false);
});

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
        },
      },
      isFetching: false,
      error: null,
    });

    await render(<LectureDetailScreen slug="lecture-1" />);

    expect(screen.getByText("An Example Lecture")).toBeTruthy();
    expect(screen.getByText("Ibn Baz")).toBeTruthy();
    expect(screen.getByText("Topics:2")).toBeTruthy();
    expect(screen.getByText("Useful lecture description.")).toBeTruthy();
    expect(screen.getByText("Series:Important Series")).toBeTruthy();
  }, 15000);

  it("plays the full ordered series queue, not just this one lesson, when the series' contents have loaded", async () => {
    mockedUseListingDetail.mockReturnValue({
      data: {
        id: "lesson-1",
        slug: "lesson-1",
        title: "Lesson 1",
        format: "single",
        language: "en",
        durationSeconds: 600,
        publishedAt: "2026-04-11T00:00:00.000Z",
        scholar: { id: "scholar-1", slug: "ibn-baz", name: "Ibn Baz", imageUrl: undefined },
        topics: [],
        primaryAudioAsset: { id: "asset-1", url: "https://s/lesson-1.mp3" },
        seriesContext: {
          seriesId: "series-1",
          seriesSlug: "series",
          seriesTitle: "Important Series",
        },
      },
      isFetching: false,
      error: null,
    });
    mockedUseListingContents.mockReturnValue({
      data: {
        format: "series",
        items: [
          {
            id: "lesson-1",
            slug: "lesson-1",
            title: "Lesson 1",
            orderIndex: 0,
            primaryAudioAsset: { id: "asset-1", url: "https://s/lesson-1.mp3" },
          },
          {
            id: "lesson-2",
            slug: "lesson-2",
            title: "Lesson 2",
            orderIndex: 1,
            primaryAudioAsset: { id: "asset-2", url: "https://s/lesson-2.mp3" },
          },
        ],
      },
    });

    await render(<LectureDetailScreen slug="lesson-1" />);
    await fireEvent.press(screen.getByText("Play"));

    expect(audioService.playListing).toHaveBeenCalledTimes(1);
    const [playedTrack, playedQueue] = audioService.playListing.mock.calls[0];
    expect(playedTrack.id).toBe("lesson-1");
    expect(playedQueue.map((t: { id: string }) => t.id)).toEqual(["lesson-1", "lesson-2"]);
  }, 15000);

  it("redirects to the root listing, anchored to itself, when the resolved listing is nested", async () => {
    mockedUseListingDetail.mockReturnValue({
      data: {
        id: "lesson-1",
        slug: "lesson-1",
        title: "Lesson 1",
        format: "single",
        scholar: { id: "scholar-1", slug: "ibn-baz", name: "Ibn Baz" },
        topics: [],
        primaryAudioAsset: null,
        seriesContext: null,
        rootListing: { id: "series-1", slug: "explanation-of-tawheed", title: "Explanation" },
      },
      isFetching: false,
      error: null,
    });

    await render(<LectureDetailScreen slug="lesson-1" />);

    expect(mockRouterReplace).toHaveBeenCalledWith(
      "/listings/explanation-of-tawheed?anchor=lesson-1",
    );
    expect(screen.getByText("Loading lecture…")).toBeTruthy();
  });

  it("renders the lesson list for a top-level series, passing the anchor query param through", async () => {
    mockUseLocalSearchParams.mockReturnValue({ slug: "series-1", anchor: "lesson-2" });
    mockedUseListingDetail.mockReturnValue({
      data: {
        id: "series-1",
        slug: "series-1",
        title: "Explanation of Tawheed",
        format: "series",
        scholar: { id: "scholar-1", slug: "ibn-baz", name: "Ibn Baz" },
        topics: [],
        primaryAudioAsset: null,
        seriesContext: null,
        rootListing: null,
      },
      isFetching: false,
      error: null,
    });
    mockedUseListingContents.mockReturnValue({
      data: { format: "series", items: [] },
    });

    await render(<LectureDetailScreen slug="series-1" />);

    expect(screen.getByText("Explanation of Tawheed")).toBeTruthy();
    expect(screen.getByText("Contents anchor:lesson-2")).toBeTruthy();
  });

  const singleLecture = {
    id: "lecture-1",
    slug: "lecture-1",
    title: "An Example Lecture",
    format: "single" as const,
    scholar: { id: "scholar-1", slug: "ibn-baz", name: "Ibn Baz" },
    topics: [],
    primaryAudioAsset: null,
    seriesContext: null,
    rootListing: null,
  };

  it("calls markSaved with id and slug when clicking Save", async () => {
    mockedUseListingDetail.mockReturnValue({ data: singleLecture, isFetching: false, error: null });

    await render(<LectureDetailScreen slug="lecture-1" />);
    await fireEvent.press(screen.getByLabelText("Save"));

    expect(mockMarkSaved).toHaveBeenCalledWith("lecture-1", "lecture-1");
  });

  it("calls markUnsaved with id and slug when clicking Saved", async () => {
    mockIsSaved.mockReturnValue(true);
    mockedUseListingDetail.mockReturnValue({ data: singleLecture, isFetching: false, error: null });

    await render(<LectureDetailScreen slug="lecture-1" />);
    await fireEvent.press(screen.getByLabelText("Unsave"));

    expect(mockMarkUnsaved).toHaveBeenCalledWith("lecture-1", "lecture-1");
  });

  it("passes the resolved listing's own slug (not the uuid id) through to markSaved", async () => {
    mockedUseListingDetail.mockReturnValue({
      data: { ...singleLecture, id: "uuid-1", slug: "tafsir-al-fatiha" },
      isFetching: false,
      error: null,
    });

    await render(<LectureDetailScreen slug="tafsir-al-fatiha" />);
    await fireEvent.press(screen.getByLabelText("Save"));

    expect(mockMarkSaved).toHaveBeenCalledWith("uuid-1", "tafsir-al-fatiha");
  });

  it("tags the standalone track with its own slug — progress sync resolves strictly by slug, not uuid", async () => {
    mockedUseListingDetail.mockReturnValue({
      data: { ...singleLecture, id: "uuid-1", slug: "tafsir-al-fatiha" },
      isFetching: false,
      error: null,
    });

    await render(<LectureDetailScreen slug="tafsir-al-fatiha" />);
    await fireEvent.press(screen.getByText("Play"));

    expect(audioService.playListing).toHaveBeenCalledTimes(1);
    const [playedTrack] = audioService.playListing.mock.calls[0];
    expect(playedTrack).toMatchObject({ id: "uuid-1", slug: "tafsir-al-fatiha" });
  });

  it("wires the lecture's id and audio url through to DownloadButton and DownloadProgress", async () => {
    mockedUseListingDetail.mockReturnValue({
      data: {
        ...singleLecture,
        primaryAudioAsset: { id: "asset-1", url: "https://s/lecture-1.mp3" },
      },
      isFetching: false,
      error: null,
    });

    await render(<LectureDetailScreen slug="lecture-1" />);

    expect(mockDownloadButton).toHaveBeenCalledWith(
      expect.objectContaining({ lectureId: "lecture-1", audioUrl: "https://s/lecture-1.mp3" }),
    );
    expect(mockDownloadProgress).toHaveBeenCalledWith(
      expect.objectContaining({ lectureId: "lecture-1" }),
    );
  });

  it("omits DownloadButton when the lecture has no audio asset", async () => {
    mockedUseListingDetail.mockReturnValue({ data: singleLecture, isFetching: false, error: null });

    await render(<LectureDetailScreen slug="lecture-1" />);

    expect(mockDownloadButton).not.toHaveBeenCalled();
  });
});
