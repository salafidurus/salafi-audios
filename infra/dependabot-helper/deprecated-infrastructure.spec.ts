import { describe, expect, it } from "bun:test";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const rootDir = resolve(import.meta.dirname, "../..");

describe("deprecated dependency automation boundary", () => {
  it("removes the retired implementation directories and policy file", () => {
    expect(existsSync(resolve(rootDir, "infra", "catalog"))).toBe(false);
    expect(existsSync(resolve(rootDir, "infra", "pkg" + "-update"))).toBe(false);
    expect(existsSync(resolve(rootDir, "catalog" + ".config.json"))).toBe(false);
  });

  it("keeps only the Dependabot Helper package entry point", () => {
    const scripts = JSON.parse(readFileSync(resolve(rootDir, "package.json"), "utf8")).scripts;

    expect(scripts.dependabotHelper).toBeUndefined();
    expect(scripts.catalog).toBeUndefined();
    expect(scripts.pkgUpdate).toBeUndefined();
    expect(scripts["pkg" + "-update"]).toBeUndefined();
    expect(scripts["pkg" + "-update:ci"]).toBeUndefined();
    expect(scripts["dependabot-helper"]).toBe("bun run --filter dependabot-helper cli");

    const helperScripts = JSON.parse(
      readFileSync(resolve(rootDir, "infra", "dependabot-helper", "package.json"), "utf8"),
    ).scripts;
    expect(helperScripts.validate).toBe("bun cli.ts validate");
    expect(helperScripts.check).toBe("bun cli.ts check");
    expect(helperScripts.update).toBe("bun cli.ts update");
    expect(helperScripts.align).toBe("bun cli.ts align");
  });
});
