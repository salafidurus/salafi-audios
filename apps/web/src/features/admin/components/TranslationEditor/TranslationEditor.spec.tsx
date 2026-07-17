import { describe, it, expect, beforeEach, vi, type Mock } from "bun:test";
import { render, screen, fireEvent, act } from "@testing-library/react";
import type { TranslationTarget, TranslationViewDto } from "@sd/core-contracts";
import {
  useContentTranslations,
  useSaveTranslation,
  usePublishTranslation,
  useUnpublishTranslation,
} from "@sd/domain-content";
import { TranslationEditor } from "./TranslationEditor";

vi.mock("@sd/core-i18n", () => ({
  SUPPORTED_LOCALES: ["en", "ar"],
}));

vi.mock("@sd/domain-content", () => ({
  useContentTranslations: vi.fn(),
  useSaveTranslation: vi.fn(),
  usePublishTranslation: vi.fn(),
  useUnpublishTranslation: vi.fn(),
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (k: string) => k }),
}));

const mockTarget: TranslationTarget = { entity: "scholar", scholarId: "scholar-1" };

const mockFields = [
  { key: "name", label: "Name" },
  { key: "bio", label: "Bio", multiline: true },
];

const mockOriginalValues = { name: "Ibn Baz", bio: "A great scholar" };

const makeMutation = (mutateFn = vi.fn()) => ({
  mutate: mutateFn,
  isPending: false,
});

const makeTranslation = (overrides: Partial<TranslationViewDto> = {}): TranslationViewDto => ({
  locale: "ar",
  status: "draft",
  fields: { name: "ابن باز", bio: "" },
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-01T00:00:00Z",
  ...overrides,
});

describe("TranslationEditor", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useContentTranslations as Mock<any>).mockReturnValue({ data: undefined });
    (useSaveTranslation as Mock<any>).mockReturnValue(makeMutation());
    (usePublishTranslation as Mock<any>).mockReturnValue(makeMutation());
    (useUnpublishTranslation as Mock<any>).mockReturnValue(makeMutation());
  });

  it("shows original values as placeholder when no translation exists", () => {
    render(
      <TranslationEditor
        target={mockTarget}
        fields={mockFields}
        originalValues={mockOriginalValues}
      />,
    );
    expect(screen.getByPlaceholderText("Ibn Baz")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("A great scholar")).toBeInTheDocument();
  });

  it("calls saveTranslation.mutate when Save draft is clicked", () => {
    const mutateFn = vi.fn();
    (useSaveTranslation as Mock<any>).mockReturnValue(makeMutation(mutateFn));
    render(
      <TranslationEditor
        target={mockTarget}
        fields={mockFields}
        originalValues={mockOriginalValues}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /save draft/i }));
    expect(mutateFn).toHaveBeenCalledTimes(1);
  });

  it("calls publishTranslation.mutate when Publish is clicked", () => {
    const mutateFn = vi.fn();
    (usePublishTranslation as Mock<any>).mockReturnValue(makeMutation(mutateFn));
    (useContentTranslations as Mock<any>).mockReturnValue({
      data: { translations: [makeTranslation({ status: "draft" })] },
    });
    render(
      <TranslationEditor
        target={mockTarget}
        fields={mockFields}
        originalValues={mockOriginalValues}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /ar/i }));
    fireEvent.click(screen.getByRole("button", { name: /^publish$/i }));
    expect(mutateFn).toHaveBeenCalledTimes(1);
  });

  it("calls unpublishTranslation.mutate when Unpublish is clicked", async () => {
    const mutateFn = vi.fn();
    (useUnpublishTranslation as Mock<any>).mockReturnValue(makeMutation(mutateFn));
    (useContentTranslations as Mock<any>).mockReturnValue({
      data: { translations: [makeTranslation({ status: "published" })] },
    });
    render(
      <TranslationEditor
        target={mockTarget}
        fields={mockFields}
        originalValues={mockOriginalValues}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /ar/i }));
    fireEvent.click(screen.getByRole("button", { name: /unpublish/i }));
    // Wait for modal to appear and click confirm button
    const confirmButtons = await screen.findAllByRole("button", { name: /unpublish/i });
    const modalUnpublishBtn = confirmButtons[confirmButtons.length - 1]!;
    await act(async () => {
      fireEvent.click(modalUnpublishBtn);
    });
    expect(mutateFn).toHaveBeenCalledTimes(1);
  });

  it("shows 'draft' status badge when translation status is draft", () => {
    (useContentTranslations as Mock<any>).mockReturnValue({
      data: { translations: [makeTranslation({ status: "draft" })] },
    });
    render(
      <TranslationEditor
        target={mockTarget}
        fields={mockFields}
        originalValues={mockOriginalValues}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /ar/i }));
    expect(screen.getByTestId("status-badge")).toHaveTextContent(/draft/i);
  });

  it("shows 'published' status badge when translation status is published", () => {
    (useContentTranslations as Mock<any>).mockReturnValue({
      data: { translations: [makeTranslation({ status: "published" })] },
    });
    render(
      <TranslationEditor
        target={mockTarget}
        fields={mockFields}
        originalValues={mockOriginalValues}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /ar/i }));
    expect(screen.getByTestId("status-badge")).toHaveTextContent(/published/i);
  });
});
