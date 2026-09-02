import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "bun:test";
import React from "react";

import MyLibraryPageInner from "./my-library-page-inner";

const mockGet = vi.fn<(key: string) => string | null>();

vi.mock("next/navigation", () => ({
  useSearchParams: () => ({ get: mockGet }),
}));

vi.mock("@/features/my-library/screens/my-library.screen", () => ({
  MyLibraryScreen: () => <div>started-screen</div>,
}));

vi.mock("@/features/my-library/screens/my-library-saved.screen", () => ({
  MyLibrarySavedScreen: () => <div>saved-screen</div>,
}));

vi.mock("@/features/my-library/screens/my-library-completed.screen", () => ({
  MyLibraryCompletedScreen: () => <div>completed-screen</div>,
}));

describe("MyLibraryPageInner", () => {
  beforeEach(() => {
    mockGet.mockReset();
    mockGet.mockReturnValue(null);
  });

  it("renders Started for the default route", () => {
    render(<MyLibraryPageInner />);

    expect(screen.getByText("started-screen")).toBeInTheDocument();
  });

  it.each([
    ["started", "started-screen"],
    ["saved", "saved-screen"],
    ["completed", "completed-screen"],
  ])("renders the screen selected by tab=%s", (tab, expectedScreen) => {
    mockGet.mockImplementation((key) => (key === "tab" ? tab : null));

    render(<MyLibraryPageInner />);

    expect(screen.getByText(expectedScreen)).toBeInTheDocument();
  });

  it.each(["", "invalid", "saved/extra", "STARTED"])("falls back to Started for tab=%s", (tab) => {
    mockGet.mockImplementation((key) => (key === "tab" ? tab : null));

    render(<MyLibraryPageInner />);

    expect(screen.getByText("started-screen")).toBeInTheDocument();
    expect(screen.queryByText("saved-screen")).not.toBeInTheDocument();
    expect(screen.queryByText("completed-screen")).not.toBeInTheDocument();
  });
});
