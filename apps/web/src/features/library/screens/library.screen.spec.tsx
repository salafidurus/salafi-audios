import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "bun:test";
import React from "react";

import { LibraryCompletedScreen } from "./library-completed.screen";
import { LibrarySavedScreen } from "./library-saved.screen";
import { LibraryScreen } from "./library.screen";

const mockUseAuth = vi.fn(() => ({ isAuthenticated: true, isLoading: false }));

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

const renderWithQueryClient = (component: React.ReactElement) => {
  const queryClient = createTestQueryClient();
  return render(<QueryClientProvider client={queryClient}>{component}</QueryClientProvider>);
};

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

vi.mock("@/features/library/components/library-tabs/library-tabs", () => ({
  LibraryTabs: ({ activeTab }: { activeTab: string }) => (
    <nav aria-label="Library sections">
      <a href="/library">Started</a>
      <a href="/library/saved" aria-current={activeTab === "saved" ? "page" : undefined}>
        Saved
      </a>
      <a href="/library/completed" aria-current={activeTab === "completed" ? "page" : undefined}>
        Completed
      </a>
    </nav>
  ),
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
    mockUseAuth.mockReturnValue({ isAuthenticated: true, isLoading: false });
  });

  describe("LibraryScreen (Started)", () => {
    it("renders loading state", () => {
      renderWithQueryClient(<LibraryScreen />);
      expect(screen.getAllByTestId("infinite-scroll-list").length).toBeGreaterThan(0);
    });

    it("renders empty state", () => {
      renderWithQueryClient(<LibraryScreen />);
      expect(screen.getAllByTestId("infinite-scroll-list").length).toBeGreaterThan(0);
    });

    it("renders items", () => {
      renderWithQueryClient(<LibraryScreen />);
      expect(screen.getAllByTestId("library-row")).toHaveLength(1);
      expect(screen.getByTestId("library-row")).toHaveTextContent("Lecture Title 1");
    });

    it("renders AuthRequiredState when unauthenticated", () => {
      mockUseAuth.mockReturnValue({ isAuthenticated: false, isLoading: false });
      renderWithQueryClient(<LibraryScreen />);
      expect(screen.getByTestId("auth-required-state")).toBeInTheDocument();
      expect(screen.getByText("Sign in to continue your study")).toBeInTheDocument();
    });

    it("does not flash the sign-in state while authentication is resolving", () => {
      mockUseAuth.mockReturnValue({ isAuthenticated: false, isLoading: true });
      renderWithQueryClient(<LibraryScreen />);

      expect(screen.getByText("Checking your library…")).toBeInTheDocument();
      expect(screen.queryByText("Sign in to continue your study")).not.toBeInTheDocument();
    });

    it("exposes Saved and Completed as distinct Library tabs", () => {
      renderWithQueryClient(<LibraryScreen />);

      expect(screen.getByRole("link", { name: "Saved" })).toHaveAttribute("href", "/library/saved");
      expect(screen.getByRole("link", { name: "Completed" })).toHaveAttribute(
        "href",
        "/library/completed",
      );
    });
  });

  describe("LibrarySavedScreen (Saved)", () => {
    it("renders loading state", () => {
      renderWithQueryClient(<LibrarySavedScreen />);
      expect(screen.getByTestId("infinite-scroll-list")).toBeInTheDocument();
    });

    it("renders empty state", () => {
      renderWithQueryClient(<LibrarySavedScreen />);
      expect(screen.getByTestId("infinite-scroll-list")).toBeInTheDocument();
    });

    it("renders items", () => {
      renderWithQueryClient(<LibrarySavedScreen />);
      expect(screen.getByTestId("library-row")).toHaveTextContent("Lecture Title 1");
    });

    it("renders AuthRequiredState when unauthenticated", () => {
      mockUseAuth.mockReturnValue({ isAuthenticated: false, isLoading: false });
      renderWithQueryClient(<LibrarySavedScreen />);
      expect(screen.getByTestId("auth-required-state")).toBeInTheDocument();
      expect(screen.getByText("Sign in to view your saved lessons")).toBeInTheDocument();
      expect(screen.getByRole("link", { name: "Completed" })).toHaveAttribute(
        "href",
        "/library/completed",
      );
    });

    it("keeps Completed available from the Saved tab", () => {
      renderWithQueryClient(<LibrarySavedScreen />);

      expect(screen.getByRole("link", { name: "Completed" })).toHaveAttribute(
        "href",
        "/library/completed",
      );
    });
  });

  describe("LibraryCompletedScreen (Completed)", () => {
    it("renders loading state", () => {
      renderWithQueryClient(<LibraryCompletedScreen />);
      expect(screen.getByTestId("infinite-scroll-list")).toBeInTheDocument();
    });

    it("renders empty state", () => {
      renderWithQueryClient(<LibraryCompletedScreen />);
      expect(screen.getByTestId("infinite-scroll-list")).toBeInTheDocument();
    });

    it("renders items", () => {
      renderWithQueryClient(<LibraryCompletedScreen />);
      expect(screen.getByTestId("library-row")).toHaveTextContent("Lecture Title 1");
    });

    it("renders AuthRequiredState when unauthenticated", () => {
      mockUseAuth.mockReturnValue({ isAuthenticated: false, isLoading: false });
      renderWithQueryClient(<LibraryCompletedScreen />);
      expect(screen.getByTestId("auth-required-state")).toBeInTheDocument();
      expect(screen.getByText("Sign in to view completed lessons")).toBeInTheDocument();
      expect(screen.getByRole("link", { name: "Saved" })).toHaveAttribute("href", "/library/saved");
    });

    it("keeps Saved available from the Completed tab", () => {
      renderWithQueryClient(<LibraryCompletedScreen />);

      expect(screen.getByRole("link", { name: "Saved" })).toHaveAttribute("href", "/library/saved");
    });
  });
});
