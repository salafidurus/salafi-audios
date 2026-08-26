import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "bun:test";

import { ConfirmationDialog } from "./confirmation-dialog";

describe("ConfirmationDialog", () => {
  it("renders an accessible shadcn dialog with a destructive action", () => {
    render(
      <ConfirmationDialog
        open
        onOpenChange={vi.fn()}
        title="Delete topic?"
        description="This action cannot be undone."
        confirmLabel="Delete topic"
        variant="destructive"
      />,
    );

    expect(screen.getByRole("dialog", { name: "Delete topic?" })).toBeInTheDocument();
    expect(screen.getByText("This action cannot be undone.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Delete topic" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
  });

  it("does not close or submit twice while confirmation is pending", async () => {
    let resolveConfirmation!: () => void;
    const onConfirm = vi.fn(() => new Promise<void>((resolve) => (resolveConfirmation = resolve)));
    const onOpenChange = vi.fn();

    render(
      <ConfirmationDialog
        open
        onOpenChange={onOpenChange}
        onConfirm={onConfirm}
        title="Sign out?"
        description="Are you sure?"
        confirmLabel="Sign out"
      />,
    );

    const confirm = screen.getByRole("button", { name: "Sign out" });
    fireEvent.click(confirm);
    fireEvent.click(confirm);
    fireEvent.keyDown(document, { key: "Escape" });

    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onOpenChange).not.toHaveBeenCalledWith(false);
    expect(confirm).toBeDisabled();

    resolveConfirmation();
    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));
  });

  it("keeps the dialog open when confirmation fails and exposes the error", async () => {
    const onOpenChange = vi.fn();
    const onConfirm = vi.fn(async () => {
      throw new Error("request failed");
    });

    render(
      <ConfirmationDialog
        open
        onOpenChange={onOpenChange}
        onConfirm={onConfirm}
        title="Sign out?"
        description="Are you sure?"
        confirmLabel="Sign out"
        error="Unable to sign out. Try again."
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Sign out" }));

    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("Unable to sign out"));
    expect(onOpenChange).not.toHaveBeenCalledWith(false);
  });
});
