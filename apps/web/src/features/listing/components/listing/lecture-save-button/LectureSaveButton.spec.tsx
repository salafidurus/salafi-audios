import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "bun:test";
import React from "react";

import { LectureSaveButton } from "./LectureSaveButton";

const mockUseAuth = vi.fn(() => ({ isAuthenticated: true }));
const mockUseIsSaved = vi.fn(() => false);
const mockMarkSaved = vi.fn();
const mockMarkUnsaved = vi.fn();

vi.mock("@/core/auth/use-auth", () => ({
  useAuth: () => mockUseAuth(),
}));

vi.mock("@/features/auth", () => ({
  AuthModal: ({ isOpen, message }: any) =>
    isOpen ? <div data-testid="auth-modal">{message}</div> : null,
}));

vi.mock("@sd/domain-content", () => ({
  useIsSaved: () => mockUseIsSaved(),
  markSaved: (...args: unknown[]) => mockMarkSaved(...args),
  markUnsaved: (...args: unknown[]) => mockMarkUnsaved(...args),
}));

describe("LectureSaveButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({ isAuthenticated: true });
    mockUseIsSaved.mockReturnValue(false);
  });

  it('renders "Save" when lecture is not saved', () => {
    render(<LectureSaveButton lectureId="lec-1" />);
    expect(screen.getByText("Save")).toBeInTheDocument();
  });

  it('renders "✓ Saved" when lecture is saved', () => {
    mockUseIsSaved.mockReturnValue(true);
    render(<LectureSaveButton lectureId="lec-1" />);
    expect(screen.getByText("✓ Saved")).toBeInTheDocument();
  });

  it("calls markSaved with id and slug when clicking Save (when authenticated)", () => {
    render(<LectureSaveButton lectureId="lec-2" lectureSlug="tafsir-al-fatiha" />);
    fireEvent.click(screen.getByText("Save"));
    expect(mockMarkSaved).toHaveBeenCalledWith("lec-2", "tafsir-al-fatiha");
    expect(screen.queryByTestId("auth-modal")).not.toBeInTheDocument();
  });

  it("calls markUnsaved with id and slug when clicking Saved (when authenticated)", () => {
    mockUseIsSaved.mockReturnValue(true);
    render(<LectureSaveButton lectureId="lec-3" lectureSlug="lesson-three" />);
    fireEvent.click(screen.getByText("✓ Saved"));
    expect(mockMarkUnsaved).toHaveBeenCalledWith("lec-3", "lesson-three");
  });

  it("does not call markSaved and opens AuthModal when clicking Save (when unauthenticated)", () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: false });
    render(<LectureSaveButton lectureId="lec-4" />);

    expect(screen.queryByTestId("auth-modal")).not.toBeInTheDocument();

    fireEvent.click(screen.getByText("Save"));

    expect(mockMarkSaved).not.toHaveBeenCalled();
    expect(screen.getByTestId("auth-modal")).toBeInTheDocument();
    expect(screen.getByText("Sign in to save lectures to your library.")).toBeInTheDocument();
  });
});
