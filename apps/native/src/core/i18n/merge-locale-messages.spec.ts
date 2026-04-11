import { mergeLocaleMessages } from "./merge-locale-messages";

describe("mergeLocaleMessages", () => {
  it("returns shared unchanged when overrides is empty", () => {
    const shared = { common: { ok: "OK" }, auth: { login: "Login" } };
    const result = mergeLocaleMessages(shared, {});
    expect(result).toEqual(shared);
  });

  it("overrides a leaf value", () => {
    const shared = { common: { ok: "OK" } };
    const overrides = { common: { ok: "All good" } };
    const result = mergeLocaleMessages(shared, overrides);
    expect(result.common.ok).toBe("All good");
  });

  it("deep-merges nested objects without losing other leaves", () => {
    const shared = { common: { ok: "OK", cancel: "Cancel" } };
    const overrides = { common: { ok: "Custom OK" } } as Partial<typeof shared>;
    const result = mergeLocaleMessages(shared, overrides);
    expect(result.common).toEqual({ ok: "Custom OK", cancel: "Cancel" });
  });

  it("does not mutate the shared object", () => {
    const shared = { common: { ok: "OK" } };
    const overrides = { common: { ok: "Overridden" } };
    mergeLocaleMessages(shared, overrides);
    expect(shared.common.ok).toBe("OK");
  });

  it("handles deeply nested overrides", () => {
    const shared = { a: { b: { c: "original", d: "keep" } } } as Record<string, unknown>;
    const overrides = { a: { b: { c: "replaced" } } } as Record<string, unknown>;
    const result = mergeLocaleMessages(shared, overrides);
    expect((result.a as Record<string, unknown>).b).toEqual({ c: "replaced", d: "keep" });
  });

  it("adds new keys from overrides", () => {
    const shared = { common: { ok: "OK" } } as Record<string, unknown>;
    const overrides = { extra: "new value" } as Record<string, unknown>;
    const result = mergeLocaleMessages(shared, overrides);
    expect(result.extra).toBe("new value");
  });
});
