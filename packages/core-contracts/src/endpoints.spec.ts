import { describe, expect, it } from "bun:test";

import { endpoints } from "./endpoints";

describe("public content endpoint builders", () => {
  it("builds catalog and audio paths from public slug identities", () => {
    expect(endpoints.listings.detail("tafsir-al-fatiha")).toBe("/listings/tafsir-al-fatiha");
    expect(endpoints.listings.related("tafsir-al-fatiha")).toBe(
      "/listings/tafsir-al-fatiha/related",
    );
    expect(endpoints.audio.progress.update("tafsir-al-fatiha")).toBe(
      "/audio/progress/tafsir-al-fatiha",
    );
    expect(endpoints.audio.listings.stream("tafsir-al-fatiha")).toBe(
      "/audio/listings/tafsir-al-fatiha/stream",
    );
  });
});
