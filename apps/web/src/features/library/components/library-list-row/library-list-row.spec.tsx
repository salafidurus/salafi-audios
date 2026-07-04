import { vi } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";
import type { LibraryItemDto } from "@sd/core-contracts";
import { LibraryListRow } from "./library-list-row";
import styles from "./library-list-row.module.css";

vi.mock("@/features/i18n/content-preference", () => ({
  useShowOriginalContent: () => false,
}));

vi.mock("@/core/i18n/use-translation", () => ({
  useTranslation: () => ({
    t: (key: string, fallback?: string, options?: Record<string, any>) => {
      let result = fallback ?? key;
      if (options) {
        Object.entries(options).forEach(([k, v]) => {
          result = result.replace(`{{${k}}}`, String(v));
        });
      }
      return result;
    },
  }),
}));

const mockItem: LibraryItemDto = {
  id: "lib-1",
  lectureId: "lec-1",
  lectureTitle: "Explanation of Three Principles",
  lectureSlug: "explanation-of-three-principles",
  scholarId: "sch-1",
  scholarSlug: "bin-baz",
  scholarName: "Abdul-Aziz bin Baz",
  durationSeconds: 3600,
  progressSeconds: 1800,
  savedAt: "2026-07-04T08:00:00.000Z",
  completedAt: "2026-07-04T10:00:00.000Z",
};

describe("LibraryListRow", () => {
  it("renders basic metadata correctly with fallback initial", () => {
    render(<LibraryListRow item={mockItem} variant="saved" />);

    expect(screen.getByText("Explanation of Three Principles")).toBeInTheDocument();
    expect(screen.getByText("Abdul-Aziz bin Baz")).toBeInTheDocument();
    expect(screen.getByText("A")).toBeInTheDocument(); // Initial of Abdul-Aziz
  });

  it("links to the lecture details using lectureSlug", () => {
    render(<LibraryListRow item={mockItem} variant="saved" />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/listing/explanation-of-three-principles");
  });

  it("renders saved date when variant is saved", () => {
    render(<LibraryListRow item={mockItem} variant="saved" />);
    expect(screen.getByText(/Saved/)).toBeInTheDocument();
  });

  it("renders completed date when variant is completed", () => {
    render(<LibraryListRow item={mockItem} variant="completed" />);
    expect(screen.getByText(/Completed/)).toBeInTheDocument();
  });

  it("renders progress percentage and bar when variant is progress", () => {
    const { container } = render(<LibraryListRow item={mockItem} variant="progress" />);

    expect(screen.getByText(/50% listened/)).toBeInTheDocument();
    const progressBar = container.querySelector(`.${styles.progressBar}`);
    expect(progressBar).toBeInTheDocument();
    expect((progressBar as HTMLElement).style.width).toBe("50%");
  });
});
