# Sitemap Implementation Plan

- **Status:** Completed (2026-07-06)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make SalafiDurus.com indexable by search engines — backend sitemap for dynamic content (scholars, listings), Next.js sitemap for static pages, robots.txt referencing both.

**Architecture:** Two independent sitemaps — NestJS API at `/sitemap.xml` (DB-driven content), Next.js at `/sitemap.xml` (static pages). Both gated by `NODE_ENV === 'production'`.

**Tech Stack:** NestJS (apps/api), Next.js (apps/web), Prisma (packages/core-db), Zod env schema

## URL & Indexing Scope

| Content                                                                        | URL pattern        | In sitemap?        |
| ------------------------------------------------------------------------------ | ------------------ | ------------------ |
| Scholars                                                                       | `/scholars/{slug}` | Yes                |
| Top-level listings (all formats: single, collection, series)                   | `/listing/{slug}`  | Yes                |
| Nested listings (child rows with `parentId` set)                               | —                  | No (planned later) |
| Static public pages (home, search, feed, live, scholars index, legal, support) | See Task 4         | Yes                |

**URL decisions:**

- Use `/listing/{slug}` — not legacy `/lectures/`, `/collections/`, or `/series/` paths from `@sd/core-contracts` (those route helpers are planned for deletion; separate cleanup task below).
- Listing query uses `parentId: null` intentionally — only top-level listings for now.
- Do **not** filter by `format` — collection/series listing pages are landing soon; include all published top-level listings regardless of format.

## Explicitly Out of Scope (this plan)

- Nested / child listing URLs in the sitemap
- `format: 'single'` (or any format) filter on listing queries
- Legacy `/lectures/`, `/collections/`, `/series/` web routes or sitemap entries
- Sitemap index / pagination (add when catalog approaches 50k URLs — see Global Constraints)
- Removing deprecated entries from `packages/core-contracts/src/routes.ts` (follow-up task at end)

## Global Constraints

- Backend sitemap must be `@Public()` and `@SkipThrottle()` (follow `apps/api/src/core/health/health.controller.ts` pattern — health lives under `core/`, not `modules/`)
- Sitemap only served in production (`NODE_ENV === 'production'`)
- Dynamic content sitemap lives on the API domain, static sitemap on the web domain
- Scholar URLs: `{SITEMAP_BASE_URL}/scholars/{slug}`
- Listing URLs: `{SITEMAP_BASE_URL}/listing/{slug}`
- XML sitemap protocol: `https://www.sitemaps.org/schemas/sitemap/0.9`
- `SITEMAP_BASE_URL` is a dedicated env var (not `CORS_ORIGIN`); must be set in production — controller returns **503** if missing (never emit relative `<loc>` URLs)
- XML-escape all values written into `<loc>` (`&`, `<`, `>`, `"`, `'`)
- All new code must be tested (TDD) — including web `sitemap.ts` / `robots.ts` unit tests
- Prefer repo layer for Prisma queries (`sitemap.repo.ts`); service owns URL building + XML assembly
- `robots.txt` on API subdomains (`api.*`, `preview-api.*`) always returns `Disallow: /`
- `robots.txt` on web production allows crawling of public paths and disallows auth/admin surfaces (see Task 5)
- `robots.txt` on web preview/staging disallows all
- CDN subdomains (`cdn.*`, `preview-cdn.*`) block crawling via Cloudflare Transform Rule (infrastructure task, not code)
- API sitemap responses should set `Cache-Control: public, max-age=3600, s-maxage=3600`
- When catalog grows past ~50k URLs, split API sitemap with a sitemap index (future work)

---

### Task 1: Add `SITEMAP_BASE_URL` env var to API config

**Files:**

- Modify: `apps/api/src/shared/config/env.ts`
- Modify: `apps/api/src/shared/config/config.service.ts`
- Modify: `apps/api/.env.example`

**Interfaces:**

- Consumes: existing `ApiEnvSchema` pattern
- Produces: `ConfigService.SITEMAP_BASE_URL` getter (returns `string | undefined`)

- [ ] **Step 1: Add `SITEMAP_BASE_URL` to env schema**

Add the field in `apps/api/src/shared/config/env.ts` after `ASSET_CDN_BASE_URL`:

```typescript
SITEMAP_BASE_URL: z.string().url().optional(),
```

- [ ] **Step 2: Add getter to ConfigService**

Add in `apps/api/src/shared/config/config.service.ts` after the `ASSET_CDN_BASE_URL` getter:

```typescript
get SITEMAP_BASE_URL(): string | undefined {
  return this.env.SITEMAP_BASE_URL;
}
```

- [ ] **Step 3: Document in `.env.example`**

Add after `ASSET_CDN_BASE_URL` in `apps/api/.env.example`:

```bash
# Canonical web origin for sitemap <loc> URLs (production only).
# Example: https://www.salafidurus.com
SITEMAP_BASE_URL=
```

- [ ] **Step 4: Verify typecheck**

Run: `bun run --filter api typecheck`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add apps/api/src/shared/config/env.ts apps/api/src/shared/config/config.service.ts apps/api/.env.example
git commit -m "feat(api): add SITEMAP_BASE_URL env var for sitemap URL construction"
```

---

### Task 2: Backend sitemap repo + service

**Files:**

- Create: `apps/api/src/modules/sitemap/sitemap.repo.ts`
- Create: `apps/api/src/modules/sitemap/sitemap.service.ts`
- Create: `apps/api/src/modules/sitemap/sitemap.service.spec.ts`

**Interfaces:**

- Consumes: `SitemapRepo`, `ConfigService.SITEMAP_BASE_URL`
- Produces: `SitemapService.generate(baseUrl: string): Promise<string>` — full XML sitemap document (base URL validated by controller before call)

- [ ] **Step 1: Write the failing service test**

**File:** `apps/api/src/modules/sitemap/sitemap.service.spec.ts`

```typescript
import { vi } from "vitest";
import { Test, TestingModule } from "@nestjs/testing";
import { SitemapService } from "./sitemap.service";
import { SitemapRepo } from "./sitemap.repo";

describe("SitemapService", () => {
  let service: SitemapService;
  let repo: {
    findActiveScholars: ReturnType<typeof vi.fn>;
    findPublishedTopLevelListings: ReturnType<typeof vi.fn>;
  };

  const baseUrl = "https://www.salafidurus.com";

  const mockScholars = [
    { slug: "al-albani", updatedAt: new Date("2024-01-15") },
    { slug: "ibn-baz", updatedAt: new Date("2024-02-20") },
  ];

  const mockListings = [
    { slug: "tawheed-explained", updatedAt: new Date("2024-03-10") },
    { slug: "sunnah-collection", updatedAt: new Date("2024-01-05") },
  ];

  beforeEach(async () => {
    repo = {
      findActiveScholars: vi.fn().mockResolvedValue(mockScholars),
      findPublishedTopLevelListings: vi.fn().mockResolvedValue(mockListings),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [SitemapService, { provide: SitemapRepo, useValue: repo }],
    }).compile();

    service = module.get<SitemapService>(SitemapService);
  });

  it("generates XML with correct scholar URLs", async () => {
    const xml = await service.generate(baseUrl);
    expect(xml).toContain("<loc>https://www.salafidurus.com/scholars/al-albani</loc>");
    expect(xml).toContain("<loc>https://www.salafidurus.com/scholars/ibn-baz</loc>");
  });

  it("generates XML with correct listing URLs", async () => {
    const xml = await service.generate(baseUrl);
    expect(xml).toContain("<loc>https://www.salafidurus.com/listing/tawheed-explained</loc>");
    expect(xml).toContain("<loc>https://www.salafidurus.com/listing/sunnah-collection</loc>");
  });

  it("includes lastmod dates as YYYY-MM-DD", async () => {
    const xml = await service.generate(baseUrl);
    expect(xml).toContain("<lastmod>2024-01-15</lastmod>");
    expect(xml).toContain("<lastmod>2024-02-20</lastmod>");
    expect(xml).toContain("<lastmod>2024-03-10</lastmod>");
  });

  it("uses correct priority and changefreq for scholars vs listings", async () => {
    const xml = await service.generate(baseUrl);
    const scholarEntry = xml.match(/<url>[\s\S]*?scholars\/al-albani[\s\S]*?<\/url>/);
    expect(scholarEntry?.[0]).toContain("<changefreq>monthly</changefreq>");
    expect(scholarEntry?.[0]).toContain("<priority>0.8</priority>");
    const listingEntry = xml.match(/<url>[\s\S]*?listing\/tawheed-explained[\s\S]*?<\/url>/);
    expect(listingEntry?.[0]).toContain("<changefreq>weekly</changefreq>");
    expect(listingEntry?.[0]).toContain("<priority>0.6</priority>");
  });

  it("produces valid XML with xml declaration and urlset wrapper", async () => {
    const xml = await service.generate(baseUrl);
    expect(xml).toMatch(/^<\?xml version="1.0" encoding="UTF-8"\?>/);
    expect(xml).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
    expect(xml).toContain("</urlset>");
  });

  it("delegates to repo for active scholars and published top-level listings", async () => {
    await service.generate(baseUrl);
    expect(repo.findActiveScholars).toHaveBeenCalledOnce();
    expect(repo.findPublishedTopLevelListings).toHaveBeenCalledOnce();
  });

  it("returns valid empty urlset when there are no scholars or listings", async () => {
    repo.findActiveScholars.mockResolvedValue([]);
    repo.findPublishedTopLevelListings.mockResolvedValue([]);
    const xml = await service.generate(baseUrl);
    expect(xml).toContain("<urlset");
    expect(xml).toContain("</urlset>");
    expect(xml.match(/<url>/g)).toBeNull();
  });

  it("XML-escapes special characters in slugs", async () => {
    repo.findActiveScholars.mockResolvedValue([
      { slug: "foo&bar", updatedAt: new Date("2024-01-01") },
    ]);
    repo.findPublishedTopLevelListings.mockResolvedValue([]);
    const xml = await service.generate(baseUrl);
    expect(xml).toContain("<loc>https://www.salafidurus.com/scholars/foo&amp;bar</loc>");
    expect(xml).not.toContain("foo&bar</loc>");
  });
});
```

- [ ] **Step 2: Verify test fails**

Run: `bun run --filter api test -- src/modules/sitemap/sitemap.service.spec.ts`
Expected: ERROR (module not found)

- [ ] **Step 3: Write repo + service implementation**

**File:** `apps/api/src/modules/sitemap/sitemap.repo.ts`

```typescript
import { Injectable } from "@nestjs/common";
import { Status } from "@sd/core-db";
import { PrismaService } from "../../shared/db/prisma.service";

@Injectable()
export class SitemapRepo {
  constructor(private readonly prisma: PrismaService) {}

  findActiveScholars() {
    return this.prisma.scholar.findMany({
      where: { isActive: true },
      select: { slug: true, updatedAt: true },
      orderBy: { slug: "asc" },
    });
  }

  findPublishedTopLevelListings() {
    return this.prisma.listing.findMany({
      where: { deletedAt: null, status: Status.published, parentId: null },
      select: { slug: true, updatedAt: true },
      orderBy: { slug: "asc" },
    });
  }
}
```

**File:** `apps/api/src/modules/sitemap/sitemap.service.ts`

```typescript
import { Injectable } from "@nestjs/common";
import { SitemapRepo } from "./sitemap.repo";

@Injectable()
export class SitemapService {
  constructor(private readonly repo: SitemapRepo) {}

  async generate(baseUrl: string): Promise<string> {
    const [scholars, listings] = await Promise.all([
      this.repo.findActiveScholars(),
      this.repo.findPublishedTopLevelListings(),
    ]);

    const urls: string[] = [];

    for (const scholar of scholars) {
      urls.push(
        this.buildUrlEntry({
          loc: `${baseUrl}/scholars/${scholar.slug}`,
          lastmod: this.formatDate(scholar.updatedAt),
          changefreq: "monthly",
          priority: "0.8",
        }),
      );
    }

    for (const listing of listings) {
      urls.push(
        this.buildUrlEntry({
          loc: `${baseUrl}/listing/${listing.slug}`,
          lastmod: this.formatDate(listing.updatedAt),
          changefreq: "weekly",
          priority: "0.6",
        }),
      );
    }

    return [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
      ...urls,
      "</urlset>",
    ].join("\n");
  }

  private formatDate(date: Date | null | undefined): string {
    if (!date) return new Date().toISOString().split("T")[0];
    return date.toISOString().split("T")[0];
  }

  private escapeXml(value: string): string {
    return value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");
  }

  private buildUrlEntry(fields: {
    loc: string;
    lastmod: string;
    changefreq: string;
    priority: string;
  }): string {
    const loc = this.escapeXml(fields.loc);
    return [
      "  <url>",
      `    <loc>${loc}</loc>`,
      `    <lastmod>${fields.lastmod}</lastmod>`,
      `    <changefreq>${fields.changefreq}</changefreq>`,
      `    <priority>${fields.priority}</priority>`,
      "  </url>",
    ].join("\n");
  }
}
```

- [ ] **Step 4: Verify test passes**

Run: `bun run --filter api test -- src/modules/sitemap/sitemap.service.spec.ts`
Expected: PASS (all 8 tests)

- [ ] **Step 5: Commit**

```bash
git add apps/api/src/modules/sitemap/sitemap.repo.ts apps/api/src/modules/sitemap/sitemap.service.ts apps/api/src/modules/sitemap/sitemap.service.spec.ts
git commit -m "feat(api): add sitemap repo and service with XML generation"
```

---

### Task 3: Backend sitemap controller + module + registration

**Files:**

- Create: `apps/api/src/modules/sitemap/sitemap.controller.ts`
- Create: `apps/api/src/modules/sitemap/sitemap.controller.spec.ts`
- Create: `apps/api/src/modules/sitemap/sitemap.module.ts`
- Modify: `apps/api/src/app.module.ts`

- [ ] **Step 1: Write the failing controller test**

**File:** `apps/api/src/modules/sitemap/sitemap.controller.spec.ts`

```typescript
import { vi } from "vitest";
import { Test, TestingModule } from "@nestjs/testing";
import { SitemapController } from "./sitemap.controller";
import { SitemapService } from "./sitemap.service";
import { ConfigService } from "../../shared/config/config.service";

describe("SitemapController", () => {
  let controller: SitemapController;
  let sitemapService: { generate: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    sitemapService = {
      generate: vi.fn().mockResolvedValue('<?xml version="1.0"?><urlset xmlns="..."></urlset>'),
    };
  });

  describe("in development environment", () => {
    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        controllers: [SitemapController],
        providers: [
          { provide: SitemapService, useValue: sitemapService },
          {
            provide: ConfigService,
            useValue: { NODE_ENV: "development", SITEMAP_BASE_URL: "https://www.salafidurus.com" },
          },
        ],
      }).compile();
      controller = module.get<SitemapController>(SitemapController);
    });

    it("returns 404 and does not call generate", async () => {
      const res = { status: vi.fn().mockReturnThis(), send: vi.fn() } as any;
      await controller.getSitemap(res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.send).toHaveBeenCalledWith("Not found");
      expect(sitemapService.generate).not.toHaveBeenCalled();
    });
  });

  describe("in test environment", () => {
    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        controllers: [SitemapController],
        providers: [
          { provide: SitemapService, useValue: sitemapService },
          {
            provide: ConfigService,
            useValue: { NODE_ENV: "test", SITEMAP_BASE_URL: "https://www.salafidurus.com" },
          },
        ],
      }).compile();
      controller = module.get<SitemapController>(SitemapController);
    });

    it("returns 404", async () => {
      const res = { status: vi.fn().mockReturnThis(), send: vi.fn() } as any;
      await controller.getSitemap(res);
      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe("in production environment", () => {
    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        controllers: [SitemapController],
        providers: [
          { provide: SitemapService, useValue: sitemapService },
          {
            provide: ConfigService,
            useValue: { NODE_ENV: "production", SITEMAP_BASE_URL: "https://www.salafidurus.com" },
          },
        ],
      }).compile();
      controller = module.get<SitemapController>(SitemapController);
    });

    it("calls generate with base URL and returns XML with correct headers", async () => {
      const res = { setHeader: vi.fn().mockReturnThis(), send: vi.fn() } as any;
      await controller.getSitemap(res);
      expect(sitemapService.generate).toHaveBeenCalledWith("https://www.salafidurus.com");
      expect(res.setHeader).toHaveBeenCalledWith("Content-Type", "application/xml");
      expect(res.setHeader).toHaveBeenCalledWith(
        "Cache-Control",
        "public, max-age=3600, s-maxage=3600",
      );
      expect(res.send).toHaveBeenCalledWith('<?xml version="1.0"?><urlset xmlns="..."></urlset>');
    });

    it("returns 503 when SITEMAP_BASE_URL is missing", async () => {
      const module: TestingModule = await Test.createTestingModule({
        controllers: [SitemapController],
        providers: [
          { provide: SitemapService, useValue: sitemapService },
          {
            provide: ConfigService,
            useValue: { NODE_ENV: "production", SITEMAP_BASE_URL: undefined },
          },
        ],
      }).compile();
      const ctrl = module.get<SitemapController>(SitemapController);
      const res = { status: vi.fn().mockReturnThis(), send: vi.fn() } as any;
      await ctrl.getSitemap(res);
      expect(res.status).toHaveBeenCalledWith(503);
      expect(sitemapService.generate).not.toHaveBeenCalled();
    });
  });

  describe("robots.txt", () => {
    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        controllers: [SitemapController],
        providers: [
          { provide: SitemapService, useValue: sitemapService },
          { provide: ConfigService, useValue: { NODE_ENV: "development" } },
        ],
      }).compile();
      controller = module.get<SitemapController>(SitemapController);
    });

    it("always returns Disallow for all, regardless of environment", async () => {
      const res = { setHeader: vi.fn().mockReturnThis(), send: vi.fn() } as any;
      controller.getRobots(res);
      expect(res.setHeader).toHaveBeenCalledWith("Content-Type", "text/plain");
      expect(res.send).toHaveBeenCalledWith("User-agent: *\nDisallow: /\n");
    });
  });
});
```

- [ ] **Step 2: Verify test fails**

Run: `bun run --filter api test -- src/modules/sitemap/sitemap.controller.spec.ts`
Expected: FAIL (module not found)

- [ ] **Step 3: Write minimal implementation**

**File:** `apps/api/src/modules/sitemap/sitemap.controller.ts`

The controller serves two endpoints:

- `GET /sitemap.xml` — dynamic content sitemap (production only; 503 if `SITEMAP_BASE_URL` unset)
- `GET /robots.txt` — always `Disallow: /` on API subdomains

```typescript
import { Controller, Get, Res } from "@nestjs/common";
import { SkipThrottle } from "@nestjs/throttler";
import { Public } from "../../modules/auth/decorators";
import { ConfigService } from "../../shared/config/config.service";
import { SitemapService } from "./sitemap.service";
import type { Response } from "express";

@SkipThrottle()
@Public()
@Controller()
export class SitemapController {
  constructor(
    private readonly configService: ConfigService,
    private readonly sitemapService: SitemapService,
  ) {}

  @Get("sitemap.xml")
  async getSitemap(@Res() res: Response): Promise<void> {
    if (this.configService.NODE_ENV !== "production") {
      res.status(404).send("Not found");
      return;
    }
    const baseUrl = this.configService.SITEMAP_BASE_URL;
    if (!baseUrl) {
      res.status(503).send("Sitemap unavailable");
      return;
    }
    const sitemap = await this.sitemapService.generate(baseUrl);
    res.setHeader("Content-Type", "application/xml");
    res.setHeader("Cache-Control", "public, max-age=3600, s-maxage=3600");
    res.send(sitemap);
  }

  @Get("robots.txt")
  getRobots(@Res() res: Response): void {
    res.setHeader("Content-Type", "text/plain");
    res.send("User-agent: *\nDisallow: /\n");
  }
}
```

**File:** `apps/api/src/modules/sitemap/sitemap.module.ts`

```typescript
import { Module } from "@nestjs/common";
import { SitemapController } from "./sitemap.controller";
import { SitemapRepo } from "./sitemap.repo";
import { SitemapService } from "./sitemap.service";

@Module({
  controllers: [SitemapController],
  providers: [SitemapRepo, SitemapService],
})
export class SitemapModule {}
```

**Modify** `apps/api/src/app.module.ts`:

Add import at top:

```typescript
import { SitemapModule } from "./modules/sitemap/sitemap.module";
```

Add to `imports` array (after `ListingModule`):

```typescript
SitemapModule,
```

- [ ] **Step 4: Verify tests pass**

Run: `bun run --filter api test -- src/modules/sitemap/sitemap.controller.spec.ts`
Expected: PASS (6 test cases)

- [ ] **Step 5: Run full typecheck**

Run: `bun run --filter api typecheck`
Expected: PASS

- [ ] **Step 6: Run all API tests**

Run: `bun run --filter api test`
Expected: PASS (no regressions)

- [ ] **Step 7: Commit**

```bash
git add apps/api/src/modules/sitemap/ apps/api/src/app.module.ts
git commit -m "feat(api): add sitemap controller and module with production guard"
```

---

### Task 4: Frontend Next.js static sitemap

**Files:**

- Create: `apps/web/src/app/sitemap.ts`
- Create: `apps/web/src/app/sitemap.spec.ts`

**Note:** Do **not** include `/feed/following` — it is `auth-required` per `routeDefinitions` in `@sd/core-contracts`.

- [ ] **Step 1: Write the sitemap file**

**File:** `apps/web/src/app/sitemap.ts`

```typescript
import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  if (process.env.NODE_ENV !== "production") {
    return [];
  }

  const baseUrl = process.env.NEXT_PUBLIC_WEB_URL || "http://localhost:3000";

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/feed`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/feed/recent`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/live`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/live/scheduled`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.4,
    },
    {
      url: `${baseUrl}/live/ended`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.4,
    },
    {
      url: `${baseUrl}/scholars`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/terms-of-use`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.3,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.3,
    },
    {
      url: `${baseUrl}/support`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.3,
    },
  ];
}
```

- [ ] **Step 2: Write unit tests**

**File:** `apps/web/src/app/sitemap.spec.ts`

```typescript
import { describe, it, expect, vi, afterEach } from "vitest";
import sitemap from "./sitemap";

describe("sitemap", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns empty array when NODE_ENV is not production", () => {
    vi.stubEnv("NODE_ENV", "development");
    expect(sitemap()).toEqual([]);
  });

  it("returns empty array in test environment", () => {
    vi.stubEnv("NODE_ENV", "test");
    expect(sitemap()).toEqual([]);
  });

  it("includes expected static pages in production", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_WEB_URL", "https://www.salafidurus.com");
    const result = sitemap();
    const urls = result.map((e) => e.url);
    expect(urls).toContain("https://www.salafidurus.com");
    expect(urls).toContain("https://www.salafidurus.com/search");
    expect(urls).toContain("https://www.salafidurus.com/feed");
    expect(urls).toContain("https://www.salafidurus.com/feed/recent");
    expect(urls).toContain("https://www.salafidurus.com/live");
    expect(urls).toContain("https://www.salafidurus.com/scholars");
    expect(urls).toContain("https://www.salafidurus.com/terms-of-use");
    expect(urls).toContain("https://www.salafidurus.com/privacy");
    expect(urls).toContain("https://www.salafidurus.com/support");
  });

  it("does not include auth-required routes like /feed/following", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_WEB_URL", "https://www.salafidurus.com");
    const urls = sitemap().map((e) => e.url);
    expect(urls).not.toContain("https://www.salafidurus.com/feed/following");
  });

  it("falls back to localhost when NEXT_PUBLIC_WEB_URL is not set", () => {
    vi.stubEnv("NODE_ENV", "production");
    const result = sitemap();
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].url).toMatch(/^http:\/\/localhost:\d+/);
  });
});
```

- [ ] **Step 3: Verify typecheck and tests**

Run: `bun run --filter web typecheck`
Run: `bun run --filter web test -- src/app/sitemap.spec.ts`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/app/sitemap.ts apps/web/src/app/sitemap.spec.ts
git commit -m "feat(web): add static pages sitemap with production guard"
```

---

### Task 5: Frontend robots.txt

**Files:**

- Create: `apps/web/src/app/robots.ts`
- Create: `apps/web/src/app/robots.spec.ts`

- [ ] **Step 1: Write the robots.txt file**

**File:** `apps/web/src/app/robots.ts`

```typescript
import type { MetadataRoute } from "next";

const DISALLOW_PATHS = [
  "/admin",
  "/settings",
  "/sign-in",
  "/library",
  "/feed/following",
  "/auth",
] as const;

export default function robots(): MetadataRoute.Robots {
  // Disallow in dev, test, or Vercel preview deployments
  const isProduction =
    process.env.NODE_ENV === "production" &&
    (process.env.VERCEL_ENV === undefined || process.env.VERCEL_ENV === "production");

  if (!isProduction) {
    return {
      rules: { userAgent: "*", disallow: "/" },
    };
  }

  const baseUrl = process.env.NEXT_PUBLIC_WEB_URL || "http://localhost:3000";
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [...DISALLOW_PATHS],
    },
    sitemap: [`${baseUrl}/sitemap.xml`, `${apiUrl}/sitemap.xml`],
  };
}
```

**Corner case:** `preview.salafidurus.com` runs the Next.js app with `NODE_ENV=production` but is a Vercel preview deployment. `VERCEL_ENV=preview` causes `isProduction` to be `false`, so it returns `Disallow: /`. Non-Vercel hosts running `NODE_ENV=production` (without `VERCEL_ENV`) still get the allow rules — they're treated as production.

- [ ] **Step 2: Write unit tests**

**File:** `apps/web/src/app/robots.spec.ts`

```typescript
import { describe, it, expect, vi, afterEach } from "vitest";
import robots from "./robots";

describe("robots", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("disallows all in development", () => {
    vi.stubEnv("NODE_ENV", "development");
    expect(robots()).toEqual({
      rules: { userAgent: "*", disallow: "/" },
    });
  });

  it("disallows all on Vercel preview deployments", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("VERCEL_ENV", "preview");
    expect(robots()).toEqual({
      rules: { userAgent: "*", disallow: "/" },
    });
  });

  it("allows crawling with disallow paths in production", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_WEB_URL", "https://www.salafidurus.com");
    vi.stubEnv("NEXT_PUBLIC_API_URL", "https://api.salafidurus.com");
    const result = robots();
    expect(result).toEqual({
      rules: {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/settings", "/sign-in", "/library", "/feed/following", "/auth"],
      },
      sitemap: [
        "https://www.salafidurus.com/sitemap.xml",
        "https://api.salafidurus.com/sitemap.xml",
      ],
    });
  });

  it("uses fallback URLs when env vars are not set", () => {
    vi.stubEnv("NODE_ENV", "production");
    const result = robots();
    expect(result.sitemap[0]).toMatch(/^http:\/\/localhost:\d+\/sitemap\.xml$/);
    expect(result.sitemap[1]).toMatch(/^http:\/\/localhost:\d+\/sitemap\.xml$/);
  });
});
```

- [ ] **Step 3: Verify typecheck and tests**

Run: `bun run --filter web typecheck`
Run: `bun run --filter web test -- src/app/robots.spec.ts`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/app/robots.ts apps/web/src/app/robots.spec.ts
git commit -m "feat(web): add robots.txt with disallows and sitemap references"
```

---

### Task 6: Block crawling on CDN subdomains via Cloudflare

**Files:**

- No code changes — this is an infrastructure configuration task

**Goal:** Prevent search engines from crawling `cdn.salafidurus.com` and `preview-cdn.salafidurus.com`.

**Approach:** Cloudflare Transform Rule that responds to `/robots.txt` requests with `Disallow: /`.

- [ ] **Step 1: Create a Transform Rule in Cloudflare dashboard**

1. Log into Cloudflare dashboard for the domain serving `cdn.salafidurus.com` and `preview-cdn.salafidurus.com`
2. Go to **Rules → Transform Rules**
3. Create a rule with:
   - **Type:** `Rewrite URL` (or use a Worker / Page Rule depending on plan)
   - **Field:** `URI Path` equals `/robots.txt`
   - **Response:** Static response with:
     - Status: `200`
     - Content-Type: `text/plain`
     - Body: `User-agent: *\nDisallow: /\n`
4. Apply to both `cdn.salafidurus.com` and `preview-cdn.salafidurus.com`

Or use a Cloudflare Worker if the Transform Rule doesn't support static responses on your plan:

```javascript
// Cloudflare Worker — deploy at cdn.salafidurus.com/robots.txt
export default {
  async fetch(request) {
    const url = new URL(request.url);
    if (url.pathname === "/robots.txt") {
      return new Response("User-agent: *\nDisallow: /\n", {
        headers: { "content-type": "text/plain" },
      });
    }
    // Otherwise pass through to R2
    return fetch(request);
  },
};
```

- [ ] **Step 2: Verify**

```bash
curl https://cdn.salafidurus.com/robots.txt
# Expected: User-agent: *
#           Disallow: /

curl https://preview-cdn.salafidurus.com/robots.txt
# Expected: User-agent: *
#           Disallow: /
```

- [ ] **Step 3: No commit needed** (infrastructure change, managed outside the repository)

---

## Verification Checklist

1. `bun run --filter api typecheck` — PASS
2. `bun run --filter api test` — PASS (no regressions)
3. `bun run --filter web typecheck` — PASS
4. `bun run --filter web test` — PASS (sitemap + robots specs)
5. `bun run --filter web build` — PASS
6. `bun run lint` — PASS (no new lint violations)
7. Dev: `curl http://localhost:4000/sitemap.xml` returns 404
8. Dev: `curl http://localhost:4000/robots.txt` returns `Disallow: /` (API always blocks crawling)
9. Dev: `curl http://localhost:3000/sitemap.xml` returns empty set
10. Dev: `curl http://localhost:3000/robots.txt` disallows all
11. Prod: `curl https://api.salafidurus.com/robots.txt` returns `Disallow: /`
12. Prod: `curl https://cdn.salafidurus.com/robots.txt` returns `Disallow: /` (Cloudflare rule)
13. Prod: `curl https://preview.salafidurus.com/robots.txt` returns `Disallow: /` (VERCEL_ENV check)
14. Prod: `curl https://www.salafidurus.com/robots.txt` shows allow, disallows for admin/auth paths, and both sitemap references
15. Prod: `curl https://api.salafidurus.com/sitemap.xml` returns valid XML with absolute `https://www.salafidurus.com/...` locs (requires `SITEMAP_BASE_URL` set in API deploy env)

## Plan Completion

Tasks 1–5 (code changes) committed, all verification commands pass. Task 6 (Cloudflare rule) verified manually. Set `SITEMAP_BASE_URL=https://www.salafidurus.com` in production API environment. Move to `.agents/plans/completed/`.

## Follow-up (separate plan — not part of this implementation)

- Remove deprecated `routes.collections`, `routes.series`, `routes.lectures` from `packages/core-contracts/src/routes.ts` and update callers (e.g. home page suggestion handlers) to use `/listing/{slug}`
- Add nested listing URLs to sitemap when child listing pages ship
- Sitemap index on www when URL count approaches 50k

## Execution

Plan saved. Two execution options:

**1. Subagent-Driven (recommended)** — Dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** — Execute tasks in this session using executing-plans, batch execution with checkpoints

Which approach?
