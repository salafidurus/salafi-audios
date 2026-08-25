import { describe, expect, it } from "bun:test";

import { themeCss } from "./theme-css";

describe("theme CSS", () => {
  it("emits only light and dark theme selectors", () => {
    expect(themeCss).toContain(':root[data-theme="light"]');
    expect(themeCss).toContain(':root[data-theme="dark"]');
    expect(themeCss).not.toContain("data-accent-theme");
    expect(themeCss).not.toContain("parchment");
    expect(themeCss).not.toContain("manuscript");
    expect(themeCss).not.toContain("midnight");
    expect(themeCss).not.toContain("ember");
  });
});
