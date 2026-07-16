import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { AuthModal } from "./auth-modal";

describe("AuthModal", () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    message: "Sign in to save lectures to your library",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders when isOpen is true", () => {
    render(<AuthModal {...defaultProps} />);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Salafi Durus")).toBeInTheDocument();
    expect(screen.getByText("Join the community of learners")).toBeInTheDocument();
    expect(screen.getByText("Sign in to save lectures to your library")).toBeInTheDocument();
    expect(screen.getByLabelText("Continue with Google")).toBeInTheDocument();
    expect(screen.getByLabelText("Continue with Apple")).toBeInTheDocument();
  });

  it("does not render when isOpen is false", () => {
    render(<AuthModal {...defaultProps} isOpen={false} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("calls onClose when the close button is clicked", () => {
    render(<AuthModal {...defaultProps} />);
    const closeButton = screen.getByLabelText("Close dialog");
    fireEvent.click(closeButton);
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });
});
