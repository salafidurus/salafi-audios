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
  it("shows an editable slug field for a staged module and dispatches EDIT_MODULE on change", () => {
    const dispatch = vi.fn();
    render(<UploadArrangeArrangeTab state={collectionState()} dispatch={dispatch} />);

    const slugInput = screen.getByLabelText(/slug/i);
    expect(slugInput).toHaveValue("bukhari-book-of-faith");

    fireEvent.change(slugInput, { target: { value: "bukhari-custom-slug" } });

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
