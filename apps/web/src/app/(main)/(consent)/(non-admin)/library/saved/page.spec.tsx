import { describe, expect, it } from "bun:test";

import SavedLibraryPage, { metadata } from "./page";

describe("Saved library route", () => {
  it("renders the Saved library screen with personal-study metadata", () => {
    expect(SavedLibraryPage).toBeDefined();
    expect(metadata).toMatchObject({ title: "Saved" });
  });
});
