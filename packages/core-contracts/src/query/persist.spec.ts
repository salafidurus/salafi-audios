import { describe, expect, it } from "bun:test";
import { shouldPersistQuery, getMaxAge, DEFAULT_MAX_AGE } from "./persist";

describe("query persistence", () => {
  describe("shouldPersistQuery", () => {
    it("should allow persisting normal user-facing keys", () => {
      expect(shouldPersistQuery(["scholars"])).toBe(true);
      expect(shouldPersistQuery(["scholars", "list"])).toBe(true);
      expect(shouldPersistQuery(["listings", "detail", "123"])).toBe(true);
      expect(shouldPersistQuery(["topics"])).toBe(true);
      expect(shouldPersistQuery(["explore", "recent"])).toBe(true);
    });

    it("should block persisting sensitive account-related keys", () => {
      expect(shouldPersistQuery(["account"])).toBe(false);
      expect(shouldPersistQuery(["account", "profile"])).toBe(false);
    });

    it("should block persisting any admin-scoped keys", () => {
      expect(shouldPersistQuery(["admin"])).toBe(false);
      expect(shouldPersistQuery(["admin", "permissions"])).toBe(false);
      expect(shouldPersistQuery(["admin", "permissions", "me"])).toBe(false);
      expect(shouldPersistQuery(["admin", "users", "list"])).toBe(false);
      expect(shouldPersistQuery(["admin", "scholars", "infinite"])).toBe(false);
    });
  });

  describe("getMaxAge", () => {
    it("should return the default max age for unknown query keys", () => {
      expect(getMaxAge(["scholars"])).toBe(DEFAULT_MAX_AGE);
      expect(getMaxAge(["listings", "123"])).toBe(DEFAULT_MAX_AGE);
    });
  });
});
