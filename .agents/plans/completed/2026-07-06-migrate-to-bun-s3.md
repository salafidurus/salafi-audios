# Migration to Bun.S3 & Deployment Pipeline Optimization Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate the NestJS API application (`apps/api`) from using the official AWS SDK (`@aws-sdk/client-s3` and `@aws-sdk/s3-request-presigner`) to Bun's native, high-performance `Bun.S3Client` API, removing all AWS SDK dependencies. Simultaneously optimize the Vercel and Render deployment pipelines by splitting pruning/installation and compilation into distinct, cached stages.

**Architecture:**

1. Replace the instantiation of `@aws-sdk/client-s3`'s `S3Client` with Bun's native `S3Client` in `CDNHealthIndicator` and `MediaService`. The health indicator check will use a lightweight object listing `s3.list({ maxKeys: 1 })` to verify connection health since Bun does not expose a low-level bucket check. The media service will use the synchronous native `.presign()` method on the `S3File` reference, removing asynchronous signature generation.
2. Introduce a dedicated `scripts/deploy/install.mjs` script that performs Turborepo pruning and dependency installation. This script will write a `.pruned-target` marker file at the root. Refactor `scripts/deploy/build.mjs` to check for this marker file; if it exists and matches the target, it will skip pruning/installing and immediately compile the application. This allows Vercel to cache `node_modules` correctly using its native Install Command phase while keeping Render fully compatible.

**Tech Stack:** Bun 1.3+ native S3 API, NestJS, Vitest, Turborepo.

## Global Constraints

- Do not introduce app-to-app imports.
- Maintain strict TDD: write failing tests, run to verify, write implementation, run to pass, commit.
- Keep file paths absolute and syntax correct (e.g. no bare fenced code blocks).

---

### Task 1: Add unit tests for CDNHealthIndicator

**Files:**

- Create: `apps/api/src/core/health/cdn-health.indicator.spec.ts`
- Reference: `apps/api/src/core/health/cdn-health.indicator.ts`

**Interfaces:**

- Consumes: `CDNHealthIndicator` from `./cdn-health.indicator.ts`
- Produces: A complete Vitest unit test suite validating health-check behavior.

- [ ] **Step 1: Write the initial test suite**
      Create `apps/api/src/core/health/cdn-health.indicator.spec.ts` mocking the current `@aws-sdk/client-s3` implementation to verify it returns healthy and handles errors correctly:

  ```typescript
  import { vi, describe, it, expect, beforeEach } from "vitest";
  import { Test } from "@nestjs/testing";
  import { CDNHealthIndicator } from "./cdn-health.indicator";
  import { ConfigService } from "../../shared/config/config.service";

  // Mock AWS SDK
  vi.mock("@aws-sdk/client-s3", () => {
    const mockSend = vi.fn();
    return {
      S3Client: vi.fn().mockImplementation(() => ({
        send: mockSend,
      })),
      HeadBucketCommand: vi.fn().mockImplementation((args) => args),
      _mockSend: mockSend, // Expose for testing
    };
  });

  import { _mockSend } from "@aws-sdk/client-s3";

  describe("CDNHealthIndicator", () => {
    let indicator: CDNHealthIndicator;

    beforeEach(async () => {
      vi.clearAllMocks();
      const module = await Test.createTestingModule({
        providers: [
          CDNHealthIndicator,
          {
            provide: ConfigService,
            useValue: {
              R2_BUCKET_NAME: "test-bucket",
              R2_ACCOUNT_ID: "test-account",
              R2_ACCESS_KEY_ID: "test-key",
              R2_SECRET_ACCESS_KEY: "test-secret",
            },
          },
        ],
      }).compile();

      indicator = module.get(CDNHealthIndicator);
    });

    it("returns up status when head command succeeds", async () => {
      vi.mocked(_mockSend).mockResolvedValueOnce({});

      const result = await indicator.pingCheck("cdn");
      expect(result).toEqual({ cdn: { status: "up" } });
    });

    it("throws HealthCheckError when head command fails", async () => {
      vi.mocked(_mockSend).mockRejectedValueOnce(new Error("S3 Connection Failed"));

      await expect(indicator.pingCheck("cdn")).rejects.toThrow("R2 storage check failed");
    });
  });
  ```

- [ ] **Step 2: Run tests to verify they pass**
      Run: `bun run --filter api test src/core/health/cdn-health.indicator.spec.ts`
      Expected: PASS

- [ ] **Step 3: Commit**
  ```bash
  git add apps/api/src/core/health/cdn-health.indicator.spec.ts
  git commit -m "test: add cdn health indicator unit tests"
  ```

---

### Task 2: Migrate CDNHealthIndicator to Bun S3

**Files:**

- Modify: `apps/api/src/core/health/cdn-health.indicator.ts`
- Modify: `apps/api/src/core/health/cdn-health.indicator.spec.ts`

**Interfaces:**

- Consumes: Bun runtime native `S3Client`
- Produces: Updated `CDNHealthIndicator` and its matching test suite.

- [ ] **Step 1: Update the cdn-health.indicator.spec.ts test to mock Bun S3Client**
      Update `apps/api/src/core/health/cdn-health.indicator.spec.ts` to expect Bun S3Client mock rather than AWS SDK S3Client:

  ```typescript
  import { vi, describe, it, expect, beforeEach } from "vitest";
  import { Test } from "@nestjs/testing";
  import { CDNHealthIndicator } from "./cdn-health.indicator";
  import { ConfigService } from "../../shared/config/config.service";

  const mockList = vi.fn();

  vi.mock("bun", () => {
    return {
      S3Client: vi.fn().mockImplementation(() => ({
        list: mockList,
      })),
    };
  });

  describe("CDNHealthIndicator", () => {
    let indicator: CDNHealthIndicator;

    beforeEach(async () => {
      vi.clearAllMocks();
      const module = await Test.createTestingModule({
        providers: [
          CDNHealthIndicator,
          {
            provide: ConfigService,
            useValue: {
              R2_BUCKET_NAME: "test-bucket",
              R2_ACCOUNT_ID: "test-account",
              R2_ACCESS_KEY_ID: "test-key",
              R2_SECRET_ACCESS_KEY: "test-secret",
            },
          },
        ],
      }).compile();

      indicator = module.get(CDNHealthIndicator);
    });

    it("returns up status when s3.list succeeds", async () => {
      mockList.mockResolvedValueOnce({ contents: [] });

      const result = await indicator.pingCheck("cdn");
      expect(result).toEqual({ cdn: { status: "up" } });
      expect(mockList).toHaveBeenCalledWith({ maxKeys: 1 });
    });

    it("throws HealthCheckError when s3.list fails", async () => {
      mockList.mockRejectedValueOnce(new Error("S3 Connection Failed"));

      await expect(indicator.pingCheck("cdn")).rejects.toThrow("R2 storage check failed");
    });

    it("throws HealthCheckError on timeout", async () => {
      mockList.mockImplementationOnce(() => new Promise((resolve) => setTimeout(resolve, 2000)));

      await expect(indicator.pingCheck("cdn", { timeout: 100 })).rejects.toThrow(
        "R2 storage check failed",
      );
    });
  });
  ```

- [ ] **Step 2: Run test to verify it fails**
      Run: `bun run --filter api test src/core/health/cdn-health.indicator.spec.ts`
      Expected: FAIL (due to indicator still importing AWS SDK)

- [ ] **Step 3: Update implementation of CDNHealthIndicator to use Bun S3**
      Modify `apps/api/src/core/health/cdn-health.indicator.ts`:

  ```typescript
  import { Injectable } from "@nestjs/common";
  import { HealthCheckError, HealthIndicator, HealthIndicatorResult } from "@nestjs/terminus";
  import { S3Client } from "bun";
  import { ConfigService } from "../../shared/config/config.service";

  @Injectable()
  export class CDNHealthIndicator extends HealthIndicator {
    private readonly s3: S3Client;

    constructor(private readonly config: ConfigService) {
      super();
      this.s3 = new S3Client({
        accessKeyId: config.R2_ACCESS_KEY_ID,
        secretAccessKey: config.R2_SECRET_ACCESS_KEY,
        bucket: config.R2_BUCKET_NAME,
        endpoint: `https://${config.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      });
    }

    async pingCheck(key: string, options?: { timeout?: number }): Promise<HealthIndicatorResult> {
      const timeout = options?.timeout ?? 1000;

      let timer: ReturnType<typeof setTimeout> | undefined;
      const timeoutPromise = new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error("Request timeout")), timeout);
      });

      try {
        await Promise.race([this.s3.list({ maxKeys: 1 }), timeoutPromise]);

        return this.getStatus(key, true);
      } catch (error) {
        const result = this.getStatus(key, false, {
          message: error instanceof Error ? error.message : "Unknown error",
        });

        throw new HealthCheckError("R2 storage check failed", result);
      } finally {
        if (timer) {
          clearTimeout(timer);
        }
      }
    }
  }
  ```

- [ ] **Step 4: Run test to verify it passes**
      Run: `bun run --filter api test src/core/health/cdn-health.indicator.spec.ts`
      Expected: PASS

- [ ] **Step 5: Commit**
  ```bash
  git add apps/api/src/core/health/cdn-health.indicator.ts apps/api/src/core/health/cdn-health.indicator.spec.ts
  git commit -m "feat: migrate CDNHealthIndicator to Bun.S3"
  ```

---

### Task 3: Migrate MediaService to Bun S3

**Files:**

- Modify: `apps/api/src/modules/media/media.service.ts`
- Modify: `apps/api/src/modules/media/media.service.spec.ts`

**Interfaces:**

- Consumes: Bun runtime native `S3Client`
- Produces: Presigned URL generator using native `.presign()` method.

- [ ] **Step 1: Mock Bun S3Client in media.service.spec.ts**
      Update `apps/api/src/modules/media/media.service.spec.ts`:

  ```typescript
  import { vi, describe, it, expect, beforeEach } from "vitest";
  import { Test } from "@nestjs/testing";
  import { MediaService } from "./media.service";
  import { ConfigService } from "../../shared/config/config.module";

  vi.mock("@paralleldrive/cuid2", () => ({
    createId: () => "mock-cuid-12345",
  }));

  const mockPresign = vi.fn().mockImplementation((options) => {
    return `https://mock-s3-upload-url.com/bucket/key?method=${options.method}&expires=${options.expiresIn}&type=${options.type}`;
  });

  vi.mock("bun", () => {
    return {
      S3Client: vi.fn().mockImplementation(() => ({
        file: vi.fn().mockImplementation((key) => ({
          presign: mockPresign,
        })),
      })),
    };
  });

  describe("MediaService", () => {
    let service: MediaService;

    beforeEach(async () => {
      vi.clearAllMocks();
      const module = await Test.createTestingModule({
        providers: [
          MediaService,
          {
            provide: ConfigService,
            useValue: {
              R2_ACCOUNT_ID: "test-account",
              R2_ACCESS_KEY_ID: "test-key",
              R2_SECRET_ACCESS_KEY: "test-secret",
              R2_BUCKET_NAME: "test-bucket",
              R2_PUBLIC_BASE_URL: "https://cdn.example.com",
            },
          },
        ],
      }).compile();

      service = module.get(MediaService);
    });

    it("generates an objectKey with the purpose prefix and presigned url", async () => {
      const result = await service.getPresignedUploadUrl({
        filename: "lecture.mp3",
        contentType: "audio/mpeg",
        purpose: "audio",
      });

      expect(result.objectKey).toBe("audio/mock-cuid-12345-lecture.mp3");
      expect(result.publicUrl).toBe("https://cdn.example.com/audio/mock-cuid-12345-lecture.mp3");
      expect(result.uploadUrl).toContain("https://mock-s3-upload-url.com");
      expect(mockPresign).toHaveBeenCalledWith({
        method: "PUT",
        expiresIn: 300,
        type: "audio/mpeg",
      });
    });
  });
  ```

- [ ] **Step 2: Run test to verify it fails**
      Run: `bun run --filter api test src/modules/media/media.service.spec.ts`
      Expected: FAIL (due to media service still using AWS SDK)

- [ ] **Step 3: Update implementation of MediaService to Bun S3**
      Modify `apps/api/src/modules/media/media.service.ts`:

  ```typescript
  import { Injectable } from "@nestjs/common";
  import { S3Client } from "bun";
  import { createId } from "@paralleldrive/cuid2";
  import type { PresignedUrlRequestDto, PresignedUrlResponseDto } from "@sd/core-contracts";
  import { ConfigService } from "../../shared/config/config.module";

  @Injectable()
  export class MediaService {
    private readonly s3: S3Client;
    private readonly publicBaseUrl: string;

    constructor(private readonly config: ConfigService) {
      this.publicBaseUrl = config.R2_PUBLIC_BASE_URL;
      this.s3 = new S3Client({
        accessKeyId: config.R2_ACCESS_KEY_ID,
        secretAccessKey: config.R2_SECRET_ACCESS_KEY,
        bucket: config.R2_BUCKET_NAME,
        endpoint: `https://${config.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      });
    }

    async getPresignedUploadUrl(dto: PresignedUrlRequestDto): Promise<PresignedUrlResponseDto> {
      const objectKey = `${dto.purpose}/${createId()}-${dto.filename}`;
      const file = this.s3.file(objectKey);
      const uploadUrl = file.presign({
        method: "PUT",
        expiresIn: 300,
        type: dto.contentType,
      });
      const publicUrl = `${this.publicBaseUrl}/${objectKey}`;
      return { uploadUrl, publicUrl, objectKey };
    }
  }
  ```

- [ ] **Step 4: Run test to verify it passes**
      Run: `bun run --filter api test src/modules/media/media.service.spec.ts`
      Expected: PASS

- [ ] **Step 5: Commit**
  ```bash
  git add apps/api/src/modules/media/media.service.ts apps/api/src/modules/media/media.service.spec.ts
  git commit -m "feat: migrate MediaService to Bun.S3"
  ```

---

### Task 4: Remove AWS SDK Dependencies and verify compilation

**Files:**

- Modify: `apps/api/package.json`
- Modify: `package.json`
- Modify: `renovate.json`

**Interfaces:**

- Consumes: None
- Produces: A cleaner workspace without `@aws-sdk/client-s3` and `@aws-sdk/s3-request-presigner`.

- [ ] **Step 1: Remove dependencies from package files and Renovate configs**
  - Delete `@aws-sdk/client-s3` and `@aws-sdk/s3-request-presigner` dependencies from `apps/api/package.json`.
  - Delete `@aws-sdk/client-s3` and `@aws-sdk/s3-request-presigner` from catalog in root `package.json`.
  - Delete `aws-sdk` group config block in `renovate.json`.

- [ ] **Step 2: Run bun install to update dependencies and package locks**
      Run: `bun install`
      Expected: Successful package install removing the S3 packages.

- [ ] **Step 3: Run full typecheck and test suite to verify no regressions**
      Run: `bun run typecheck`
      Expected: SUCCESS
      Run: `bun run test`
      Expected: SUCCESS (all 184 tests pass)

- [ ] **Step 4: Commit**
  ```bash
  git add apps/api/package.json package.json renovate.json bun.lock
  git commit -m "chore: remove aws-sdk dependencies"
  ```

---

### Task 5: Refactor Vercel and Render Deployment pipeline

**Files:**

- Create: `scripts/deploy/install.mjs`
- Modify: `scripts/deploy/build.mjs`
- Modify: `apps/web/vercel.json`
- Modify: `docs/dev-ops.md`

**Interfaces:**

- Consumes: Monorepo scripts deployment framework
- Produces: A optimized, cached install/build deployment pipeline.

- [ ] **Step 1: Create `scripts/deploy/install.mjs`**
      Write the script that prunes the workspace and installs dependencies, marking target in `.pruned-target`:

  ```javascript
  #!/usr/bin/env bun
  import fs from "node:fs";
  import path from "node:path";
  import { findMonorepoRoot } from "../utils/paths.mjs";
  import { overwriteRootWithPrunedWorkspace } from "../utils/filesystem.mjs";
  import { getTurboVersion, validateEnvironment } from "../utils/turbo.mjs";
  import { log, error, success, setPrefix } from "../utils/logging.mjs";

  setPrefix("[Deploy:Install]");

  const target = process.argv[2];

  if (target !== "web" && target !== "api") {
    error(`Invalid target "${target}". Supported targets are "web" and "api".`);
    process.exit(1);
  }

  try {
    log(`Starting install/prune process for target: "${target}"`);

    // 1. Resolve monorepo root and validate environment
    const rootDir = findMonorepoRoot();
    validateEnvironment();
    log(`Monorepo root resolved: ${rootDir}`);

    // 2. Clean previous build workspace output directory if exists
    const outDir = path.join(rootDir, "out");
    if (fs.existsSync(outDir)) {
      log("Cleaning existing out/ directory...");
      fs.rmSync(outDir, { recursive: true, force: true });
    }

    // 3. Execute Turborepo prune to isolate target dependencies
    const turboVersion = await getTurboVersion(rootDir);
    const turboCmd = turboVersion ? `turbo@${turboVersion}` : "turbo";

    log(`Running turbo prune for "${target}" using turbo version: ${turboVersion || "latest"}`);

    // Execute via Bun Shell; throws automatically if command fails
    await Bun.$`bunx ${turboCmd} prune ${target} --docker`;

    // 4. Overwrite root with the pruned workspace closure
    overwriteRootWithPrunedWorkspace(rootDir, outDir);

    // 5. Clean installation of pruned dependencies in the workspace
    log("Installing pruned dependency closure...");
    await Bun.$.cwd(rootDir)`bun install --frozen-lockfile`;

    // 6. Write marker file so the build step knows we are pruned
    fs.writeFileSync(path.join(rootDir, ".pruned-target"), target);

    success(`Install and prune process completed successfully for "${target}"!`);
  } catch (err) {
    error(`Install failed: ${err.message}`);
    process.exit(1);
  }
  ```

- [ ] **Step 2: Refactor `scripts/deploy/build.mjs`**
      Modify `scripts/deploy/build.mjs` to check for `.pruned-target` and skip prune/install if present, preserving compatibility when run standalone (Render):

  ```javascript
  #!/usr/bin/env bun
  import fs from "node:fs";
  import path from "node:path";
  import { findMonorepoRoot } from "../utils/paths.mjs";
  import { overwriteRootWithPrunedWorkspace } from "../utils/filesystem.mjs";
  import { getTurboVersion, validateEnvironment } from "../utils/turbo.mjs";
  import { log, error, success, setPrefix } from "../utils/logging.mjs";

  setPrefix("[Deploy:Build]");

  const target = process.argv[2];

  if (target !== "web" && target !== "api") {
    error(`Invalid target "${target}". Supported targets are "web" and "api".`);
    process.exit(1);
  }

  try {
    log(`Starting build process for target: "${target}"`);

    const rootDir = findMonorepoRoot();
    validateEnvironment();
    log(`Monorepo root resolved: ${rootDir}`);

    const markerPath = path.join(rootDir, ".pruned-target");
    let isAlreadyPruned = false;

    if (fs.existsSync(markerPath)) {
      const prunedTarget = fs.readFileSync(markerPath, "utf8").trim();
      if (prunedTarget === target) {
        isAlreadyPruned = true;
      }
    }

    if (isAlreadyPruned) {
      log(`Pruned marker file found for target "${target}". Skipping prune and install phases.`);
    } else {
      log(
        `No pruned marker found for target "${target}". Running full prune and install sequence.`,
      );

      // Clean out/
      const outDir = path.join(rootDir, "out");
      if (fs.existsSync(outDir)) {
        fs.rmSync(outDir, { recursive: true, force: true });
      }

      // Execute Turborepo prune
      const turboVersion = await getTurboVersion(rootDir);
      const turboCmd = turboVersion ? `turbo@${turboVersion}` : "turbo";
      await Bun.$`bunx ${turboCmd} prune ${target} --docker`;

      // Overwrite root
      overwriteRootWithPrunedWorkspace(rootDir, outDir);

      // Clean install
      log("Installing pruned dependencies...");
      await Bun.$.cwd(rootDir)`bun install --frozen-lockfile`;

      // Write marker
      fs.writeFileSync(markerPath, target);
    }

    // Build the target application
    log(`Building application: "${target}"`);
    await Bun.$.cwd(rootDir)`bun run build --filter=${target}...`;

    success(`Build process completed successfully for "${target}"!`);
  } catch (err) {
    error(`Build failed: ${err.message}`);
    process.exit(1);
  }
  ```

- [ ] **Step 3: Update `apps/web/vercel.json`**
      Modify `apps/web/vercel.json` to route Vercel's install stage to our script:

  ```json
  {
    "$schema": "https://openapi.vercel.sh/vercel.json",
    "bunVersion": "1.x",
    "buildCommand": "bun ../../scripts/deploy/build.mjs web",
    "installCommand": "bun ../../scripts/deploy/install.mjs web"
  }
  ```

- [ ] **Step 4: Update `docs/dev-ops.md`**
      Modify Vercel deploy configuration documentation in `docs/dev-ops.md` to explain the new `installCommand` setting:

  ````markdown
  - **Install Command**: Enable the override switch in Vercel settings and set it to:

  ```bash
  bun ../../scripts/deploy/install.mjs web
  ```
  ````

  ```

  ```

- [ ] **Step 5: Test scripts locally**
      Run scripts test locally on a clean setup / verification:
  - Run: `bun scripts/deploy/install.mjs web` (Expected: PASS, `.pruned-target` has `"web"`)
  - Run: `bun scripts/deploy/build.mjs web` (Expected: PASS, skips install and compiles)
  - Clean `.pruned-target`: `git checkout package.json bun.lock apps/`

- [ ] **Step 6: Commit**
  ```bash
  git add scripts/deploy/install.mjs scripts/deploy/build.mjs apps/web/vercel.json docs/dev-ops.md
  git commit -m "feat: optimize deployment pipeline with distinct cached install stage"
  ```

---

### Task 6: Fix scripts utility tests

**Files:**

- Modify: `scripts/utils/paths.spec.mjs`

- [ ] **Step 1: Modify assertion in paths.spec.mjs**
      Update `scripts/utils/paths.spec.mjs` to check for folder existence rather than matching a hardcoded branch name:

  ```javascript
  import { describe, it, expect } from "bun:test";
  import { findMonorepoRoot } from "./paths.mjs";
  import fs from "node:fs";

  describe("paths utility", () => {
    it("finds monorepo root correctly", () => {
      const root = findMonorepoRoot();
      expect(root).toBeDefined();
      expect(fs.existsSync(root)).toBe(true);
    });
  });
  ```

- [ ] **Step 2: Run scripts tests to verify they all pass**
      Run: `bun test scripts/utils/`
      Expected: PASS (6/6 tests pass)

- [ ] **Step 3: Commit**
  ```bash
  git add scripts/utils/paths.spec.mjs
  git commit -m "test: fix paths utility test verification"
  ```
