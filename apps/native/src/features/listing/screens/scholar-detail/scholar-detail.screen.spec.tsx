import React from "react";
import { render, screen, fireEvent } from "@testing-library/react-native";
import { useScholarDetail, useScholarContent, useScholarTopics } from "@sd/domain-content";
import { ScholarDetailScreen } from "./scholar-detail.screen";

jest.mock("react-native-reanimated", () => ({
  // Mock Animated API
  useSharedValue: jest.fn((value) => ({ value })),
  useAnimatedStyle: jest.fn(() => ({})),
  useAnimatedReaction: jest.fn(),
  runOnJS: jest.fn((fn) => fn),
  interpolate: jest.fn(),
  Extrapolate: { CLAMP: "clamp" },
}));

jest.mock("react-native-unistyles", () => ({
  StyleSheet: {
    create: (styles: Record<string, unknown>) => styles,
  },
  useUnistyles: jest.fn(() => ({
    theme: {
      colors: {
        content: {
          muted: "#999999",
          base: "#000000",
          active: "#0066cc",
        },
        surface: {
          canvas: "#ffffff",
          inverse: "#1a1a1a",
        },
        border: {
          default: "#e0e0e0",
        },
      },
    },
    styles: {
      topicHeader: {},
      topicContent: {},
      chevronCollapsed: {},
    },
    screen: {},
  })),
}));

jest.mock("@sd/domain-content", () => ({
  useScholarDetail: jest.fn(),
  useScholarContent: jest.fn(),
  useScholarTopics: jest.fn(),
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

jest.mock("@/features/listing/components/scholar-header/scholar-header", () => ({
  ScholarHeader: ({ scholar }: { scholar: { name: string } }) => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const ReactM = require("react");
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { Text } = require("react-native");
    return ReactM.createElement(Text, null, `Header:${scholar.name}`);
  },
}));

jest.mock("@/features/listing/components/scholar-content-list/scholar-content-list", () => ({
  ScholarContentList: ({ items }: { items: unknown[] }) => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const ReactM = require("react");
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { Text } = require("react-native");
    return ReactM.createElement(Text, null, `Content:${items.length}`);
  },
}));

const mockedUseScholarDetail = jest.mocked(useScholarDetail) as any;
const mockedUseScholarContent = jest.mocked(useScholarContent) as any;
const mockedUseScholarTopics = jest.mocked(useScholarTopics) as any;

const baseScholar = {
  id: "scholar-1",
  slug: "ibn-baz",
  name: "Ibn Baz",
  bio: undefined,
  imageUrl: undefined,
  country: undefined,
  mainLanguage: undefined,
  isActive: true,
  isKibar: true,
  socialTelegram: undefined,
  socialTwitter: undefined,
  socialWebsite: undefined,
  socialYoutube: undefined,
  createdAt: "2026-04-11T00:00:00.000Z",
  lectureCount: 12,
  seriesCount: 3,
  totalDurationSeconds: 3600,
};

const singleItem = {
  id: "lecture-1",
  slug: "lecture",
  title: "A Lecture",
  type: "single" as const,
  recencyAt: "2024-01-01T00:00:00Z",
  durationSeconds: 1800,
};

describe("ScholarDetailScreen", () => {
  beforeEach(() => {
    mockedUseScholarTopics.mockReturnValue({ data: undefined, isFetching: false });
  });

  it("renders a loading state while scholar detail is fetching", async () => {
    mockedUseScholarDetail.mockReturnValue({
      data: undefined,
      isFetching: true,
    });
    mockedUseScholarContent.mockReturnValue({
      data: undefined,
      isFetching: false,
    });

    await render(<ScholarDetailScreen slug="ibn-baz" />);

    expect(screen.getByText("Loading scholar…")).toBeTruthy();
  });

  it("renders an empty state when the scholar is missing", async () => {
    mockedUseScholarDetail.mockReturnValue({
      data: undefined,
      isFetching: false,
    });
    mockedUseScholarContent.mockReturnValue({
      data: undefined,
      isFetching: false,
    });

    await render(<ScholarDetailScreen slug="missing" />);

    expect(screen.getByText("Scholar not found")).toBeTruthy();
  });

  it("renders the scholar header and content when data exists", async () => {
    mockedUseScholarDetail.mockReturnValue({ data: baseScholar, isFetching: false });
    mockedUseScholarContent.mockReturnValue({
      data: { items: [singleItem] },
      isFetching: false,
    });

    await render(<ScholarDetailScreen slug="ibn-baz" />);

    expect(screen.getByText("Header:Ibn Baz")).toBeTruthy();
    expect(screen.getByText("Content:1")).toBeTruthy();
  }, 15000);

  it("renders topic sections when topics data is present", async () => {
    mockedUseScholarDetail.mockReturnValue({ data: baseScholar, isFetching: false });
    mockedUseScholarContent.mockReturnValue({
      data: { items: [singleItem] },
      isFetching: false,
    });
    mockedUseScholarTopics.mockReturnValue({
      data: {
        topics: [
          { topicId: "t1", topicName: "Aqeedah", items: [singleItem] },
          { topicId: "t2", topicName: "Fiqh", items: [singleItem] },
        ],
      },
      isFetching: false,
    });

    await render(<ScholarDetailScreen slug="ibn-baz" />);

    expect(screen.getByText("Aqeedah")).toBeTruthy();
    expect(screen.getByText("Fiqh")).toBeTruthy();
  });

  it("tapping a topic header expands and collapses its section", async () => {
    mockedUseScholarDetail.mockReturnValue({ data: baseScholar, isFetching: false });
    mockedUseScholarContent.mockReturnValue({
      data: { items: [singleItem] },
      isFetching: false,
    });
    mockedUseScholarTopics.mockReturnValue({
      data: {
        topics: [
          {
            topicId: "t1",
            topicName: "Aqeedah",
            items: [
              { ...singleItem, id: "lecture-1", title: "Lesson on Tawheed" },
              { ...singleItem, id: "lecture-2", title: "Lesson on Shirk" },
            ],
          },
        ],
      },
      isFetching: false,
    });

    await render(<ScholarDetailScreen slug="ibn-baz" />);

    expect(screen.getByText("Lesson on Tawheed")).toBeTruthy();
    expect(screen.getByText("Lesson on Shirk")).toBeTruthy();

    const topicHeader = screen.getByText("Aqeedah");
    await fireEvent.press(topicHeader);

    expect(screen.queryByText("Lesson on Tawheed")).toBeNull();
    expect(screen.queryByText("Lesson on Shirk")).toBeNull();

    await fireEvent.press(topicHeader);

    expect(screen.getByText("Lesson on Tawheed")).toBeTruthy();
    expect(screen.getByText("Lesson on Shirk")).toBeTruthy();
  });
});
