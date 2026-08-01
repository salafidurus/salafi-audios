import type { TranslationViewDto } from "@sd/core-contracts";

import { act, renderHook } from "@testing-library/react";
import { describe, it, expect } from "bun:test";

import { getFieldValue, isLocaleDirty, useTranslationForm } from "./useTranslationForm";

const translations: TranslationViewDto[] = [
  {
    locale: "en",
    status: "draft",
    fields: { title: "Existing English Title", description: "Existing description" },
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
  },
];

describe("useTranslationForm", () => {
  it("starts in loading status before INIT", () => {
    const { result } = renderHook(() => useTranslationForm());
    expect(result.current.state.status).toBe("loading");
    expect(result.current.state.entityId).toBeNull();
  });

  it("INIT hydrates source, initial, and translationStatus from the loaded translations", () => {
    const { result } = renderHook(() => useTranslationForm());

    act(() => {
      result.current.dispatch({
        type: "INIT",
        entityId: "listing-1",
        mainLocale: "ar",
        source: { title: "العنوان", description: "الوصف" },
        translations,
      });
    });

    expect(result.current.state.status).toBe("ready");
    expect(result.current.state.entityId).toBe("listing-1");
    expect(result.current.state.mainLocale).toBe("ar");
    expect(result.current.state.source).toEqual({ title: "العنوان", description: "الوصف" });
    expect(result.current.state.initial.en).toEqual({
      title: "Existing English Title",
      description: "Existing description",
    });
    expect(result.current.state.translationStatus.en).toBe("draft");
    // A locale with no translation row yet has no initial values or status.
    expect(result.current.state.initial.ar).toBeUndefined();
    expect(result.current.state.translationStatus.ar).toBeUndefined();
  });

  it("EDIT_FIELD records a per-locale, per-field edit without touching other fields", () => {
    const { result } = renderHook(() => useTranslationForm());

    act(() => {
      result.current.dispatch({
        type: "INIT",
        entityId: "listing-1",
        mainLocale: "ar",
        source: { title: "العنوان", description: "الوصف" },
        translations,
      });
    });

    act(() => {
      result.current.dispatch({
        type: "EDIT_FIELD",
        locale: "en",
        field: "title",
        value: "Updated Title",
      });
    });

    expect(getFieldValue(result.current.state, "en", "title")).toBe("Updated Title");
    // Untouched field falls back to the initial (last-saved) value.
    expect(getFieldValue(result.current.state, "en", "description")).toBe("Existing description");
    // A locale never edited falls back to "" for any field.
    expect(getFieldValue(result.current.state, "ar", "title")).toBe("");
  });

  it("isLocaleDirty is false until an edit actually differs from the initial value", () => {
    const { result } = renderHook(() => useTranslationForm());

    act(() => {
      result.current.dispatch({
        type: "INIT",
        entityId: "listing-1",
        mainLocale: "ar",
        source: { title: "العنوان" },
        translations,
      });
    });

    expect(isLocaleDirty(result.current.state, "en")).toBe(false);

    act(() => {
      result.current.dispatch({
        type: "EDIT_FIELD",
        locale: "en",
        field: "title",
        value: "Existing English Title",
      });
    });

    // Same value as initial — not dirty.
    expect(isLocaleDirty(result.current.state, "en")).toBe(false);

    act(() => {
      result.current.dispatch({
        type: "EDIT_FIELD",
        locale: "en",
        field: "title",
        value: "Something else",
      });
    });

    expect(isLocaleDirty(result.current.state, "en")).toBe(true);
  });

  it("SET_STATUS updates only the given locale's translationStatus", () => {
    const { result } = renderHook(() => useTranslationForm());

    act(() => {
      result.current.dispatch({
        type: "INIT",
        entityId: "listing-1",
        mainLocale: "ar",
        source: {},
        translations,
      });
    });

    act(() => {
      result.current.dispatch({ type: "SET_STATUS", locale: "en", status: "published" });
    });

    expect(result.current.state.translationStatus.en).toBe("published");
    expect(result.current.state.translationStatus.ar).toBeUndefined();
  });

  it("SET_ERROR transitions loading -> error, but a save error from ready stays ready", () => {
    const { result } = renderHook(() => useTranslationForm());

    act(() => {
      result.current.dispatch({ type: "SET_ERROR", error: "Failed to load" });
    });
    expect(result.current.state.status).toBe("error");

    act(() => {
      result.current.dispatch({
        type: "INIT",
        entityId: "listing-1",
        mainLocale: "ar",
        source: {},
        translations: [],
      });
    });
    expect(result.current.state.status).toBe("ready");

    act(() => {
      result.current.dispatch({ type: "SET_SAVING", saving: true });
      result.current.dispatch({ type: "SET_ERROR", error: "Failed to save" });
    });
    expect(result.current.state.status).toBe("ready");
    expect(result.current.state.error).toBe("Failed to save");
  });
});
