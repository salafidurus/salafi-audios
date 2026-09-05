import { beforeEach, describe, expect, it, vi } from "bun:test";

import { generateMetadata } from "./page";

vi.mock("./scholar-detail-inner", () => ({
  default: () => null,
}));

describe("scholar metadata API request", () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_API_URL = "http://localhost:4000";
    global.fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ name: "Ibn Baz" }), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    ) as unknown as typeof fetch;
  });

  it("uses the versioned application endpoint", async () => {
    await generateMetadata({ params: Promise.resolve({ slug: "ibn-baz" }) });

    expect(global.fetch).toHaveBeenCalledWith("http://localhost:4000/v1/scholars/ibn-baz", {
      next: { revalidate: 3600 },
    });
  });
});
