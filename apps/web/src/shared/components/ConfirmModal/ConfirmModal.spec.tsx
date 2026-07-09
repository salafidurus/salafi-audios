import { render, screen, fireEvent } from "@testing-library/react";
import { ConfirmModal } from "./ConfirmModal";

describe("ConfirmModal", () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onConfirm: vi.fn(),
    title: "Confirm Action",
    message: "Are you sure you want to proceed?",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders when isOpen is true", () => {
    render(<ConfirmModal {...defaultProps} />);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Confirm Action")).toBeInTheDocument();
    expect(screen.getByText("Are you sure you want to proceed?")).toBeInTheDocument();
  });

  it("does not render when isOpen is false", () => {
    render(<ConfirmModal {...defaultProps} isOpen={false} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("calls onClose when cancel is clicked", () => {
    render(<ConfirmModal {...defaultProps} />);
    fireEvent.click(screen.getByText("Cancel"));
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it("calls onConfirm when confirm is clicked", () => {
    render(<ConfirmModal {...defaultProps} />);
    fireEvent.click(screen.getByText("Confirm"));
    expect(defaultProps.onConfirm).toHaveBeenCalledTimes(1);
  });

  it("uses custom confirm label when provided", () => {
    render(<ConfirmModal {...defaultProps} confirmLabel="Delete" />);
    expect(screen.getByText("Delete")).toBeInTheDocument();
  });

  it("renders danger variant for the confirm button", () => {
    render(<ConfirmModal {...defaultProps} confirmVariant="danger" />);
    const confirmButton = screen.getByText("Confirm");
    expect(confirmButton).toBeInTheDocument();
  });

  describe("word confirmation mode", () => {
    it("renders an input field when confirmWord is provided", () => {
      render(<ConfirmModal {...defaultProps} confirmWord="DELETE" />);
      expect(screen.getByPlaceholderText('Type "DELETE" to confirm')).toBeInTheDocument();
    });

    it("disables confirm button when input does not match confirmWord", () => {
      render(<ConfirmModal {...defaultProps} confirmWord="DELETE" />);
      const confirmButton = screen.getByText("Confirm");
      expect(confirmButton).toBeDisabled();
    });

    it("enables confirm button when input matches confirmWord", () => {
      render(<ConfirmModal {...defaultProps} confirmWord="DELETE" />);
      const input = screen.getByPlaceholderText('Type "DELETE" to confirm');
      fireEvent.change(input, { target: { value: "DELETE" } });
      const confirmButton = screen.getByText("Confirm");
      expect(confirmButton).not.toBeDisabled();
    });

    it("calls onConfirm when confirm is clicked after matching word", () => {
      render(<ConfirmModal {...defaultProps} confirmWord="DELETE" />);
      const input = screen.getByPlaceholderText('Type "DELETE" to confirm');
      fireEvent.change(input, { target: { value: "DELETE" } });
      fireEvent.click(screen.getByText("Confirm"));
      expect(defaultProps.onConfirm).toHaveBeenCalledTimes(1);
    });

    it("does not call onConfirm when input does not match and confirm is clicked", () => {
      render(<ConfirmModal {...defaultProps} confirmWord="DELETE" />);
      const confirmButton = screen.getByText("Confirm");
      expect(confirmButton).toBeDisabled();
      fireEvent.click(confirmButton);
      expect(defaultProps.onConfirm).not.toHaveBeenCalled();
    });
  });
});
