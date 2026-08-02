import { describe, it, expect } from "bun:test";

import { resolveLastWriteWins } from "./last-write-wins";

describe("resolveLastWriteWins", () => {
  it("returns the incoming entity when there is no current entity", () => {
    const incoming = { id: "a", updatedAt: "2026-01-01T00:00:00.000Z" };

    expect(resolveLastWriteWins(undefined, incoming)).toBe(incoming);
  });

  it("returns the incoming entity when it is newer than the current entity", () => {
    const current = { id: "a", updatedAt: "2026-01-01T00:00:00.000Z" };
    const incoming = { id: "a", updatedAt: "2026-01-02T00:00:00.000Z" };

    expect(resolveLastWriteWins(current, incoming)).toBe(incoming);
  });

  it("keeps the current entity when the incoming entity is older", () => {
    const current = { id: "a", updatedAt: "2026-01-02T00:00:00.000Z" };
    const incoming = { id: "a", updatedAt: "2026-01-01T00:00:00.000Z" };

    expect(resolveLastWriteWins(current, incoming)).toBe(current);
  });

  it("prefers the incoming entity on an exact timestamp tie", () => {
    const current = { id: "a", updatedAt: "2026-01-01T00:00:00.000Z" };
    const incoming = { id: "a", updatedAt: "2026-01-01T00:00:00.000Z" };

    expect(resolveLastWriteWins(current, incoming)).toBe(incoming);
  });
});
