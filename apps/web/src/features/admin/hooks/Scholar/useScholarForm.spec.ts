import type { ScholarFormDataDto } from "@sd/core-contracts";

import { act, renderHook } from "@testing-library/react";
import { describe, it, expect } from "bun:test";

import { useScholarForm } from "./useScholarForm";

const editData: ScholarFormDataDto = {
  scholar: {
    id: "scholar-1",
    name: "محمد بن صالح العثيمين",
    slug: "uthaymin",
    isActive: true,
    orderIndex: 1,
    createdAt: "2024-01-01",
  },
  translations: [],
};

describe("useScholarForm — slug immutability", () => {
  it("allows setting slug while creating (not editing)", () => {
    const { result } = renderHook(() => useScholarForm());

    act(() => {
      result.current.dispatch({ type: "UPDATE_FIELD", field: "slug", value: "new-slug" });
    });

    expect(result.current.state.slug).toBe("new-slug");
  });

  it("ignores UPDATE_FIELD for slug once editing an existing scholar", () => {
    const { result } = renderHook(() => useScholarForm());

    act(() => {
      result.current.dispatch({ type: "INIT_FORM", data: editData });
    });
    expect(result.current.state.isEditing).toBe(true);
    expect(result.current.state.slug).toBe("uthaymin");

    act(() => {
      result.current.dispatch({ type: "UPDATE_FIELD", field: "slug", value: "hacked-slug" });
    });

    expect(result.current.state.slug).toBe("uthaymin");
  });

  it("still allows editing mutable fields (name) while editing", () => {
    const { result } = renderHook(() => useScholarForm());

    act(() => {
      result.current.dispatch({ type: "INIT_FORM", data: editData });
      result.current.dispatch({ type: "UPDATE_FIELD", field: "name", value: "اسم جديد" });
    });

    expect(result.current.state.name).toBe("اسم جديد");
  });
});
