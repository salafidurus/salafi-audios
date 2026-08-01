import { describe, it, expect } from "bun:test";

import type { TranslationEntityConfig } from "@/features/admin/components/Translation/translation-entities";
import type { TranslationFormState } from "@/features/admin/hooks/Translation/useTranslationForm";

import { computeLocalesToSave } from "./translation-save";

const config: TranslationEntityConfig = {
  fields: [
    { key: "title", labelKey: "x", fallbackLabel: "Title", required: true },
    { key: "description", labelKey: "y", fallbackLabel: "Description" },
  ],
  supportsPublish: true,
  load: async () => {
    throw new Error("not used in this spec");
  },
  save: async () => {
    throw new Error("not used in this spec");
  },
};

function baseState(overrides: Partial<TranslationFormState> = {}): TranslationFormState {
  return {
    status: "ready",
    entityId: "entity-1",
    mainLocale: "ar",
    source: { title: "Source title", description: "Source description" },
    initial: {},
    edits: {},
    translationStatus: {},
    saving: false,
    error: null,
    ...overrides,
  };
}

describe("computeLocalesToSave", () => {
  it("skips locales with no edits", () => {
    const state = baseState({
      initial: { en: { title: "Old", description: "Old desc" } },
    });
    const { toSave, errorLocales } = computeLocalesToSave(config, state, ["en"]);
    expect(toSave.size).toBe(0);
    expect(errorLocales).toEqual([]);
  });

  it("merges the full field set for a dirty locale, including untouched fields", () => {
    const state = baseState({
      initial: { en: { title: "Old", description: "Old desc" } },
      edits: { en: { title: "New" } },
    });
    const { toSave, errorLocales } = computeLocalesToSave(config, state, ["en"]);
    expect(errorLocales).toEqual([]);
    expect(toSave.get("en")).toEqual({ title: "New", description: "Old desc" });
  });

  it("flags a locale as an error when a required field is cleared but other content remains", () => {
    const state = baseState({
      initial: { en: { title: "Old", description: "Old desc" } },
      edits: { en: { title: "", description: "Still here" } },
    });
    const { toSave, errorLocales } = computeLocalesToSave(config, state, ["en"]);
    expect(errorLocales).toEqual(["en"]);
    expect(toSave.size).toBe(0);
  });

  it("silently drops a locale that was fully cleared (nothing to persist)", () => {
    const state = baseState({
      initial: { en: { title: "Old", description: "Old desc" } },
      edits: { en: { title: "", description: "" } },
    });
    const { toSave, errorLocales } = computeLocalesToSave(config, state, ["en"]);
    expect(errorLocales).toEqual([]);
    expect(toSave.size).toBe(0);
  });

  it("handles multiple dirty locales independently", () => {
    const state = baseState({
      initial: {
        en: { title: "Old EN", description: "" },
        ar: { title: "Old AR", description: "" },
      },
      edits: {
        en: { title: "New EN" },
        ar: { title: "" },
      },
    });
    const { toSave, errorLocales } = computeLocalesToSave(config, state, ["en", "ar"]);
    expect(errorLocales).toEqual([]);
    expect(toSave.get("en")).toEqual({ title: "New EN", description: "" });
    expect(toSave.has("ar")).toBe(false); // fully cleared
  });
});
