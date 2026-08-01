import { useProgressStore } from "@sd/domain-audio";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "bun:test";
import React from "react";

import { LectureSaveButton } from "./LectureSaveButton";

const mockUseAuth = vi.fn(() => ({ isAuthenticated: true }));
const mockMutate = vi.fn();
const mockUseToggleSaved = vi.fn(() => ({ mutate: mockMutate }));

vi.mock("@/core/auth/use-auth", () => ({
  useAuth: () => mockUseAuth(),
}));

vi.mock("@/features/auth", () => ({
  AuthModal: ({ isOpen, message }: any) =>
    isOpen ? <div data-testid="auth-modal">{message}</div> : null,
}));

vi.mock("@sd/domain-content", () => ({
  useToggleSaved: () => mockUseToggleSaved(),
}));

const initialState = useProgressStore.getState();

describe("LectureSaveButton", () => {
  beforeEach(() => {
    useProgressStore.setState(initialState, true);
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({ isAuthenticated: true });
    mockUseToggleSaved.mockReturnValue({ mutate: mockMutate });
  });

  it('renders "Save" when lecture is not saved', () => {
    render(<LectureSaveButton lectureId="lec-1" />);
    expect(screen.getByText("Save")).toBeInTheDocument();
  });

  it('renders "✓ Saved" when lecture is saved', () => {
    useProgressStore.getState().actions.addSaved("lec-1");
    render(<LectureSaveButton lectureId="lec-1" />);
    expect(screen.getByText("✓ Saved")).toBeInTheDocument();
  });

  it("calls addSaved when clicking Save (when authenticated)", () => {
    render(<LectureSaveButton lectureId="lec-2" />);
    fireEvent.click(screen.getByText("Save"));
    expect(useProgressStore.getState().actions.isSaved("lec-2")).toBe(true);
    expect(screen.queryByTestId("auth-modal")).not.toBeInTheDocument();
  });

  it("calls removeSaved when clicking Saved (when authenticated)", () => {
    useProgressStore.getState().actions.addSaved("lec-3");
    render(<LectureSaveButton lectureId="lec-3" />);
    fireEvent.click(screen.getByText("✓ Saved"));
    expect(useProgressStore.getState().actions.isSaved("lec-3")).toBe(false);
  });

  it("persists the save via the toggle-saved mutation", () => {
    render(<LectureSaveButton lectureId="lec-5" />);
    fireEvent.click(screen.getByText("Save"));
    expect(mockMutate).toHaveBeenCalledWith(
      { listingId: "lec-5", saved: true },
      expect.objectContaining({ onError: expect.any(Function) }),
    );
  });

  it("persists the unsave via the toggle-saved mutation", () => {
    useProgressStore.getState().actions.addSaved("lec-6");
    render(<LectureSaveButton lectureId="lec-6" />);
    fireEvent.click(screen.getByText("✓ Saved"));
    expect(mockMutate).toHaveBeenCalledWith(
      { listingId: "lec-6", saved: false },
      expect.objectContaining({ onError: expect.any(Function) }),
    );
  });

  it("rolls back the optimistic save if the mutation fails", () => {
    render(<LectureSaveButton lectureId="lec-7" />);
    fireEvent.click(screen.getByText("Save"));
    expect(useProgressStore.getState().actions.isSaved("lec-7")).toBe(true);

    const [, { onError }] = mockMutate.mock.calls[0]!;
    onError();

    expect(useProgressStore.getState().actions.isSaved("lec-7")).toBe(false);
  });

  it("does not call addSaved and opens AuthModal when clicking Save (when unauthenticated)", () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: false });
    render(<LectureSaveButton lectureId="lec-4" />);

    // Mock modal is closed initially
    expect(screen.queryByTestId("auth-modal")).not.toBeInTheDocument();

    fireEvent.click(screen.getByText("Save"));

    // Should NOT save the lecture
    expect(useProgressStore.getState().actions.isSaved("lec-4")).toBe(false);

    // Should open the AuthModal with proper message
    expect(screen.getByTestId("auth-modal")).toBeInTheDocument();
    expect(screen.getByText("Sign in to save lectures to your library.")).toBeInTheDocument();
  });
});
