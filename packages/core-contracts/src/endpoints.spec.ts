import { describe, expect, it } from "bun:test";

import { endpoints } from "./endpoints";

describe("public content endpoint builders", () => {
  it("builds catalog and audio paths from public slug identities", () => {
    expect(endpoints.listings.detail("tafsir-al-fatiha")).toBe("/v1/listings/tafsir-al-fatiha");
    expect(endpoints.listings.related("tafsir-al-fatiha")).toBe(
      "/v1/listings/tafsir-al-fatiha/related",
    );
    expect(endpoints.audio.progress.update("tafsir-al-fatiha")).toBe(
      "/v1/audio/progress/tafsir-al-fatiha",
    );
    expect(endpoints.audio.listings.stream("tafsir-al-fatiha")).toBe(
      "/v1/audio/listings/tafsir-al-fatiha/stream",
    );
  });

  it("builds static application paths under the versioned namespace", () => {
    expect(endpoints.search.general).toBe("/v1/search");
    expect(endpoints.topics.list).toBe("/v1/topics");
    expect(endpoints.myLibrary.savedSync).toBe("/v1/me/my-library/saved/sync");
    expect(endpoints.admin.dashboard).toBe("/v1/admin/dashboard");
  });
});
