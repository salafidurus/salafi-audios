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
    expect(screen.getByRole("tab", { name: /general/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "العربية" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "English" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /review/i })).toBeInTheDocument();
  });

  it("shows general info section on general tab", () => {
    const onSave = vi.fn();
    render(
      <ScholarModal
        isOpen
        onClose={vi.fn()}
        onSave={onSave}
        scholar={{ id: "1", name: "Test", slug: "test", mainLanguage: "ar" }}
      />,
    );

    // General tab should be active by default and show general fields (slug, title, image)
    expect(screen.getByLabelText(/slug \*/i)).toBeInTheDocument();
    // Name should not be on general tab (it's translatable content)
    expect(screen.queryByLabelText(/name \*/i)).not.toBeInTheDocument();

    // Switch to main language tab (Arabic) - should show name and bio for main language content
    const mainTab = screen.getByRole("tab", { name: "العربية" });
    fireEvent.click(mainTab);

    // The slug field should not be visible on main language tab (only on general)
    expect(screen.queryByLabelText(/slug \*/i)).not.toBeInTheDocument();

    // But the name field should be visible (as main language content)
    const nameInputs = screen.getAllByPlaceholderText(/scholar name/i);
    expect(nameInputs.length).toBeGreaterThan(0);
  });

  it("shows translation fields on other language tab", () => {
    render(
      <ScholarModal
        isOpen
        onClose={vi.fn()}
        onSave={vi.fn()}
        scholar={{ id: "1", name: "Test", slug: "test", mainLanguage: "ar" }}
      />,
    );

    // Switch to other tab (English when main is Arabic)
    const otherTab = screen.getByRole("tab", { name: "English" });
    fireEvent.click(otherTab);

    // Should see translation name input
    const translationNameLabel = screen.getByLabelText(/name/i);
    expect(translationNameLabel).toBeInTheDocument();

    // Should also see bio field for translation
    const bioLabel = screen.getByLabelText(/bio/i);
    expect(bioLabel).toBeInTheDocument();
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

  it("includes bio in main language tab", () => {
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

    // Switch to main language tab (Arabic)
    const mainTab = screen.getByRole("tab", { name: "العربية" });
    fireEvent.click(mainTab);

    // Bio should be visible on main language tab
    const bioLabel = screen.getByLabelText(/bio/i);
    expect(bioLabel).toBeInTheDocument();

    // Find the textarea next to the bio label
    const bioInput = bioLabel.closest("div")?.querySelector("textarea");
    expect(bioInput).toBeInTheDocument();
    expect(bioInput?.value).toBe("Test bio");
  });
});
