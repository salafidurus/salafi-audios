import { describe, it, expect } from "bun:test";
import { retry } from "./retry";

describe("retry", () => {
  it("resolves when operation succeeds on first attempt", async () => {
    const result = await retry(async () => "ok");
    expect(result).toBe("ok");
  });

  it("retries on failure and eventually succeeds", async () => {
    let attempts = 0;
    const result = await retry(
      async () => {
        attempts++;
        if (attempts < 3) throw new Error("not yet");
        return "finally";
      },
      { retries: 3, minTimeout: 10 },
    );
    expect(result).toBe("finally");
    expect(attempts).toBe(3);
  });

  it("throws after exhausting retries", async () => {
    let attempts = 0;
    await expect(
      retry(
        async () => {
          attempts++;
          throw new Error("persistent");
        },
        { retries: 2, minTimeout: 10 },
      ),
    ).rejects.toThrow("persistent");
    expect(attempts).toBe(3);
  });

  it("uses provided minTimeout for backoff", async () => {
    let attempts = 0;
    const start = performance.now();
    await expect(
      retry(
        async () => {
          attempts++;
          throw new Error("fail");
        },
        { retries: 2, minTimeout: 50 },
      ),
    ).rejects.toThrow();
    const elapsed = performance.now() - start;
    // First retry at 50ms, second at 100ms — total ~150ms
    expect(elapsed).toBeGreaterThan(100);
  });
});
