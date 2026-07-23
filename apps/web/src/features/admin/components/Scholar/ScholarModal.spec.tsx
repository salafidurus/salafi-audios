import { describe, it, expect, beforeEach, vi, type Mock } from "bun:test";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ScholarModal } from "./ScholarModal";

vi.mock("../../api/admin-lectures.api", () => ({
  getPresignedUrl: vi.fn(),
  uploadToR2: vi.fn(),
}));

describe("ScholarModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("does not render when isOpen is false", () => {
    render(<ScholarModal isOpen={false} onClose={vi.fn()} onSave={vi.fn()} />);
    expect(screen.queryByText(/add scholar/i)).not.toBeInTheDocument();
  });

  it("renders tabs for add scholar modal", () => {
    render(<ScholarModal isOpen onClose={vi.fn()} onSave={vi.fn()} />);

    expect(screen.getByRole("tablist")).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "English" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "العربية" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /review/i })).toBeInTheDocument();
  });

  it("shows personal data section only on main language tab", () => {
    const onSave = vi.fn();
    render(
      <ScholarModal
        isOpen
        onClose={vi.fn()}
        onSave={onSave}
        scholar={{ id: "1", name: "Test", slug: "test", mainLanguage: "ar" }}
      />,
    );

    // Arabic is the main language, so personal data should be visible on ar tab (should have an asterisk)
    const arTab = screen.getByRole("tab", { name: "العربية" });
    fireEvent.click(arTab);

    expect(screen.getByLabelText(/name \*/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/slug \*/i)).toBeInTheDocument();

    // Switch to en tab - should show translation fields instead of personal data
    const enTab = screen.getByRole("tab", { name: "English" });
    fireEvent.click(enTab);

    // The slug field should not be visible on translation tab (only personal data has slug)
    expect(screen.queryByLabelText(/slug \*/i)).not.toBeInTheDocument();

    // But the translation name field should be visible (without the asterisk)
    const translationLabels = screen.queryAllByText(/name/i);
    expect(translationLabels.length).toBeGreaterThan(0);
  });

  it("shows translation fields on non-main language tab", () => {
    render(
      <ScholarModal
        isOpen
        onClose={vi.fn()}
        onSave={vi.fn()}
        scholar={{ id: "1", name: "Test", slug: "test", mainLanguage: "ar" }}
      />,
    );

    // Get initial name fields (should be on ar tab which is the main language)
    const initialInputs = screen.getAllByPlaceholderText(/scholar name/i);
    expect(initialInputs.length).toBeGreaterThan(0);

    // Switch to en tab (non-main language)
    const enTab = screen.getByRole("tab", { name: /english/i });
    fireEvent.click(enTab);

    // Should see translation-specific fields - translation inputs won't have the same placeholder
    const translationNameLabel = screen.getByLabelText(/name/i);
    expect(translationNameLabel).toBeInTheDocument();
  });

  it("calls onSave with translations when non-main locale has content", async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    const onClose = vi.fn();

    render(
      <ScholarModal
        isOpen
        onClose={onClose}
        onSave={onSave}
        scholar={{
          id: "1",
          name: "Test Scholar",
          slug: "test-scholar",
          mainLanguage: "ar",
        }}
      />,
    );

    // Switch to en tab (translation tab)
    const enTab = screen.getByRole("tab", { name: "English" });
    fireEvent.click(enTab);

    // Find the translation name input (with id scholar-name-en)
    const translationInput = screen.getByPlaceholderText("Scholar name");
    fireEvent.change(translationInput, { target: { value: "Scholar Name" } });

    // Switch to review tab
    const reviewTab = screen.getByRole("tab", { name: /review/i });
    fireEvent.click(reviewTab);

    // Click save
    const saveButton = screen.getByRole("button", { name: /save/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(onSave).toHaveBeenCalled();
      const callArgs = onSave.mock.calls[0][0];
      expect(callArgs.translations).toBeDefined();
      expect(callArgs.translations.en).toBeDefined();
      expect(callArgs.translations.en.name).toBe("Scholar Name");
    });

    expect(onClose).toHaveBeenCalled();
  });

  it("does not include translations in save when translation fields are empty", async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);

    render(
      <ScholarModal
        isOpen
        onClose={vi.fn()}
        onSave={onSave}
        scholar={{
          id: "1",
          name: "Test Scholar",
          slug: "test-scholar",
          mainLanguage: "ar",
        }}
      />,
    );

    // Switch to review tab directly without filling translations
    const reviewTab = screen.getByRole("tab", { name: /review/i });
    fireEvent.click(reviewTab);

    // Click save
    const saveButton = screen.getByRole("button", { name: /save/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(onSave).toHaveBeenCalled();
      const callArgs = onSave.mock.calls[0][0];
      // translations should be omitted if empty
      expect(callArgs.translations).toBeUndefined();
    });
  });

  it("allows cancel from any tab", () => {
    const onClose = vi.fn();
    render(<ScholarModal isOpen onClose={onClose} onSave={vi.fn()} />);

    // Click cancel from en tab
    const cancelButton = screen.getByRole("button", { name: /cancel/i });
    fireEvent.click(cancelButton);

    expect(onClose).toHaveBeenCalled();
  });

  it("includes bio in personal data section", () => {
    render(
      <ScholarModal
        isOpen
        onClose={vi.fn()}
        onSave={vi.fn()}
        scholar={{
          id: "1",
          name: "Test",
          slug: "test",
          bio: "Test bio",
          mainLanguage: "ar",
        }}
      />,
    );

    // Arabic is the main language by default, so personal data is shown
    const bioLabel = screen.getByLabelText(/bio/i);
    expect(bioLabel).toBeInTheDocument();

    // Find the textarea next to the bio label
    const bioInput = bioLabel.closest("div")?.querySelector("textarea");
    expect(bioInput).toBeInTheDocument();
    expect(bioInput?.value).toBe("Test bio");
  });
});
