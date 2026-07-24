import { describe, it, expect } from "bun:test";
import { render, screen } from "@testing-library/react";
import { TopicModal } from "./TopicModal";

describe("TopicModal", () => {
  it("does not render when isOpen is false", () => {
    render(<TopicModal isOpen={false} onClose={() => {}} onSaved={() => {}} />);
    expect(screen.queryByText(/add topic/i)).not.toBeInTheDocument();
  });

  it("renders form fields for add topic modal", () => {
    render(<TopicModal isOpen onClose={() => {}} onSaved={() => {}} />);

    expect(screen.getByLabelText(/slug/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/english name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/arabic name/i)).toBeInTheDocument();
  });

  it("shows error when slug or any language name is missing on submit", async () => {
    const { fireEvent, waitFor } = await import("@testing-library/react");
    render(<TopicModal isOpen onClose={() => {}} onSaved={() => {}} />);

    const doneButton = screen.getByRole("button", { name: /done/i });
    fireEvent.click(doneButton);

    await waitFor(() => {
      expect(
        screen.getByText(/slug and at least one language name are required/i),
      ).toBeInTheDocument();
    });
  });
});
