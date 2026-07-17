import { describe, it, expect, afterEach } from "bun:test";
import { clearBearerToken, getBearerToken, setBearerToken } from "./bearer-token";

describe("bearer-token store", () => {
  afterEach(() => window.localStorage.clear());

  it("returns null when no token is stored", () => {
    expect(getBearerToken()).toBeNull();
  });

  it("persists and reads back a token", () => {
    setBearerToken("tok_abc");
    expect(getBearerToken()).toBe("tok_abc");
  });

  it("overwrites an existing token", () => {
    setBearerToken("tok_old");
    setBearerToken("tok_new");
    expect(getBearerToken()).toBe("tok_new");
  });

  it("clears a stored token", () => {
    setBearerToken("tok_abc");
    clearBearerToken();
    expect(getBearerToken()).toBeNull();
  });
});
