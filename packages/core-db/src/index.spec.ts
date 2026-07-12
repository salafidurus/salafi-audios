/**
 * packages/core-db/src/index.spec.ts
 *
 * Schema hygiene verification tests (Stage 1 — Step 1.4).
 * Written BEFORE the migration so they fail first (TDD).
 *
 * Tests verify that:
 *  1. The `UserRole` enum is exported from @sd/core-db with the correct values.
 *  2. The User model's `banned` field defaults to `false` (non-nullable).
 */
import { describe, it, expect } from "vitest";

// -- 1. UserRole enum --------------------------------------------------------

describe("UserRole enum", () => {
  it("is exported from the package index", async () => {
    // Dynamic import so Vitest can catch the missing export at runtime.
    const mod = await import("./index");
    expect(mod).toHaveProperty("UserRole");
  });

  it("contains exactly the expected values", async () => {
    const { UserRole } = await import("./index");
    // The enum object should expose each member as a key mapped to itself.
    expect(UserRole).toMatchObject({
      listener: "listener",
      scholar: "scholar",
      translator: "translator",
      editor: "editor",
      admin: "admin",
      superadmin: "superadmin",
    });
  });
});

// -- 2. User.banned default --------------------------------------------------

describe("User.banned field", () => {
  it("is defined as a non-nullable Boolean with a default of false in the schema", async () => {
    const fs = await import("node:fs");
    const path = await import("node:path");

    const schemaPath = path.resolve(__dirname, "../prisma/schema.prisma");
    const schemaContent = fs.readFileSync(schemaPath, "utf-8");

    // Match the model User block
    const userModelMatch = schemaContent.match(/model User\s*{[^}]+}/);
    expect(userModelMatch).toBeTruthy();

    const userModel = userModelMatch![0];

    // Check that banned is Boolean and has default(false), and is not optional (doesn't have ?)
    // A typical line is: banned Boolean @default(false)
    expect(userModel).toMatch(/banned\s+Boolean\s+@default\(false\)/);
    expect(userModel).not.toMatch(/banned\s+Boolean\?/);
  });
});

// -- 3. Listing model schema --------------------------------------------------------

describe("Listing model schema", () => {
  it("enforces globally unique slugs", async () => {
    const fs = await import("node:fs");
    const path = await import("node:path");

    const schemaPath = path.resolve(__dirname, "../prisma/schema.prisma");
    const schemaContent = fs.readFileSync(schemaPath, "utf-8");

    const listingModelMatch = schemaContent.match(/model Listing\s*{[^}]+}/);
    expect(listingModelMatch).toBeTruthy();

    const listingModel = listingModelMatch![0];
    expect(listingModel).toMatch(/slug\s+String\s+@unique/);
  });

  it("enforces GIN trigram index on title", async () => {
    const fs = await import("node:fs");
    const path = await import("node:path");

    const schemaPath = path.resolve(__dirname, "../prisma/schema.prisma");
    const schemaContent = fs.readFileSync(schemaPath, "utf-8");

    const listingModelMatch = schemaContent.match(/model Listing\s*{[^}]+}/);
    expect(listingModelMatch).toBeTruthy();

    const listingModel = listingModelMatch![0];
    expect(listingModel).toMatch(
      /@@index\(\[title\(ops:\s*raw\("gin_trgm_ops"\)\)\],\s*type:\s*Gin\)/,
    );
  });

  it("enforces restrict on parent relationship deletion", async () => {
    const fs = await import("node:fs");
    const path = await import("node:path");

    const schemaPath = path.resolve(__dirname, "../prisma/schema.prisma");
    const schemaContent = fs.readFileSync(schemaPath, "utf-8");

    const listingModelMatch = schemaContent.match(/model Listing\s*{[^}]+}/);
    expect(listingModelMatch).toBeTruthy();

    const listingModel = listingModelMatch![0];
    expect(listingModel).toMatch(/onDelete:\s*Restrict/);
  });

  it("enforces composite unique constraint for hierarchy matching", async () => {
    const fs = await import("node:fs");
    const path = await import("node:path");

    const schemaPath = path.resolve(__dirname, "../prisma/schema.prisma");
    const schemaContent = fs.readFileSync(schemaPath, "utf-8");

    const listingModelMatch = schemaContent.match(/model Listing\s*{[^}]+}/);
    expect(listingModelMatch).toBeTruthy();

    const listingModel = listingModelMatch![0];
    expect(listingModel).toMatch(/@@unique\(\[id,\s*scholarId\]\)/);
  });
});

describe("User cascade deletions", () => {
  it("enforces cascade deletes on UserListingProgress and FavoriteListing user relations", async () => {
    const fs = await import("node:fs");
    const path = await import("node:path");

    const schemaPath = path.resolve(__dirname, "../prisma/schema.prisma");
    const schemaContent = fs.readFileSync(schemaPath, "utf-8");

    const progressMatch = schemaContent.match(/model UserListingProgress\s*{[^}]+}/);
    expect(progressMatch).toBeTruthy();
    expect(progressMatch![0]).toMatch(
      /user\s+User\s+@relation\(fields:\s*\[userId\],\s*references:\s*\[id\],\s*onDelete:\s*Cascade\)/,
    );

    const favMatch = schemaContent.match(/model FavoriteListing\s*{[^}]+}/);
    expect(favMatch).toBeTruthy();
    expect(favMatch![0]).toMatch(
      /user\s+User\s+@relation\(fields:\s*\[userId\],\s*references:\s*\[id\],\s*onDelete:\s*Cascade\)/,
    );
  });
});
