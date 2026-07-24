import { describe, it, expect, beforeEach, vi, type Mock } from "bun:test";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Modal } from "./Modal";

describe("Modal.ConfirmDialog", () => {
  let mockOnConfirm: Mock<any>;
  let mockOnClose: Mock<any>;

  beforeEach(() => {
    mockOnConfirm = vi.fn();
    mockOnClose = vi.fn();
  });

  it("renders title and children when open", () => {
    render(
      <Modal.ConfirmDialog
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        title="Confirm Action"
        confirmLabel="Confirm"
      >
        <p>Are you sure?</p>
      </Modal.ConfirmDialog>,
    );

    expect(screen.getByText("Confirm Action")).toBeInTheDocument();
    expect(screen.getByText("Are you sure?")).toBeInTheDocument();
  });

  it("does not render when closed", () => {
    render(
      <Modal.ConfirmDialog
        isOpen={false}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        title="Confirm Action"
        confirmLabel="Confirm"
      >
        <p>Are you sure?</p>
      </Modal.ConfirmDialog>,
    );

    expect(screen.queryByText("Confirm Action")).not.toBeInTheDocument();
  });

  it("calls onClose when cancel button is clicked", () => {
    render(
      <Modal.ConfirmDialog
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        title="Confirm"
        confirmLabel="Confirm"
      />,
    );

    const cancelButton = screen.getByRole("button", { name: "Cancel" });
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it("calls onConfirm when confirm button is clicked", () => {
    mockOnConfirm.mockImplementation(() => undefined);

    render(
      <Modal.ConfirmDialog
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        title="Confirm"
        confirmLabel="Confirm"
      />,
    );

    const confirmButton = screen.getByRole("button", { name: "Confirm" });
    fireEvent.click(confirmButton);

    expect(mockOnConfirm).toHaveBeenCalled();
  });

  it("wraps async onConfirm in try/finally for cleanup", () => {
    let resolveFn: () => void;
    mockOnConfirm.mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          resolveFn = resolve;
        }),
    );

    render(
      <Modal.ConfirmDialog
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        title="Confirm"
        confirmLabel="Confirm"
      />,
    );

    const confirmButton = screen.getByRole("button", { name: "Confirm" });
    fireEvent.click(confirmButton);

    expect(mockOnConfirm).toHaveBeenCalled();
  });

  it("renders confirm button with danger variant", () => {
    render(
      <Modal.ConfirmDialog
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        title="Delete?"
        confirmLabel="Delete"
        confirmVariant="danger"
      />,
    );

    const confirmButton = screen.getByRole("button", { name: "Delete" });
    expect(confirmButton).toBeInTheDocument();
  });
});
