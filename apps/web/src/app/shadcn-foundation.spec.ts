import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "bun:test";

import { cn } from "../shared/utils/cn";

const root = resolve(import.meta.dir, "../..");
const globalsCss = readFileSync(resolve(root, "src/app/globals.css"), "utf8");
const componentsConfig = JSON.parse(
  readFileSync(resolve(root, "components.json"), "utf8"),
) as { aliases: Record<string, string> };

describe("shadcn foundation", () => {
  it("uses the existing shared component location as the only UI boundary", () => {
    expect(componentsConfig.aliases.ui).toBe("@/shared/components");
    expect(componentsConfig.aliases.components).toBe("@/shared/components");
  });

  it("maps shadcn semantic roles to design-token variables", () => {
    expect(globalsCss).toContain("--color-background: var(--surface-canvas);");
    expect(globalsCss).toContain("--color-primary: var(--action-primary);");
    expect(globalsCss).toContain("--color-destructive: var(--action-danger);");
    expect(globalsCss).toContain("--color-ring: var(--border-focus);");
  });

  it("emits dark utilities from document theme state", () => {
    expect(globalsCss).toContain('[data-theme="dark"]');
    expect(globalsCss).toContain("@custom-variant dark");
  });

  it("provides the shared class utility used by generated primitives", () => {
    expect(cn("bg-background", undefined, "text-foreground")).toBe(
      "bg-background text-foreground",
    );
  });
});
