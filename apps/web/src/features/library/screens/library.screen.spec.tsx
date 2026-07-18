import { describe, it, expect, beforeEach, vi } from "bun:test";
import React from "react";
import { render, screen } from "@testing-library/react";
import { LibraryScreen } from "./library.screen";
import { LibrarySavedScreen } from "./library-saved.screen";
import { LibraryCompletedScreen } from "./library-completed.screen";

const mockUseAuth = vi.fn(() => ({ isAuthenticated: true }));

vi.mock("@/core/auth/use-auth", () => ({
  useAuth: () => mockUseAuth(),
}));

vi.mock("@/core/i18n/use-translation", () => ({
  useTranslation: () => ({
    t: (key: string, fallback?: string) => fallback ?? key,
  }),
}));

vi.mock("@/shared/components/ScreenView/ScreenView", () => ({
  ScreenView: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="screen-view">{children}</div>
  ),
}));

vi.mock("@/shared/components/PageHeader", () => ({
  PageHeader: ({ title }: { title: string }) => <h1>{title}</h1>,
}));

vi.mock("../components/library-list-row/library-list-row", () => ({
  LibraryListRow: ({ item }: { item: any }) => (
    <div data-testid="library-row">{item.listingTitle}</div>
  ),
}));

vi.mock("@/shared/components/AuthRequiredState/AuthRequiredState", () => ({
  AuthRequiredState: ({ title, description }: any) => (
    <div data-testid="auth-required-state">
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  ),
}));

vi.mock("@/shared/components/InfiniteScrollList", () => ({
  InfiniteScrollList: (props: any) => {
    const mockItems = [
      {
        id: "lib-1",
        listingId: "lec-1",
        listingTitle: "Lecture Title 1",
        listingSlug: "lecture-title-1",
        scholarId: "sch-1",
        scholarSlug: "scholar-1",
        scholarName: "Scholar 1",
      },
    ];

    return (
      <div data-testid="infinite-scroll-list">
        {props.renderItem &&
          mockItems.map((item: any) => <div key={item.id}>{props.renderItem(item)}</div>)}
      </div>
    );
  },
}));

describe("Library screens", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({ isAuthenticated: true });
  });

  describe("LibraryScreen (Started)", () => {
    it("renders loading state", () => {
      render(<LibraryScreen />);
      expect(screen.getByTestId("infinite-scroll-list")).toBeInTheDocument();
    });

    it("renders empty state", () => {
      render(<LibraryScreen />);
      expect(screen.getByTestId("infinite-scroll-list")).toBeInTheDocument();
    });

    it("renders items", () => {
      render(<LibraryScreen />);
      expect(screen.getByTestId("library-row")).toHaveTextContent("Lecture Title 1");
    });

    it("renders AuthRequiredState when unauthenticated", () => {
      mockUseAuth.mockReturnValue({ isAuthenticated: false });
      render(<LibraryScreen />);
      expect(screen.getByTestId("auth-required-state")).toBeInTheDocument();
      expect(screen.getByText("Sign in to view your progress")).toBeInTheDocument();
    });
  });

  describe("LibrarySavedScreen (Saved)", () => {
    it("renders loading state", () => {
      render(<LibrarySavedScreen />);
      expect(screen.getByTestId("infinite-scroll-list")).toBeInTheDocument();
    });

    it("renders empty state", () => {
      render(<LibrarySavedScreen />);
      expect(screen.getByTestId("infinite-scroll-list")).toBeInTheDocument();
    });

    it("renders items", () => {
      render(<LibrarySavedScreen />);
      expect(screen.getByTestId("library-row")).toHaveTextContent("Lecture Title 1");
    });

    it("renders AuthRequiredState when unauthenticated", () => {
      mockUseAuth.mockReturnValue({ isAuthenticated: false });
      render(<LibrarySavedScreen />);
      expect(screen.getByTestId("auth-required-state")).toBeInTheDocument();
      expect(screen.getByText("Sign in to view saved lectures")).toBeInTheDocument();
    });
  });

  describe("LibraryCompletedScreen (Completed)", () => {
    it("renders loading state", () => {
      render(<LibraryCompletedScreen />);
      expect(screen.getByTestId("infinite-scroll-list")).toBeInTheDocument();
    });

    it("renders empty state", () => {
      render(<LibraryCompletedScreen />);
      expect(screen.getByTestId("infinite-scroll-list")).toBeInTheDocument();
    });

    it("renders items", () => {
      render(<LibraryCompletedScreen />);
      expect(screen.getByTestId("library-row")).toHaveTextContent("Lecture Title 1");
    });

    it("renders AuthRequiredState when unauthenticated", () => {
      mockUseAuth.mockReturnValue({ isAuthenticated: false });
      render(<LibraryCompletedScreen />);
      expect(screen.getByTestId("auth-required-state")).toBeInTheDocument();
      expect(screen.getByText("Sign in to view completed history")).toBeInTheDocument();
    });
  });
});
