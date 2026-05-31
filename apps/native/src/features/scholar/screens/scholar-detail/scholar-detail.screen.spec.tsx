import React from "react";
import renderer, { act } from "react-test-renderer";
import { useScholarDetailScreen } from "@sd/domain-content";
import { ScholarDetailScreen } from "./scholar-detail.screen";

jest.mock("@sd/domain-content", () => ({
  useScholarDetailScreen: jest.fn(),
}));

jest.mock("../../../../shared/components/ScreenView/ScreenView", () => ({
  ScreenView: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock("../../../../shared/components/AppText/AppText", () => ({
  AppText: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock("../../components/scholar-header/scholar-header", () => ({
  ScholarHeader: ({ scholar }: { scholar: { name: string } }) => `Header:${scholar.name}`,
}));

jest.mock("../../components/scholar-content-list/scholar-content-list", () => ({
  ScholarContentList: ({ content }: { content: { collections: unknown[] } }) =>
    `Content:${content.collections.length}`,
}));

const mockedUseScholarDetailScreen = jest.mocked(useScholarDetailScreen);

describe("ScholarDetailScreen", () => {
  it("renders a loading state while scholar detail is fetching", () => {
    mockedUseScholarDetailScreen.mockReturnValue({
      scholar: undefined,
      content: undefined,
      isFetching: true,
    });

    let tree: ReturnType<typeof renderer.create>;

    act(() => {
      tree = renderer.create(<ScholarDetailScreen slug="ibn-baz" />);
    });

    expect(tree!.toJSON()).toBe("Loading scholar…");
  });

  it("renders an empty state when the scholar is missing", () => {
    mockedUseScholarDetailScreen.mockReturnValue({
      scholar: undefined,
      content: undefined,
      isFetching: false,
    });

    let tree: ReturnType<typeof renderer.create>;

    act(() => {
      tree = renderer.create(<ScholarDetailScreen slug="missing" />);
    });

    expect(tree!.toJSON()).toBe("Scholar not found");
  });

  it("renders the scholar header and content when data exists", () => {
    mockedUseScholarDetailScreen.mockReturnValue({
      scholar: {
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
      },
      content: {
        collections: [
          { id: "collection-1", slug: "collection", title: "Collection", lectureCount: 2 },
        ],
        standaloneSeries: [],
        standaloneLectures: [],
      },
      isFetching: false,
    });

    let tree: ReturnType<typeof renderer.create>;

    act(() => {
      tree = renderer.create(<ScholarDetailScreen slug="ibn-baz" />);
    });

    expect(JSON.stringify(tree!.toJSON())).toContain("Header:Ibn Baz");
    expect(JSON.stringify(tree!.toJSON())).toContain("Content:1");
  });
});
