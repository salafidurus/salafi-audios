import { describe, it, expect, vi, beforeEach } from "bun:test";
import { render, screen } from "@testing-library/react";
import { ScholarDetailScreen } from "./scholar-detail.screen";
import { useScholarDetail } from "@sd/domain-content";

vi.mock("@/shared/hooks/use-responsive", () => ({
  useIsDesktop: vi.fn().mockReturnValue(true),
}));

vi.mock("@sd/domain-content", () => ({
  useScholarDetail: vi.fn(),
  useScholarContent: vi.fn(),
  useScholarTopics: vi.fn(),
}));

vi.mock("@/shared/components/ScreenView/ScreenView", () => ({
  ScreenView: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/shared/components/AppText/AppText", () => ({
  AppText: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
}));

vi.mock("@/features/listing/components/scholar/scholar-header/scholar-header", () => ({
  ScholarHeader: ({ scholar }: { scholar: { name: string } }) => <div>Header:{scholar.name}</div>,
}));

vi.mock("@/features/listing/components/scholar/scholar-content-list/scholar-content-list", () => ({
  ScholarContentList: ({ slug }: { slug: string }) => <div>Content:{slug}</div>,
}));

const mockDetail = vi.mocked(useScholarDetail);

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
  mockDetail.mockReturnValue({ data: undefined, isFetching: false } as ReturnType<
    typeof useScholarDetail
  >);
});

describe("ScholarDetailScreen", () => {
  it("shows loading state", () => {
    mockDetail.mockReturnValue({ data: undefined, isFetching: true } as ReturnType<
      typeof useScholarDetail
    >);
    render(<ScholarDetailScreen slug="ibn-baz" />);
    expect(screen.getByText("Loading scholar…")).toBeTruthy();
  });

  it("shows not-found state", () => {
    render(<ScholarDetailScreen slug="missing" />);
    expect(screen.getByText("Scholar not found")).toBeTruthy();
  });

  it("renders header and content list with slug", () => {
    mockDetail.mockReturnValue({ data: mockScholar, isFetching: false } as ReturnType<
      typeof useScholarDetail
    >);
    render(<ScholarDetailScreen slug="ibn-baz" />);
    expect(screen.getByText("Header:Ibn Baz")).toBeTruthy();
    expect(screen.getByText("Content:ibn-baz")).toBeTruthy();
  });

  it("renders no isKibar badge", () => {
    mockDetail.mockReturnValue({ data: mockScholar, isFetching: false } as ReturnType<
      typeof useScholarDetail
    >);
    render(<ScholarDetailScreen slug="ibn-baz" />);
    expect(screen.queryByText(/kibar/i)).toBeNull();
  });
});
