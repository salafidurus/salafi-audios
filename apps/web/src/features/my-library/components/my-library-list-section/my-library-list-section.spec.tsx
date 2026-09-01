import type { MyLibraryItemDto } from "@sd/core-contracts";

import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "bun:test";
import React from "react";

import { MyLibraryListSection } from "./my-library-list-section";

const item: MyLibraryItemDto = {
  id: "myLibrary-1",
  listingId: "listing-1",
  listingTitle: "A lesson",
  listingSlug: "a-lesson",
  scholarId: "scholar-1",
  scholarSlug: "scholar-1",
  scholarName: "A Scholar",
};

vi.mock("@/core/i18n/use-translation", () => ({
  useTranslation: () => ({
    t: (_key: string, fallback?: string) => fallback ?? "translated",
  }),
}));

vi.mock("@/shared/components/AuthRequiredState/AuthRequiredState", () => ({
  AuthRequiredState: ({ title, description }: { title: string; description: string }) => (
    <div data-testid="auth-required-state">
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  ),
}));

vi.mock("@/shared/components/InfiniteScrollList", () => ({
  InfiniteScrollList: ({
    data,
    isLoading,
    isError,
    hasMore,
    onLoadMore,
    isFetchingNextPage,
    emptyMessage,
    renderItem,
  }: {
    data: MyLibraryItemDto[];
    isLoading: boolean;
    isError: boolean;
    hasMore: boolean;
    onLoadMore: () => void;
    isFetchingNextPage?: boolean;
    emptyMessage: string;
    renderItem: (item: MyLibraryItemDto) => React.ReactNode;
  }) => (
    <div data-testid="infinite-scroll-list">
      {isLoading && <p>Loading lessons</p>}
      {isError && <p>Could not load lessons</p>}
      {hasMore && (
        <button type="button" data-testid="load-more" onClick={onLoadMore}>
          {isFetchingNextPage ? "Loading more" : "Load more"}
        </button>
      )}
      {!isLoading && !isError && data.length === 0 && <p>{emptyMessage}</p>}
      {!isLoading &&
        !isError &&
        data.map((entry) => <React.Fragment key={entry.id}>{renderItem(entry)}</React.Fragment>)}
    </div>
  ),
}));

const defaultProps = {
  title: "Continue listening",
  description: "Resume your study.",
  variant: "progress" as const,
  authState: "authenticated" as const,
  query: {
    items: [item],
    isLoading: false,
    isError: false,
    onRetry: vi.fn(),
    hasMore: false,
    onLoadMore: vi.fn(),
    emptyMessage: "Nothing here yet.",
  },
  authCopy: {
    title: "Sign in",
    description: "Sign in to continue.",
    loadingMessage: "Checking your My Library…",
  },
};

describe("MyLibraryListSection", () => {
  it("keeps the sign-in state hidden while authentication resolves", () => {
    render(<MyLibraryListSection {...defaultProps} authState="loading" />);

    expect(screen.getByText("Checking your My Library…")).toBeInTheDocument();
    expect(screen.queryByTestId("auth-required-state")).not.toBeInTheDocument();
  });

  it("renders the auth-required state after an unauthenticated result", () => {
    render(<MyLibraryListSection {...defaultProps} authState="unauthenticated" />);

    expect(screen.getByTestId("auth-required-state")).toHaveTextContent("Sign in");
    expect(screen.queryByTestId("infinite-scroll-list")).not.toBeInTheDocument();
  });

  it("delegates authenticated loading, error, empty, and item states", () => {
    const { rerender } = render(
      <MyLibraryListSection {...defaultProps} query={{ ...defaultProps.query, isLoading: true }} />,
    );
    expect(screen.getByText("Loading lessons")).toBeInTheDocument();

    rerender(
      <MyLibraryListSection {...defaultProps} query={{ ...defaultProps.query, isError: true }} />,
    );
    expect(screen.getByText("Could not load lessons")).toBeInTheDocument();

    rerender(
      <MyLibraryListSection {...defaultProps} query={{ ...defaultProps.query, items: [] }} />,
    );
    expect(screen.getByText("Nothing here yet.")).toBeInTheDocument();

    rerender(<MyLibraryListSection {...defaultProps} />);
    expect(screen.getByText("A lesson")).toBeInTheDocument();
  });

  it("delegates cursor pagination state and loading-more action", () => {
    const onLoadMore = vi.fn();

    render(
      <MyLibraryListSection
        {...defaultProps}
        query={{
          ...defaultProps.query,
          hasMore: true,
          isFetchingNextPage: true,
          onLoadMore,
        }}
      />,
    );

    expect(screen.getByTestId("load-more")).toHaveTextContent("Loading more");
    screen.getByTestId("load-more").click();
    expect(onLoadMore).toHaveBeenCalledTimes(1);
  });
});
