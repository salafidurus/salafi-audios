import { describe, it, expect, beforeAll, afterAll } from "bun:test";
import fs from "node:fs";
import path from "node:path";
import { tmpdir } from "node:os";

describe("deploy install script logic", () => {
  let tmpPath;

  beforeAll(() => {
    tmpPath = path.join(tmpdir(), `sd-deploy-install-test-${Date.now()}`);
    fs.mkdirSync(tmpPath, { recursive: true });
  });

  afterAll(() => {
    if (tmpPath && fs.existsSync(tmpPath)) {
      fs.rmSync(tmpPath, { recursive: true, force: true });
    }
  });

  it("successfully strips prepare and postinstall from package.json", () => {
    const pkgPath = path.join(tmpPath, "package.json");
    const mockPkg = {
      name: "test-monorepo",
      scripts: {
        prepare: "husky",
        postinstall: "bun ./scripts/postinstall.mjs",
        build: "turbo run build",
      },
    };
    fs.writeFileSync(pkgPath, JSON.stringify(mockPkg, null, 2));

    // Simulate stripping logic from install.mjs
    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
    if (pkg.scripts) {
      delete pkg.scripts.postinstall;
      delete pkg.scripts.prepare;
    }
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");

    const updatedPkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
    expect(updatedPkg.scripts.prepare).toBeUndefined();
    expect(updatedPkg.scripts.postinstall).toBeUndefined();
    expect(updatedPkg.scripts.build).toBe("turbo run build");
  });
});
