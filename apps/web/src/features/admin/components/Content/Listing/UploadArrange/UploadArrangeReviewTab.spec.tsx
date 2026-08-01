import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "bun:test";

import type {
  UploadArrangeState,
  UploadItem,
} from "@/features/admin/hooks/Content/useUploadArrangeState";

import { UploadArrangeReviewTab } from "./UploadArrangeReviewTab";

vi.mock("@/core/i18n/use-translation", () => ({
  useTranslation: () => ({
    t: (_key: string, fallback: string) => fallback,
  }),
}));

function makeItem(overrides: Partial<UploadItem> = {}): UploadItem {
  return {
    id: "item-1",
    source: { kind: "url", url: "https://archive.org/download/Item/Lesson.mp3" },
    filename: "Lesson.mp3",
    title: "Lesson",
    numericPrefix: null,
    durationSeconds: 120,
    sizeBytes: 120_000_000,
    contentType: "audio/mpeg",
    ext: "mp3",
    assignment: {
      kind: "new-lesson",
      moduleKey: "root",
      slug: "series-lesson",
      slugEdited: false,
      description: "",
      status: "draft",
      orderIndex: 1,
    },
    suggestion: null,
    upload: { status: "pending", percent: 0 },
    ...overrides,
  };
}

function baseState(items: UploadItem[]): UploadArrangeState {
  return {
    existing: {
      id: "series-1",
      slug: "series",
      title: "Series",
      format: "series",
      scholarId: "scholar-1",
      status: "published",
      modules: [],
      lessons: [],
    },
    items,
    newModules: [],
    phase: "uploading",
    error: null,
    conflictSlugs: [],
  };
}

describe("UploadArrangeReviewTab", () => {
  it("shows byte-formatted progress while downloading a url-sourced item", () => {
    const item = makeItem({
      upload: {
        status: "downloading",
        percent: 40,
        loadedBytes: 48_000_000,
        totalBytes: 120_000_000,
      },
    });
    render(<UploadArrangeReviewTab state={baseState([item])} dispatch={vi.fn()} />);

    expect(screen.getByText(/45\.8 MB \/ 114\.4 MB/)).toBeInTheDocument();
    expect(screen.getByText(/downloading/i)).toBeInTheDocument();
  });

  it("shows byte-formatted progress while uploading, distinct from downloading", () => {
    const item = makeItem({
      upload: {
        status: "uploading",
        percent: 75,
        loadedBytes: 90_000_000,
        totalBytes: 120_000_000,
      },
    });
    render(<UploadArrangeReviewTab state={baseState([item])} dispatch={vi.fn()} />);

    expect(screen.getByText(/85\.8 MB \/ 114\.4 MB/)).toBeInTheDocument();
    expect(screen.getByText(/uploading/i)).toBeInTheDocument();
  });

  it("does not show a byte-progress line for a pending item", () => {
    const item = makeItem();
    render(
      <UploadArrangeReviewTab
        state={{ ...baseState([item]), phase: "editing" }}
        dispatch={vi.fn()}
      />,
    );

    expect(screen.queryByText(/MB \//)).not.toBeInTheDocument();
  });
});
