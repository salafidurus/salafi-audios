import { describe, it, expect, mock, beforeEach } from "bun:test";

const originalFetch = globalThis.fetch;

function setMockFetch(impl: (url: string, init?: RequestInit) => Promise<Response>): void {
  globalThis.fetch = mock(impl) as unknown as typeof globalThis.fetch;
}

let changelog: typeof import("./changelog");

beforeEach(() => {
  globalThis.fetch = originalFetch;
  changelog = {} as typeof import("./changelog");
});

async function getModule(): Promise<typeof import("./changelog")> {
  const mod = await import("./changelog");
  mod.clearChangelogCache();
  return mod;
}

describe("buildChangelogSection", () => {
  it("falls back to npm URL when fetch fails entirely", async () => {
    setMockFetch(() => Promise.reject(new Error("Network error")));

    const { buildChangelogSection } = await getModule();
    const result = await buildChangelogSection("zod", "3.0.0", "4.0.0");

    expect(result).toContain("zod");
    expect(result).toContain("3.0.0");
    expect(result).toContain("4.0.0");
    expect(result).toContain("npmjs.com");
  });

  it("uses GitHub compare URL when repo URL is available but no releases", async () => {
    setMockFetch((url: string) => {
      if (url.startsWith("https://registry.npmjs.org/")) {
        return Promise.resolve(
          new Response(
            JSON.stringify({
              repository: { url: "git+https://github.com/colinhacks/zod.git" },
            }),
            { status: 200 },
          ),
        );
      }
      return Promise.resolve(new Response("Not found", { status: 404 }));
    });

    const { buildChangelogSection } = await getModule();
    const result = await buildChangelogSection("zod", "3.0.0", "4.0.0", "fake-token");

    expect(result).toContain("zod");
    expect(result).toContain("3.0.0");
    expect(result).toContain("4.0.0");
    expect(result).toContain("github.com");
    expect(result).toContain("compare");
  });

  it("caches npm registry lookups across calls", async () => {
    let npmCallCount = 0;
    setMockFetch((url: string) => {
      if (url.startsWith("https://registry.npmjs.org/")) {
        npmCallCount++;
        return Promise.resolve(
          new Response(
            JSON.stringify({
              repository: { url: "git+https://github.com/colinhacks/zod.git" },
            }),
            { status: 200 },
          ),
        );
      }
      return Promise.resolve(new Response("Not found", { status: 404 }));
    });

    const { buildChangelogSection } = await getModule();
    await buildChangelogSection("zod", "3.0.0", "4.0.0", "t");
    await buildChangelogSection("zod", "3.0.0", "4.0.0", "t");

    expect(npmCallCount).toBe(1);
  });

  it("strips git+ and trailing .git from repo URL", async () => {
    setMockFetch((url: string) => {
      if (url.startsWith("https://registry.npmjs.org/")) {
        return Promise.resolve(
          new Response(
            JSON.stringify({
              repository: { url: "git+https://github.com/colinhacks/zod.git" },
            }),
            { status: 200 },
          ),
        );
      }
      return Promise.resolve(new Response("Not found", { status: 404 }));
    });

    const { buildChangelogSection } = await getModule();
    const result = await buildChangelogSection("zod", "3.0.0", "4.0.0", "t");

    expect(result).toContain("github.com/colinhacks/zod");
    expect(result).not.toContain("git+");
    expect(result).not.toContain(".git");
  });

  it("returns npm URL when registry has no repository field", async () => {
    setMockFetch((url: string) => {
      return Promise.resolve(new Response(JSON.stringify({ name: "zod" }), { status: 200 }));
    });

    const { buildChangelogSection } = await getModule();
    const result = await buildChangelogSection("zod", "3.0.0", "4.0.0");

    expect(result).toContain("npmjs.com");
  });
});
