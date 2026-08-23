import { describe, expect, it } from "bun:test";

import CompletedLibraryPage, { metadata } from "./page";

describe("Completed library route", () => {
  it("renders the Completed library screen with personal-study metadata", () => {
    expect(CompletedLibraryPage).toBeDefined();
    expect(metadata).toMatchObject({ title: "Completed" });
  });
});
