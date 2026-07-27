import { describe, it, expect, vi } from "bun:test";
import { render, screen, fireEvent } from "@testing-library/react";
import { UploadArrangeArrangeTab } from "./UploadArrangeArrangeTab";
import type { UploadArrangeState } from "@/features/admin/hooks/Content/useUploadArrangeState";

vi.mock("@/core/i18n/use-translation", () => ({
  useTranslation: () => ({
    t: (_key: string, fallback: string) => fallback,
  }),
}));

function collectionState(): UploadArrangeState {
  return {
    existing: {
      id: "coll-1",
      slug: "bukhari",
      title: "Sahih al-Bukhari",
      format: "collection",
      scholarId: "scholar-1",
      status: "published",
      modules: [],
      lessons: [],
    },
    items: [],
    newModules: [
      {
        tempId: "temp-1",
        slug: "bukhari-book-of-faith",
        slugEdited: false,
        title: "Book of Faith",
        description: "",
        status: "draft",
        orderIndex: 2,
      },
    ],
    phase: "editing",
    error: null,
    conflictSlugs: [],
  };
}

describe("UploadArrangeArrangeTab — collection module fields", () => {
  it("locks the root-slug prefix and only lets the suffix be edited for a staged module", () => {
    const dispatch = vi.fn();
    render(<UploadArrangeArrangeTab state={collectionState()} dispatch={dispatch} />);

    // The root prefix is shown as a fixed badge, not part of the editable value.
    expect(screen.getByText("bukhari-")).toBeInTheDocument();
    const slugInput = screen.getByLabelText(/slug/i);
    expect(slugInput).toHaveValue("book-of-faith");

    fireEvent.change(slugInput, { target: { value: "custom slug" } });

    // The dispatched value is always re-derived with the locked root prefix.
    expect(dispatch).toHaveBeenCalledWith({
      type: "EDIT_MODULE",
      tempId: "temp-1",
      field: "slug",
      value: "bukhari-custom-slug",
    });
  });

  it("shows a status dropdown for a staged module and dispatches EDIT_MODULE on change", () => {
    const dispatch = vi.fn();
    render(<UploadArrangeArrangeTab state={collectionState()} dispatch={dispatch} />);

    fireEvent.click(screen.getByRole("combobox"));
    fireEvent.click(screen.getByRole("option", { name: /published/i }));

    expect(dispatch).toHaveBeenCalledWith({
      type: "EDIT_MODULE",
      tempId: "temp-1",
      field: "status",
      value: "published",
    });
  });

  it("shows an order index field for a staged module and dispatches EDIT_MODULE on change", () => {
    const dispatch = vi.fn();
    render(<UploadArrangeArrangeTab state={collectionState()} dispatch={dispatch} />);

    const orderInput = screen.getByLabelText(/order/i);
    expect(orderInput).toHaveValue("2");

    fireEvent.change(orderInput, { target: { value: "5" } });

    expect(dispatch).toHaveBeenCalledWith({
      type: "EDIT_MODULE",
      tempId: "temp-1",
      field: "orderIndex",
      value: 5,
    });
  });

  it("shows a description field for a staged module and dispatches EDIT_MODULE on change", () => {
    const dispatch = vi.fn();
    render(<UploadArrangeArrangeTab state={collectionState()} dispatch={dispatch} />);

    const descriptionInput = screen.getByLabelText(/description/i);
    expect(descriptionInput).toHaveValue("");

    fireEvent.change(descriptionInput, { target: { value: "Hadith on faith" } });

    expect(dispatch).toHaveBeenCalledWith({
      type: "EDIT_MODULE",
      tempId: "temp-1",
      field: "description",
      value: "Hadith on faith",
    });
  });

  it("still flags a slug conflict on a staged module's editable slug field", () => {
    const dispatch = vi.fn();
    const state = collectionState();
    state.conflictSlugs = ["bukhari-book-of-faith"];
    render(<UploadArrangeArrangeTab state={state} dispatch={dispatch} />);

    expect(screen.getByText(/this slug is already in use/i)).toBeInTheDocument();
  });
});

function collectionStateWithStagedLesson(): UploadArrangeState {
  const state = collectionState();
  state.items = [
    {
      id: "item-1",
      source: { kind: "local", file: new File(["audio-bytes"], "Hadith 1.mp3") },
      filename: "Hadith 1.mp3",
      title: "Hadith 1",
      numericPrefix: 1,
      durationSeconds: 60,
      sizeBytes: 1000,
      contentType: "audio/mpeg",
      ext: "mp3",
      assignment: {
        kind: "new-lesson",
        moduleKey: "new:temp-1",
        slug: "bukhari-book-of-faith-hadith-1",
        slugEdited: false,
        description: "",
        status: "draft",
        orderIndex: 1,
      },
      suggestion: null,
      upload: { status: "pending", percent: 0 },
    },
  ];
  return state;
}

describe("UploadArrangeArrangeTab — collection lesson slug prefix", () => {
  it("locks the immediate parent module's slug prefix and only lets the suffix be edited", () => {
    const dispatch = vi.fn();
    render(
      <UploadArrangeArrangeTab state={collectionStateWithStagedLesson()} dispatch={dispatch} />,
    );

    // Prefixed by the module's slug, not just the root's.
    expect(screen.getByText("bukhari-book-of-faith-")).toBeInTheDocument();
    const slugInput = screen.getByDisplayValue("hadith-1");

    fireEvent.change(slugInput, { target: { value: "custom" } });

    expect(dispatch).toHaveBeenCalledWith({
      type: "SET_LESSON_FIELD",
      itemId: "item-1",
      field: "slug",
      value: "bukhari-book-of-faith-custom",
    });
  });
});
