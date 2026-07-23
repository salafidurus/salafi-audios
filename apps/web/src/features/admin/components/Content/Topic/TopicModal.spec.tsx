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
});
