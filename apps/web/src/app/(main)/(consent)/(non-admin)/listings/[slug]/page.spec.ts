import { beforeEach, describe, expect, it, vi } from "bun:test";

import { generateMetadata } from "./page";

vi.mock("@/core/config/env", () => ({
  getApiBaseUrl: vi.fn(() => "http://localhost:4000"),
}));

vi.mock("@/features/details/screens/listing-detail/listing-detail.screen", () => ({
  ListingDetailScreen: () => null,
}));

describe("listing metadata API request", () => {
  beforeEach(() => {
    global.fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ id: "listing-1", title: "Tafsir" }), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    ) as unknown as typeof fetch;
  });

  it("uses the versioned application endpoint", async () => {
    await generateMetadata({ params: Promise.resolve({ slug: "tafsir-al-fatiha" }) });

    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost:4000/v1/listings/tafsir-al-fatiha",
      { next: { revalidate: 600 } },
    );
  });
});
