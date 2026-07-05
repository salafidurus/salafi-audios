import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";
import { LibraryDesktopScreen } from "./library.screen.desktop";
import { LibrarySavedDesktopScreen } from "./library-saved.screen.desktop";
import { LibraryCompletedDesktopScreen } from "./library-completed.screen.desktop";
import {
  useLibraryProgressScreen,
  useLibrarySavedScreen,
  useLibraryCompletedScreen,
} from "@sd/domain-content";

const mockUseAuth = vi.fn(() => ({ isAuthenticated: true }));

vi.mock("@sd/domain-content", () => ({
  useLibraryProgressScreen: vi.fn(),
  useLibrarySavedScreen: vi.fn(),
  useLibraryCompletedScreen: vi.fn(),
}));

vi.mock("@/core/auth/use-auth", () => ({
  useAuth: () => mockUseAuth(),
}));

vi.mock("@/core/i18n/use-translation", () => ({
  useTranslation: () => ({
    t: (key: string, fallback?: string) => fallback ?? key,
  }),
}));

vi.mock("@/shared/components/ScreenView/ScreenView", () => ({
  ScreenView: ({ children }: { children: React.ReactNode }) => <div data-testid="screen-view">{children}</div>,
}));

vi.mock("../components/library-list-row/library-list-row", () => ({
  LibraryListRow: ({ item }: { item: any }) => <div data-testid="library-row">{item.lectureTitle}</div>,
}));

vi.mock("@/shared/components/AuthRequiredState/AuthRequiredState", () => ({
  AuthRequiredState: ({ title, description }: any) => (
    <div data-testid="auth-required-state">
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  ),
}));

const mockProgress = vi.mocked(useLibraryProgressScreen);
const mockSaved = vi.mocked(useLibrarySavedScreen);
const mockCompleted = vi.mocked(useLibraryCompletedScreen);

const mockItem = {
  id: "lib-1",
  lectureId: "lec-1",
  lectureTitle: "Lecture Title 1",
  lectureSlug: "lecture-title-1",
  scholarId: "sch-1",
  scholarSlug: "scholar-1",
  scholarName: "Scholar 1",
};

describe("Library screens", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({ isAuthenticated: true });
  });

  describe("LibraryDesktopScreen (Started)", () => {
    it("renders loading state", () => {
      mockProgress.mockReturnValue({ items: [], isFetching: true } as any);
      render(<LibraryDesktopScreen />);
      expect(screen.getByText(/Loading/)).toBeInTheDocument();
    });

    it("renders empty state", () => {
      mockProgress.mockReturnValue({ items: [], isFetching: false } as any);
      render(<LibraryDesktopScreen />);
      expect(screen.getByText("No lectures in progress.")).toBeInTheDocument();
    });

    it("renders items", () => {
      mockProgress.mockReturnValue({ items: [mockItem], isFetching: false } as any);
      render(<LibraryDesktopScreen />);
      expect(screen.getByTestId("library-row")).toHaveTextContent("Lecture Title 1");
    });

    it("renders AuthRequiredState when unauthenticated", () => {
      mockUseAuth.mockReturnValue({ isAuthenticated: false });
      render(<LibraryDesktopScreen />);
      expect(screen.getByTestId("auth-required-state")).toBeInTheDocument();
      expect(screen.getByText("Sign in to view your progress")).toBeInTheDocument();
    });
  });

  describe("LibrarySavedDesktopScreen (Saved)", () => {
    it("renders loading state", () => {
      mockSaved.mockReturnValue({ items: [], isFetching: true } as any);
      render(<LibrarySavedDesktopScreen />);
      expect(screen.getByText(/Loading/)).toBeInTheDocument();
    });

    it("renders empty state", () => {
      mockSaved.mockReturnValue({ items: [], isFetching: false } as any);
      render(<LibrarySavedDesktopScreen />);
      expect(screen.getByText(/No saved lectures yet/)).toBeInTheDocument();
    });

    it("renders items", () => {
      mockSaved.mockReturnValue({ items: [mockItem], isFetching: false } as any);
      render(<LibrarySavedDesktopScreen />);
      expect(screen.getByTestId("library-row")).toHaveTextContent("Lecture Title 1");
    });

    it("renders AuthRequiredState when unauthenticated", () => {
      mockUseAuth.mockReturnValue({ isAuthenticated: false });
      render(<LibrarySavedDesktopScreen />);
      expect(screen.getByTestId("auth-required-state")).toBeInTheDocument();
      expect(screen.getByText("Sign in to view saved lectures")).toBeInTheDocument();
    });
  });

  describe("LibraryCompletedDesktopScreen (Completed)", () => {
    it("renders loading state", () => {
      mockCompleted.mockReturnValue({ items: [], isFetching: true } as any);
      render(<LibraryCompletedDesktopScreen />);
      expect(screen.getByText(/Loading/)).toBeInTheDocument();
    });

    it("renders empty state", () => {
      mockCompleted.mockReturnValue({ items: [], isFetching: false } as any);
      render(<LibraryCompletedDesktopScreen />);
      expect(screen.getByText(/No completed lectures yet/)).toBeInTheDocument();
    });

    it("renders items", () => {
      mockCompleted.mockReturnValue({ items: [mockItem], isFetching: false } as any);
      render(<LibraryCompletedDesktopScreen />);
      expect(screen.getByTestId("library-row")).toHaveTextContent("Lecture Title 1");
    });

    it("renders AuthRequiredState when unauthenticated", () => {
      mockUseAuth.mockReturnValue({ isAuthenticated: false });
      render(<LibraryCompletedDesktopScreen />);
      expect(screen.getByTestId("auth-required-state")).toBeInTheDocument();
      expect(screen.getByText("Sign in to view completed history")).toBeInTheDocument();
    });
  });
});
