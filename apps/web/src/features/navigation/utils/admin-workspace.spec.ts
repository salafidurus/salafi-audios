import { describe, expect, it } from "bun:test";

import { getAdminReturnPath, isSafePublicPath, rememberAdminReturnPath } from "./admin-workspace";

describe("admin workspace return path", () => {
  it("accepts same-app public paths and rejects admin or external paths", () => {
    expect(isSafePublicPath("/explore/recent?topic=fiqh")).toBe(true);
    expect(isSafePublicPath("/")).toBe(true);
    expect(isSafePublicPath("/admin/users")).toBe(false);
    expect(isSafePublicPath("/administer")).toBe(true);
    expect(isSafePublicPath("https://evil.example/steal")).toBe(false);
    expect(isSafePublicPath("//evil.example/steal")).toBe(false);
  });

  it("remembers only safe public paths and falls back to home", () => {
    const storage = new Map<string, string>();
    const adapter = {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => storage.set(key, value),
    };

    rememberAdminReturnPath("/my-library?tab=saved", adapter);
    expect(getAdminReturnPath(adapter)).toBe("/my-library?tab=saved");

    rememberAdminReturnPath("/admin/users", adapter);
    expect(getAdminReturnPath(adapter)).toBe("/my-library?tab=saved");
  });
});
