import React from "react";
import { vi } from "bun:test";
import { render, screen, fireEvent } from "@testing-library/react";
import { useProgressStore } from "@sd/domain-audio";
import { LectureSaveButton } from "./LectureSaveButton";

const mockUseAuth = vi.fn(() => ({ isAuthenticated: true }));

vi.mock("@/core/auth/use-auth", () => ({
  useAuth: () => mockUseAuth(),
}));

vi.mock("@/features/auth", () => ({
  AuthModal: ({ isOpen, message }: any) =>
    isOpen ? <div data-testid="auth-modal">{message}</div> : null,
}));

const initialState = useProgressStore.getState();

describe("LectureSaveButton", () => {
  beforeEach(() => {
    useProgressStore.setState(initialState, true);
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({ isAuthenticated: true });
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
