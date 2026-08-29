import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const turboConfig = readFileSync(resolve(import.meta.dir, "../turbo.json"), "utf8");

describe("Turbo development watch boundaries", () => {
  it("keeps core-db build-owned artifacts out of its dev inputs", () => {
    const coreDbDevTask = turboConfig.match(
      /"@sd\/core-db#dev"\s*:\s*\{(?<task>[\s\S]*?)\n\s*\},\n\s*"test"\s*:/,
    )?.groups?.task;

    expect(coreDbDevTask).toBeDefined();
    expect(coreDbDevTask).toContain('"!src/generated/**"');
    expect(coreDbDevTask).toContain('"!.generated-prisma.lock"');
    expect(coreDbDevTask).toContain('"!dist/**"');
  });
});
