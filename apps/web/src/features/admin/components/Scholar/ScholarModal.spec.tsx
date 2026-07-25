import { describe, it, expect, beforeEach, vi, type Mock } from "bun:test";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ScholarModal } from "./ScholarModal";
import { createScholar, updateScholar, fetchScholarFormData } from "@/features/admin/api/admin.api";

vi.mock("@/features/admin/api/admin-lectures.api", () => ({
  getPresignedUrl: vi.fn(),
  uploadToR2: vi.fn(),
}));

vi.mock("@/features/admin/api/admin.api", () => ({
  createScholar: vi.fn(),
  updateScholar: vi.fn(),
  fetchScholarFormData: vi.fn(),
}));

describe("ScholarModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("does not render when isOpen is false", () => {
    render(<ScholarModal isOpen={false} onClose={vi.fn()} onSuccess={vi.fn()} />);
    expect(screen.queryByText(/add scholar/i)).not.toBeInTheDocument();
  });

  it("renders tabs for add scholar modal", () => {
    render(<ScholarModal isOpen onClose={vi.fn()} onSuccess={vi.fn()} />);

    expect(screen.getByRole("tablist")).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /general/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "العربية" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "English" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /review/i })).toBeInTheDocument();
  });

  it("renders with create form fields and triggers save", async () => {
    const onSuccessMock = vi.fn();
    const onCloseMock = vi.fn();
    (createScholar as Mock<any>).mockResolvedValue({ id: "new-scholar-id" });

    render(<ScholarModal isOpen onClose={onCloseMock} onSuccess={onSuccessMock} />);

    const slugInput = screen.getByLabelText(/slug \*/i);
    fireEvent.change(slugInput, { target: { value: "new-scholar" } });

    const mainTabButton = screen.getByRole("tab", { name: "العربية" });
    fireEvent.click(mainTabButton);

    const nameInput = await screen.findByPlaceholderText(/scholar name/i);
    fireEvent.change(nameInput, { target: { value: "New Scholar" } });

    const reviewButton = screen.getByRole("tab", { name: /review/i });
    fireEvent.click(reviewButton);

    const saveButton = await screen.findByRole("button", { name: /add scholar|إضافة/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(createScholar).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "New Scholar",
          slug: "new-scholar",
        }),
      );
    });

    expect(onSuccessMock).toHaveBeenCalledTimes(1);
    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  it("renders with edit form fields prefilled and updates the scholar by real id, not slug", async () => {
    const onSuccessMock = vi.fn();
    const onCloseMock = vi.fn();
    (updateScholar as Mock<any>).mockResolvedValue({ id: "scholar-uuid-123" });
    (fetchScholarFormData as Mock<any>).mockResolvedValue({
      scholar: {
        id: "scholar-uuid-123",
        name: "Existing Scholar",
        slug: "existing-scholar",
        bio: "Existing bio",
        isActive: true,
        mainLanguage: "ar",
        orderIndex: 5,
        createdAt: "2024-01-01",
      },
      translations: [],
    });

    render(
      <ScholarModal
        isOpen
        onClose={onCloseMock}
        onSuccess={onSuccessMock}
        scholarId="scholar-uuid-123"
      />,
    );

    await waitFor(() => {
      expect(fetchScholarFormData).toHaveBeenCalledWith("scholar-uuid-123");
    });

    const slugInput = await screen.findByLabelText(/slug \*/i);
    expect(slugInput).toHaveValue("existing-scholar");
    expect(slugInput).toBeDisabled();

    const mainTabButton = screen.getByRole("tab", { name: "العربية" });
    fireEvent.click(mainTabButton);

    const nameInput = await screen.findByPlaceholderText(/scholar name/i);
    expect(nameInput).toHaveValue("Existing Scholar");
    fireEvent.change(nameInput, { target: { value: "Updated Scholar Name" } });

    const reviewButton = screen.getByRole("tab", { name: /review/i });
    fireEvent.click(reviewButton);

    const saveButton = await screen.findByRole("button", { name: /save/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      // The critical regression check: update must be called with the real
      // database id ("scholar-uuid-123"), never the slug ("existing-scholar").
      expect(updateScholar).toHaveBeenCalledWith(
        "scholar-uuid-123",
        expect.objectContaining({
          name: "Updated Scholar Name",
        }),
      );
    });

    expect(onSuccessMock).toHaveBeenCalledTimes(1);
    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  it("review tab shows no changes when editing an untouched scholar, and only the touched field once edited", async () => {
    (fetchScholarFormData as Mock<any>).mockResolvedValue({
      scholar: {
        id: "scholar-uuid-456",
        name: "Existing Scholar",
        slug: "existing-scholar",
        bio: "Existing bio",
        country: "SA",
        isActive: true,
        mainLanguage: "ar",
        orderIndex: 5,
        createdAt: "2024-01-01",
      },
      translations: [],
    });

    render(
      <ScholarModal isOpen onClose={vi.fn()} onSuccess={vi.fn()} scholarId="scholar-uuid-456" />,
    );

    await waitFor(() => {
      expect(fetchScholarFormData).toHaveBeenCalledWith("scholar-uuid-456");
    });
    await screen.findByLabelText(/slug \*/i);

    const reviewTab = screen.getByRole("tab", { name: /review/i });
    fireEvent.click(reviewTab);

    // Nothing was edited yet, so the review tab must not show the
    // pre-existing bio/country as "changed" fields.
    expect(screen.getByText(/no changes made yet/i)).toBeInTheDocument();
    expect(screen.queryByText("Existing bio")).not.toBeInTheDocument();

    // Now actually change bio only (bio lives on the main-language tab).
    const mainTab = screen.getByRole("tab", { name: "العربية" });
    fireEvent.click(mainTab);
    const bioInput = screen.getByLabelText(/bio/i);
    fireEvent.change(bioInput, { target: { value: "Updated bio" } });

    fireEvent.click(reviewTab);

    expect(screen.getByText("Updated bio")).toBeInTheDocument();
    // Country was never touched, so it must not appear as a change.
    expect(screen.queryByText("SA")).not.toBeInTheDocument();
  });

  it("allows cancel from any tab", () => {
    const onClose = vi.fn();
    render(<ScholarModal isOpen onClose={onClose} onSuccess={vi.fn()} />);

    const cancelButton = screen.getByRole("button", { name: /cancel/i });
    fireEvent.click(cancelButton);

    expect(onClose).toHaveBeenCalled();
  });

  it("displays error and highlights error tabs when required fields are missing", async () => {
    render(<ScholarModal isOpen onClose={vi.fn()} onSuccess={vi.fn()} />);

    const reviewTab = screen.getByRole("tab", { name: /review/i });
    fireEvent.click(reviewTab);

    const saveButton = screen.getByRole("button", { name: /add scholar|إضافة/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText(/required/i)).toBeInTheDocument();
    });
  });
});
