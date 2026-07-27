import { describe, it, expect } from "bun:test";
import { act, renderHook } from "@testing-library/react";
import type { ListingFormDataDto } from "@sd/core-contracts";
import { useListingForm } from "./useListingForm";

const editData: ListingFormDataDto = {
  listing: {
    id: "listing-1",
    slug: "bukhari-bayquniyyah",
    title: "al-Bayquniyyah",
    format: "series",
    status: "published",
    scholarId: "scholar-1",
    scholarName: "al-Bukhari",
    topics: [],
    createdAt: "2024-01-01",
  },
  translations: [],
};

describe("useListingForm — slug/scholarId/format immutability", () => {
  it("allows setting slug, scholarId, and format while creating (not editing)", () => {
    const { result } = renderHook(() => useListingForm());

    act(() => {
      result.current.dispatch({ type: "UPDATE_FIELD", field: "scholarId", value: "scholar-1" });
      result.current.dispatch({ type: "UPDATE_FIELD", field: "slug", value: "bukhari-new" });
      result.current.dispatch({ type: "UPDATE_FIELD", field: "format", value: "collection" });
    });

    expect(result.current.state.scholarId).toBe("scholar-1");
    expect(result.current.state.slug).toBe("bukhari-new");
    expect(result.current.state.format).toBe("collection");
  });

  it("ignores UPDATE_FIELD for slug once editing an existing listing", () => {
    const { result } = renderHook(() => useListingForm());

    act(() => {
      result.current.dispatch({ type: "INIT_FORM", data: editData });
    });
    expect(result.current.state.isEditing).toBe(true);
    expect(result.current.state.slug).toBe("bukhari-bayquniyyah");

    act(() => {
      result.current.dispatch({ type: "UPDATE_FIELD", field: "slug", value: "hacked-slug" });
    });

    expect(result.current.state.slug).toBe("bukhari-bayquniyyah");
  });

  it("ignores UPDATE_FIELD for scholarId once editing an existing listing", () => {
    const { result } = renderHook(() => useListingForm());

    act(() => {
      result.current.dispatch({ type: "INIT_FORM", data: editData });
      result.current.dispatch({ type: "UPDATE_FIELD", field: "scholarId", value: "other-scholar" });
    });

    expect(result.current.state.scholarId).toBe("scholar-1");
  });

  it("ignores UPDATE_FIELD for format once editing an existing listing", () => {
    const { result } = renderHook(() => useListingForm());

    act(() => {
      result.current.dispatch({ type: "INIT_FORM", data: editData });
      result.current.dispatch({ type: "UPDATE_FIELD", field: "format", value: "single" });
    });

    expect(result.current.state.format).toBe("series");
  });

  it("still allows editing mutable fields (title) while editing", () => {
    const { result } = renderHook(() => useListingForm());

    act(() => {
      result.current.dispatch({ type: "INIT_FORM", data: editData });
      result.current.dispatch({ type: "UPDATE_FIELD", field: "title", value: "Updated title" });
    });

    expect(result.current.state.title).toBe("Updated title");
  });
});
