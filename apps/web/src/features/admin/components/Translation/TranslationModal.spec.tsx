import { describe, it, expect, beforeEach, vi, type Mock } from "bun:test";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { useAdminPermissions } from "@sd/domain-account";
import { TranslationModal } from "./TranslationModal";
import { fetchListingFormData } from "@/features/admin/api/admin-lectures.api";
import { fetchScholarFormData, fetchAdminTopic } from "@/features/admin/api/admin.api";
import {
  saveListingTranslation,
  publishScholarTranslation,
  saveTopicTranslation,
} from "@/features/admin/api/admin-translations.api";

vi.mock("@/features/admin/api/admin-lectures.api", () => ({
  fetchListingFormData: vi.fn(),
}));

vi.mock("@/features/admin/api/admin.api", () => ({
  fetchScholarFormData: vi.fn(),
  fetchAdminTopic: vi.fn(),
}));

vi.mock("@/features/admin/api/admin-translations.api", () => ({
  saveListingTranslation: vi.fn(),
  publishListingTranslation: vi.fn(),
  unpublishListingTranslation: vi.fn(),
  saveScholarTranslation: vi.fn(),
  publishScholarTranslation: vi.fn(),
  unpublishScholarTranslation: vi.fn(),
  saveTopicTranslation: vi.fn(),
}));

vi.mock("@sd/domain-account", () => ({
  useAdminPermissions: vi.fn(),
}));

describe("TranslationModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useAdminPermissions as Mock<any>).mockReturnValue({
      data: { permissions: ["TRANSLATIONS_VIEW", "TRANSLATIONS_CREATE", "TRANSLATIONS_PUBLISH"] },
    });
  });

  it("renders nothing when target is null", () => {
    render(<TranslationModal isOpen={false} onClose={vi.fn()} target={null} />);
    expect(screen.queryByText(/translations/i)).not.toBeInTheDocument();
  });

  it("loads a listing target and shows the main-language source alongside an editable field", async () => {
    (fetchListingFormData as Mock<any>).mockResolvedValue({
      listing: {
        id: "listing-1",
        title: "Existing Title",
        description: "Existing description",
        slug: "existing-title",
        format: "single",
        status: "draft",
        scholarId: "scholar-1",
        scholarName: "Scholar One",
        topics: [],
        language: "ar",
        createdAt: "2024-01-01",
      },
      translations: [],
    });

    render(
      <TranslationModal
        isOpen
        onClose={vi.fn()}
        target={{ entity: "listing", listingId: "listing-1" }}
      />,
    );

    await waitFor(() => {
      expect(fetchListingFormData).toHaveBeenCalledWith("listing-1");
    });

    // Main locale is "ar", so the only secondary-locale tab is English.
    await screen.findByRole("tab", { name: "English" });
    expect(screen.getByText("Existing Title")).toBeInTheDocument();
  });

  it("saves only the dirty locale via one POST upsert and then closes", async () => {
    (fetchListingFormData as Mock<any>).mockResolvedValue({
      listing: {
        id: "listing-1",
        title: "Existing Title",
        description: "Existing description",
        slug: "existing-title",
        format: "single",
        status: "draft",
        scholarId: "scholar-1",
        scholarName: "Scholar One",
        topics: [],
        language: "ar",
        createdAt: "2024-01-01",
      },
      translations: [
        {
          locale: "en",
          status: "draft",
          fields: { title: "Old English Title", description: "Old English description" },
          createdAt: "2024-01-01",
          updatedAt: "2024-01-01",
        },
      ],
    });
    (saveListingTranslation as Mock<any>).mockResolvedValue({
      locale: "en",
      status: "draft",
      fields: { title: "New English Title", description: "Old English description" },
      createdAt: "2024-01-01",
      updatedAt: "2024-01-01",
    });

    const onClose = vi.fn();
    render(
      <TranslationModal
        isOpen
        onClose={onClose}
        target={{ entity: "listing", listingId: "listing-1" }}
      />,
    );

    const titleInput = await screen.findByLabelText(/^Title/i);
    expect(titleInput).toHaveValue("Old English Title");
    fireEvent.change(titleInput, { target: { value: "New English Title" } });

    const reviewButton = screen.getByRole("button", { name: /review/i });
    fireEvent.click(reviewButton);

    expect(screen.getByText("New English Title")).toBeInTheDocument();

    const saveButton = await screen.findByRole("button", { name: /save/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      // Only "title" was edited; "description" is merged in unchanged from the
      // last-saved translation (the upsert DTO always needs the full field set).
      expect(saveListingTranslation).toHaveBeenCalledWith("listing-1", {
        locale: "en",
        title: "New English Title",
        description: "Old English description",
      });
    });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("flags a locale in errorTabs when a required field is cleared but another field still has content", async () => {
    (fetchListingFormData as Mock<any>).mockResolvedValue({
      listing: {
        id: "listing-1",
        title: "Existing Title",
        description: "Existing description",
        slug: "existing-title",
        format: "single",
        status: "draft",
        scholarId: "scholar-1",
        scholarName: "Scholar One",
        topics: [],
        language: "ar",
        createdAt: "2024-01-01",
      },
      translations: [
        {
          locale: "en",
          status: "draft",
          fields: { title: "Old Title", description: "Old description" },
          createdAt: "2024-01-01",
          updatedAt: "2024-01-01",
        },
      ],
    });

    render(
      <TranslationModal
        isOpen
        onClose={vi.fn()}
        target={{ entity: "listing", listingId: "listing-1" }}
      />,
    );

    const titleInput = await screen.findByLabelText(/^Title/i);
    fireEvent.change(titleInput, { target: { value: "" } });

    const reviewButton = screen.getByRole("button", { name: /review/i });
    fireEvent.click(reviewButton);

    const saveButton = await screen.findByRole("button", { name: /save/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(saveListingTranslation).not.toHaveBeenCalled();
    });
    expect(screen.getByRole("tab", { name: "English" })).toHaveAttribute("aria-selected");
  });

  it("hides the publish button without TRANSLATIONS_PUBLISH", async () => {
    (useAdminPermissions as Mock<any>).mockReturnValue({
      data: { permissions: ["TRANSLATIONS_VIEW"] },
    });
    (fetchListingFormData as Mock<any>).mockResolvedValue({
      listing: {
        id: "listing-1",
        title: "Existing Title",
        description: "Existing description",
        slug: "existing-title",
        format: "single",
        status: "draft",
        scholarId: "scholar-1",
        scholarName: "Scholar One",
        topics: [],
        language: "ar",
        createdAt: "2024-01-01",
      },
      translations: [],
    });

    render(
      <TranslationModal
        isOpen
        onClose={vi.fn()}
        target={{ entity: "listing", listingId: "listing-1" }}
      />,
    );

    await screen.findByLabelText(/^Title/i);
    expect(screen.queryByRole("button", { name: /publish/i })).not.toBeInTheDocument();
  });

  it("never shows a publish button for the topic entity (no status column)", async () => {
    (fetchAdminTopic as Mock<any>).mockResolvedValue({
      id: "topic-1",
      slug: "fiqh",
      name: { en: "Fiqh" },
      orderIndex: 1,
      createdAt: "2024-01-01",
      translations: [],
    });

    render(
      <TranslationModal
        isOpen
        onClose={vi.fn()}
        target={{ entity: "topic", topicId: "topic-1", topicSlug: "fiqh" }}
      />,
    );

    await waitFor(() => {
      expect(fetchAdminTopic).toHaveBeenCalledWith("fiqh");
    });
    await screen.findByLabelText(/^Name/i);
    expect(screen.queryByRole("button", { name: /publish/i })).not.toBeInTheDocument();
  });

  it("publishes a scholar translation immediately without requiring the review/save flow", async () => {
    (fetchScholarFormData as Mock<any>).mockResolvedValue({
      scholar: {
        id: "scholar-1",
        name: "Scholar One",
        slug: "scholar-one",
        bio: "Bio text",
        mainLanguage: "ar",
        isActive: true,
        orderIndex: 999,
        createdAt: "2024-01-01",
      },
      translations: [
        {
          locale: "en",
          status: "draft",
          fields: { name: "Scholar One EN", bio: "Bio EN" },
          createdAt: "2024-01-01",
          updatedAt: "2024-01-01",
        },
      ],
    });

    render(
      <TranslationModal
        isOpen
        onClose={vi.fn()}
        target={{ entity: "scholar", scholarId: "scholar-1" }}
      />,
    );

    (publishScholarTranslation as Mock<any>).mockResolvedValue({
      locale: "en",
      status: "published",
      fields: { name: "Scholar One EN", bio: "Bio EN" },
      createdAt: "2024-01-01",
      updatedAt: "2024-01-01",
    });

    const publishButton = await screen.findByRole("button", { name: /publish/i });
    expect(publishButton).not.toBeDisabled();

    fireEvent.click(publishButton);

    await waitFor(() => {
      expect(publishScholarTranslation).toHaveBeenCalledWith("scholar-1", "en");
    });
    await screen.findByRole("button", { name: /unpublish/i });
  });

  it("does not call saveTopicTranslation when nothing changed and closes on save", async () => {
    (fetchAdminTopic as Mock<any>).mockResolvedValue({
      id: "topic-1",
      slug: "fiqh",
      name: { en: "Fiqh" },
      orderIndex: 1,
      createdAt: "2024-01-01",
      translations: [],
    });

    const onClose = vi.fn();
    render(
      <TranslationModal
        isOpen
        onClose={onClose}
        target={{ entity: "topic", topicId: "topic-1", topicSlug: "fiqh" }}
      />,
    );

    await screen.findByLabelText(/^Name/i);
    const reviewButton = screen.getByRole("button", { name: /review/i });
    fireEvent.click(reviewButton);

    const saveButton = await screen.findByRole("button", { name: /save/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(onClose).toHaveBeenCalledTimes(1);
    });
    expect(saveTopicTranslation).not.toHaveBeenCalled();
  });
});
