import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { ScholarDetailDesktopScreen } from "./scholar-detail.screen.desktop";

vi.mock("@sd/domain-content", () => ({
  useScholarDetail: vi.fn(),
  useScholarContent: vi.fn(),
}));

vi.mock("@/shared/components/ScreenView/ScreenView", () => ({
  ScreenView: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/shared/components/AppText/AppText", () => ({
  AppText: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
}));

vi.mock("@/features/scholar/components/scholar-header/scholar-header", () => ({
  ScholarHeader: ({ scholar }: { scholar: { name: string } }) => <div>Header:{scholar.name}</div>,
}));

vi.mock("@/features/scholar/components/scholar-content-list/scholar-content-list", () => ({
  ScholarContentList: ({ items }: { items: unknown[] }) => <div>Content:{items.length}</div>,
}));

import { useScholarDetail, useScholarContent } from "@sd/domain-content";

const mockDetail = vi.mocked(useScholarDetail);
const mockContent = vi.mocked(useScholarContent);

const mockScholar = {
  id: "s1",
  slug: "ibn-baz",
  name: "Ibn Baz",
  isActive: true,
  isKibar: false,
  createdAt: "2024-01-01T00:00:00Z",
  lectureCount: 10,
  seriesCount: 2,
  totalDurationSeconds: 3600,
};

beforeEach(() => {
  mockDetail.mockReturnValue({ data: undefined, isFetching: false } as ReturnType<typeof useScholarDetail>);
  mockContent.mockReturnValue({ data: undefined, isFetching: false } as ReturnType<typeof useScholarContent>);
});

describe("ScholarDetailDesktopScreen", () => {
  it("shows loading state", () => {
    mockDetail.mockReturnValue({ data: undefined, isFetching: true } as ReturnType<typeof useScholarDetail>);
    render(<ScholarDetailDesktopScreen slug="ibn-baz" />);
    expect(screen.getByText("Loading scholar…")).toBeTruthy();
  });

  it("shows not-found state", () => {
    render(<ScholarDetailDesktopScreen slug="missing" />);
    expect(screen.getByText("Scholar not found")).toBeTruthy();
  });

  it("renders header and content with unified items", () => {
    mockDetail.mockReturnValue({ data: mockScholar, isFetching: false } as ReturnType<typeof useScholarDetail>);
    mockContent.mockReturnValue({
      data: {
        items: [
          {
            id: "1",
            slug: "s",
            title: "T",
            type: "single",
            recencyAt: "2024-01-01T00:00:00Z",
          },
        ],
      },
      isFetching: false,
    } as ReturnType<typeof useScholarContent>);
    render(<ScholarDetailDesktopScreen slug="ibn-baz" />);
    expect(screen.getByText("Header:Ibn Baz")).toBeTruthy();
    expect(screen.getByText("Content:1")).toBeTruthy();
  });

  it("renders empty content when items is empty", () => {
    mockDetail.mockReturnValue({ data: mockScholar, isFetching: false } as ReturnType<typeof useScholarDetail>);
    mockContent.mockReturnValue({
      data: { items: [] },
      isFetching: false,
    } as ReturnType<typeof useScholarContent>);
    render(<ScholarDetailDesktopScreen slug="ibn-baz" />);
    expect(screen.getByText("Content:0")).toBeTruthy();
  });

  it("renders no isKibar badge", () => {
    mockDetail.mockReturnValue({ data: mockScholar, isFetching: false } as ReturnType<typeof useScholarDetail>);
    mockContent.mockReturnValue({
      data: { items: [] },
      isFetching: false,
    } as ReturnType<typeof useScholarContent>);
    render(<ScholarDetailDesktopScreen slug="ibn-baz" />);
    expect(screen.queryByText(/kibar/i)).toBeNull();
  });
});
