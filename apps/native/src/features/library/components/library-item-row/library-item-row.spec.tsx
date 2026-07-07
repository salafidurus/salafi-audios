import React from "react";
import { render, screen, fireEvent } from "@testing-library/react-native";
import type { LibraryItemDto } from "@sd/core-contracts";
import { LibraryItemRow } from "./library-item-row";

jest.mock("lucide-react-native", () => ({
  Bookmark: "Bookmark",
  Clock: "Clock",
  CheckCircle: "CheckCircle",
}));

jest.mock("@sd/core-i18n", () => ({
  pickContentField: (title: string) => title,
}));

jest.mock("@/core/i18n/use-translation", () => ({
  useTranslation: () => ({
    t: (_key: string, fallback?: string, vars?: Record<string, unknown>) =>
      (fallback ?? _key).replace(/\{\{(\w+)\}\}/g, (_m: string, name: string) =>
        String(vars?.[name] ?? ""),
      ),
    i18n: { language: "en" },
  }),
}));

jest.mock("@/features/settings/content-preference", () => ({
  useShowOriginalContent: () => false,
}));

jest.mock("@/shared/components/AppText/AppText", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require("react");
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { Text } = require("react-native");
  return {
    AppText: ({
      children,
      style,
      numberOfLines,
    }: {
      children: React.ReactNode;
      style?: unknown;
      numberOfLines?: number;
    }) => React.createElement(Text, { style, numberOfLines }, children),
  };
});

const baseItem: LibraryItemDto = {
  id: "item-1",
  listingId: "lecture-1",
  listingTitle: "The Book of Tawheed",
  listingSlug: "book-of-tawheed",
  scholarId: "scholar-1",
  scholarSlug: "ibn-baz",
  scholarName: "Ibn Baz",
  seriesTitle: "Explanation of Tawheed",
  durationSeconds: 3600,
  progressSeconds: 900,
  savedAt: "2026-06-01T00:00:00Z",
  completedAt: undefined,
};

describe("LibraryItemRow", () => {
  it("renders lecture title", async () => {
    await render(<LibraryItemRow item={baseItem} variant="saved" />);
    expect(screen.getByText("The Book of Tawheed")).toBeTruthy();
  });

  it("renders scholar name and series", async () => {
    await render(<LibraryItemRow item={baseItem} variant="saved" />);
    expect(screen.getByText(/Ibn Baz/)).toBeTruthy();
  });

  it("shows duration in minutes", async () => {
    await render(<LibraryItemRow item={baseItem} variant="saved" />);
    expect(screen.getByText(/60 min/)).toBeTruthy();
  });

  it("shows Bookmark icon for saved variant", async () => {
    await render(<LibraryItemRow item={baseItem} variant="saved" />);
    expect(screen.getByTestId("library-item-icon-saved")).toBeTruthy();
  });

  it("shows Clock icon for progress variant", async () => {
    await render(<LibraryItemRow item={baseItem} variant="progress" />);
    expect(screen.getByTestId("library-item-icon-progress")).toBeTruthy();
  });

  it("shows CheckCircle icon for completed variant", async () => {
    await render(
      <LibraryItemRow
        item={{ ...baseItem, completedAt: "2026-06-15T00:00:00Z" }}
        variant="completed"
      />,
    );
    expect(screen.getByTestId("library-item-icon-completed")).toBeTruthy();
  });

  it("shows progress bar for progress variant", async () => {
    await render(<LibraryItemRow item={baseItem} variant="progress" />);
    expect(screen.getByTestId("library-progress-bar")).toBeTruthy();
  });

  it("shows saved date for saved variant", async () => {
    await render(<LibraryItemRow item={baseItem} variant="saved" />);
    expect(screen.getByText(/Saved/)).toBeTruthy();
  });

  it("shows completed date for completed variant", async () => {
    await render(
      <LibraryItemRow
        item={{ ...baseItem, completedAt: "2026-06-15T00:00:00Z" }}
        variant="completed"
      />,
    );
    expect(screen.getByText(/Completed/)).toBeTruthy();
  });

  it("shows progress percentage for progress variant", async () => {
    await render(<LibraryItemRow item={baseItem} variant="progress" />);
    expect(screen.getByText(/25%/)).toBeTruthy();
  });

  it("calls onPress when pressed", async () => {
    const onPress = jest.fn();
    await render(<LibraryItemRow item={baseItem} variant="saved" onPress={onPress} />);
    await fireEvent.press(screen.getByText("The Book of Tawheed").parent!);
    expect(onPress).toHaveBeenCalled();
  });
});
