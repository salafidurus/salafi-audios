import { describe, expect, test } from "bun:test";

import { evidenceForFinding } from "./evidence.mjs";

const finding = (overrides = {}) => ({
  category: "likely-dead",
  confidence: "medium",
  evidence: "Knip reported a file issue.",
  file: "apps/web/src/features/orphan.ts",
  name: "orphan.ts",
  type: "file",
  ...overrides,
});

describe("dead-code evidence", () => {
  test("confirms an unreferenced ordinary file only after evidence checks", () => {
    expect(
      evidenceForFinding(finding(), {
        sources: new Map([
          ["apps/web/src/features/orphan.ts", "export const orphan = true;"],
          ["apps/web/src/features/live.ts", "export const live = true;"],
        ]),
        manifests: [],
      }),
    ).toMatchObject({ category: "confirmed-dead", confidence: "high", consumers: [] });
  });

  test("downgrades a finding with a scanned consumer to review", () => {
    expect(
      evidenceForFinding(finding(), {
        sources: new Map([
          ["apps/web/src/features/orphan.ts", "export const orphan = true;"],
          ["apps/web/src/features/consumer.ts", 'import "./orphan";'],
        ]),
        manifests: [],
      }),
    ).toMatchObject({
      category: "needs-review",
      confidence: "medium",
      consumers: ["apps/web/src/features/consumer.ts"],
    });
  });

  test("protects routes and migration history with explicit reasons", () => {
    expect(
      evidenceForFinding(finding({ file: "apps/web/src/app/page.tsx" }), {
        sources: new Map([["apps/web/src/app/page.tsx", "export default function Page() {}"]]),
        manifests: [],
      }),
    ).toMatchObject({
      category: "protected",
      protectedBy: "filesystem route or application entry point",
    });
    expect(
      evidenceForFinding(finding({ file: "packages/core-db/prisma/migrations/old.ts" }), {
        sources: new Map([["packages/core-db/prisma/migrations/old.ts", "export {};"]]),
        manifests: [],
      }),
    ).toMatchObject({ category: "historical", protectedBy: "database migration history" });
  });

  test("reports dynamic consumers instead of confirming deletion", () => {
    expect(
      evidenceForFinding(finding(), {
        sources: new Map([
          ["apps/web/src/features/orphan.ts", "export const orphan = true;"],
          ["apps/web/src/features/loader.ts", 'import("./orphan");'],
        ]),
        manifests: [],
      }),
    ).toMatchObject({
      category: "needs-review",
      dynamicSignals: ["apps/web/src/features/loader.ts"],
    });
  });
});
