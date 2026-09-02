import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "bun:test";
import React from "react";

import { MyLibraryCompletedScreen } from "./my-library-completed.screen";
import { MyLibrarySavedScreen } from "./my-library-saved.screen";
import { MyLibraryScreen } from "./my-library.screen";

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

vi.mock("@/features/my-library/components/my-library-tabs/my-library-tabs", () => ({
  MyLibraryTabs: ({ activeTab }: { activeTab: string }) => (
    <nav aria-label="My Library sections">
      <a href="/my-library">Started</a>
      <a href="/my-library?tab=saved" aria-current={activeTab === "saved" ? "page" : undefined}>
        Saved
      </a>
      <a
        href="/my-library?tab=completed"
        aria-current={activeTab === "completed" ? "page" : undefined}
      >
        Completed
      </a>
    </nav>
  ),
}));

vi.mock("../components/my-library-list-row/my-library-list-row", () => ({
  MyLibraryListRow: ({ item }: { item: any }) => (
    <div data-testid="myLibrary-row">{item.listingTitle}</div>
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

describe("MyLibrary screens", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({ isAuthenticated: true, isLoading: false });
  });

  describe("MyLibraryScreen (Started)", () => {
    it("renders loading state", () => {
      renderWithQueryClient(<MyLibraryScreen />);
      expect(screen.getAllByTestId("infinite-scroll-list").length).toBeGreaterThan(0);
    });

    it("renders empty state", () => {
      renderWithQueryClient(<MyLibraryScreen />);
      expect(screen.getAllByTestId("infinite-scroll-list").length).toBeGreaterThan(0);
    });

    it("renders items", () => {
      renderWithQueryClient(<MyLibraryScreen />);
      expect(screen.getAllByTestId("myLibrary-row")).toHaveLength(1);
      expect(screen.getByTestId("myLibrary-row")).toHaveTextContent("Lecture Title 1");
    });

    it("renders AuthRequiredState when unauthenticated", () => {
      mockUseAuth.mockReturnValue({ isAuthenticated: false, isLoading: false });
      renderWithQueryClient(<MyLibraryScreen />);
      expect(screen.getByTestId("auth-required-state")).toBeInTheDocument();
      expect(screen.getByText("Sign in to continue your study")).toBeInTheDocument();
    });

    it("does not flash the sign-in state while authentication is resolving", () => {
      mockUseAuth.mockReturnValue({ isAuthenticated: false, isLoading: true });
      renderWithQueryClient(<MyLibraryScreen />);

      expect(screen.getByText("Checking your My Library…")).toBeInTheDocument();
      expect(screen.queryByText("Sign in to continue your study")).not.toBeInTheDocument();
    });

    it("exposes Saved and Completed as distinct MyLibrary tabs", () => {
      renderWithQueryClient(<MyLibraryScreen />);

      expect(screen.getByRole("link", { name: "Saved" })).toHaveAttribute(
        "href",
        "/my-library?tab=saved",
      );
      expect(screen.getByRole("link", { name: "Completed" })).toHaveAttribute(
        "href",
        "/my-library?tab=completed",
      );
    });
  });

  describe("MyLibrarySavedScreen (Saved)", () => {
    it("renders loading state", () => {
      renderWithQueryClient(<MyLibrarySavedScreen />);
      expect(screen.getByTestId("infinite-scroll-list")).toBeInTheDocument();
    });

    it("renders empty state", () => {
      renderWithQueryClient(<MyLibrarySavedScreen />);
      expect(screen.getByTestId("infinite-scroll-list")).toBeInTheDocument();
    });

    it("renders items", () => {
      renderWithQueryClient(<MyLibrarySavedScreen />);
      expect(screen.getByTestId("myLibrary-row")).toHaveTextContent("Lecture Title 1");
    });

    it("renders AuthRequiredState when unauthenticated", () => {
      mockUseAuth.mockReturnValue({ isAuthenticated: false, isLoading: false });
      renderWithQueryClient(<MyLibrarySavedScreen />);
      expect(screen.getByTestId("auth-required-state")).toBeInTheDocument();
      expect(screen.getByText("Sign in to view your saved lessons")).toBeInTheDocument();
      expect(screen.getByRole("link", { name: "Completed" })).toHaveAttribute(
        "href",
        "/my-library?tab=completed",
      );
    });

    it("keeps Completed available from the Saved tab", () => {
      renderWithQueryClient(<MyLibrarySavedScreen />);

      expect(screen.getByRole("link", { name: "Completed" })).toHaveAttribute(
        "href",
        "/my-library?tab=completed",
      );
    });
  });

  describe("MyLibraryCompletedScreen (Completed)", () => {
    it("renders loading state", () => {
      renderWithQueryClient(<MyLibraryCompletedScreen />);
      expect(screen.getByTestId("infinite-scroll-list")).toBeInTheDocument();
    });

    it("renders empty state", () => {
      renderWithQueryClient(<MyLibraryCompletedScreen />);
      expect(screen.getByTestId("infinite-scroll-list")).toBeInTheDocument();
    });

    it("renders items", () => {
      renderWithQueryClient(<MyLibraryCompletedScreen />);
      expect(screen.getByTestId("myLibrary-row")).toHaveTextContent("Lecture Title 1");
    });

    it("renders AuthRequiredState when unauthenticated", () => {
      mockUseAuth.mockReturnValue({ isAuthenticated: false, isLoading: false });
      renderWithQueryClient(<MyLibraryCompletedScreen />);
      expect(screen.getByTestId("auth-required-state")).toBeInTheDocument();
      expect(screen.getByText("Sign in to view completed lessons")).toBeInTheDocument();
      expect(screen.getByRole("link", { name: "Saved" })).toHaveAttribute(
        "href",
        "/my-library?tab=saved",
      );
    });

    it("keeps Saved available from the Completed tab", () => {
      renderWithQueryClient(<MyLibraryCompletedScreen />);

      expect(screen.getByRole("link", { name: "Saved" })).toHaveAttribute(
        "href",
        "/my-library?tab=saved",
      );
    });
  });
});
