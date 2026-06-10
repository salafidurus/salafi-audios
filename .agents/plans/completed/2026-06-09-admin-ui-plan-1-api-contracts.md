# Admin UI — Plan 1: API & Contracts

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents
> available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`)
> syntax for tracking.

**Goal:** Lay the complete backend foundation — new shared contracts, presigned-URL media
service, and all admin API endpoints — that Plans 2 and 3 (Web and Native UI) depend on.

**Architecture:** New DTOs and endpoint constants are added to `packages/core-contracts`. A new
`MediaModule` handles Cloudflare R2 presigned URL generation using the AWS SDK v3 (R2 is
S3-compatible). New admin endpoints are added to existing NestJS modules (lectures, scholars,
live) plus the new media module, all guarded by `AdminPermissionGuard`.

**Tech Stack:** NestJS, Prisma (`@sd/core-db`), `@aws-sdk/client-s3`,
`@aws-sdk/s3-request-presigner`, `@sd/core-contracts`, Jest.

**Spec:** `.agents/plans/2026-06-09-admin-ui-design.md`

---

## File Map

```text
packages/core-contracts/src/
  types/media.types.ts               ← NEW: PresignedUrlRequestDto, PresignedUrlResponseDto
  types/lecture.types.ts             ← ADD: CreateLectureDto, AdminLectureListItemDto,
                                             AdminLectureListDto, AdminLectureDetailDto,
                                             BulkActionDto, BulkActionResultDto
  types/series.types.ts              ← ADD: AdminSeriesListItemDto, AdminSeriesDetailDto,
                                             CreateSeriesDto, UpdateSeriesDto
  types/collection.types.ts          ← ADD: AdminCollectionListItemDto, AdminCollectionDetailDto,
                                             CreateCollectionDto, UpdateCollectionDto
  types/index.ts                     ← EXPORT all new types
  index.ts                           ← EXPORT all new types
  endpoints.ts                       ← ADD all new admin endpoint paths

apps/api/src/
  modules/live/admin-live.controller.ts        ← FIX permission + ADD listChannels
  modules/lectures/admin-lectures.controller.ts ← ADD list, detail, create, bulk
  modules/lectures/lectures.service.ts          ← ADD listAdmin, getAdminDetail,
                                                        createLecture, bulkAction
  modules/lectures/lectures.repo.ts             ← ADD repo methods
  modules/lectures/dto/create-lecture.dto.ts    ← NEW
  modules/media/media.module.ts                 ← NEW
  modules/media/media.service.ts                ← NEW: getPresignedUploadUrl
  modules/media/media.controller.ts             ← NEW: POST /admin/media/presigned-url
  modules/scholars/admin-series.controller.ts   ← NEW: CRUD + bulk for series
  modules/scholars/admin-collections.controller.ts ← NEW: CRUD + bulk for collections
  modules/scholars/scholars.service.ts          ← ADD series/collection admin methods
  modules/scholars/scholars.repo.ts             ← ADD series/collection admin repo methods
  modules/scholars/scholars.module.ts           ← REGISTER new controllers
  app.module.ts                                 ← IMPORT MediaModule
```

---

## Task 1: Fix Permission Bug in AdminLiveController

**Files:**

- Modify: `apps/api/src/modules/live/admin-live.controller.ts`

The controller uses `'manage:live'` which is not in `ADMIN_PERMISSIONS`. The correct
value is `'manage:livestreams'`.

- [ ] **Step 1: Run the existing integration test to confirm the current state**

```bash
pnpm --filter api test -- src/modules/live/live.integration.spec.ts
```

- [ ] **Step 2: Fix all five `@RequiresPermission` calls**

In `apps/api/src/modules/live/admin-live.controller.ts`, replace every occurrence of
`'manage:live'` with `'manage:livestreams'`:

```typescript
// Before (5 occurrences)
@RequiresPermission('manage:live')

// After
@RequiresPermission('manage:livestreams')
```

- [ ] **Step 3: Run tests to confirm nothing broke**

```bash
pnpm --filter api test -- src/modules/live/live.integration.spec.ts
```

Expected: all pass.

- [ ] **Step 4: Commit**

```bash
git add apps/api/src/modules/live/admin-live.controller.ts
git commit -m "fix(live): correct permission name from manage:live to manage:livestreams"
```

---

## Task 2: Add New Contract Types

**Files:**

- Create: `packages/core-contracts/src/types/media.types.ts`
- Modify: `packages/core-contracts/src/types/lecture.types.ts`
- Modify: `packages/core-contracts/src/types/series.types.ts`
- Modify: `packages/core-contracts/src/types/collection.types.ts`

- [ ] **Step 1: Create `media.types.ts`**

```typescript
// packages/core-contracts/src/types/media.types.ts
export type PresignedUrlPurpose = "audio" | "image";

export type PresignedUrlRequestDto = {
  filename: string;
  contentType: string;
  purpose: PresignedUrlPurpose;
};

export type PresignedUrlResponseDto = {
  uploadUrl: string;
  publicUrl: string;
  objectKey: string;
};
```

- [ ] **Step 2: Add admin lecture types to `lecture.types.ts`**

Append to the bottom of `packages/core-contracts/src/types/lecture.types.ts`:

```typescript
export type CreateLectureDto = {
  title: string;
  slug?: string;
  scholarId?: string;
  seriesId?: string;
  topics?: string[];
  audioKey: string;
  format?: string;
  durationSeconds?: number;
  sizeBytes?: number;
};

export type AdminLectureListItemDto = {
  id: string;
  title: string;
  scholarName: string;
  status: StatusValue;
  durationSeconds?: number;
  orderIndex?: number;
  createdAt: string;
};

export type AdminLectureListDto = {
  items: AdminLectureListItemDto[];
  total: number;
  page: number;
};

export type AdminLectureDetailDto = {
  id: string;
  slug: string;
  title: string;
  description?: string;
  language?: string;
  status: StatusValue;
  orderIndex?: number;
  durationSeconds?: number;
  scholarId: string;
  scholarName: string;
  seriesId?: string;
  topics: string[];
  audioKey?: string;
  audioUrl?: string;
  createdAt: string;
  updatedAt?: string;
};

export type BulkActionDto = {
  action: "publish" | "archive";
  ids: string[];
};

export type BulkActionResultDto = {
  succeeded: string[];
  failed: string[];
};
```

- [ ] **Step 3: Add admin series types to `series.types.ts`**

Append to `packages/core-contracts/src/types/series.types.ts`:

```typescript
export type AdminSeriesListItemDto = {
  id: string;
  title: string;
  status: StatusValue;
  publishedLectureCount: number;
  orderIndex?: number;
};

export type AdminSeriesDetailDto = {
  id: string;
  scholarId: string;
  title: string;
  description?: string;
  coverImageUrl?: string;
  language?: string;
  status: StatusValue;
  orderIndex?: number;
};

export type CreateSeriesDto = {
  scholarId: string;
  title: string;
  description?: string;
  coverImageUrl?: string;
  language?: string;
  orderIndex?: number;
};

export type UpdateSeriesDto = {
  title?: string;
  description?: string;
  coverImageUrl?: string;
  language?: string;
  orderIndex?: number;
};
```

Note: `StatusValue` is already imported in `series.types.ts` — add the import if missing:

```typescript
import type { StatusValue } from "../types/common.types";
```

- [ ] **Step 4: Add admin collection types to `collection.types.ts`**

Append to `packages/core-contracts/src/types/collection.types.ts`:

```typescript
export type AdminCollectionListItemDto = {
  id: string;
  title: string;
  status: StatusValue;
  publishedLectureCount: number;
  orderIndex?: number;
};

export type AdminCollectionDetailDto = {
  id: string;
  scholarId: string;
  title: string;
  description?: string;
  coverImageUrl?: string;
  language?: string;
  status: StatusValue;
  orderIndex?: number;
};

export type CreateCollectionDto = {
  scholarId: string;
  title: string;
  description?: string;
  coverImageUrl?: string;
  language?: string;
  orderIndex?: number;
};

export type UpdateCollectionDto = {
  title?: string;
  description?: string;
  coverImageUrl?: string;
  language?: string;
  orderIndex?: number;
};
```

- [ ] **Step 5: Commit**

```bash
git add packages/core-contracts/src/types/
git commit -m "feat(contracts): add admin DTOs for media, lectures, series, collections"
```

---

## Task 3: Export New Types & Update Endpoints

**Files:**

- Modify: `packages/core-contracts/src/types/index.ts`
- Modify: `packages/core-contracts/src/index.ts`
- Modify: `packages/core-contracts/src/endpoints.ts`

- [ ] **Step 1: Add exports to `types/index.ts`**

Add these export blocks to `packages/core-contracts/src/types/index.ts`:

```typescript
export {
  type PresignedUrlPurpose,
  type PresignedUrlRequestDto,
  type PresignedUrlResponseDto,
} from "../types/media.types";
export {
  type AdminSeriesListItemDto,
  type AdminSeriesDetailDto,
  type CreateSeriesDto,
  type UpdateSeriesDto,
} from "../types/series.types";
export {
  type AdminCollectionListItemDto,
  type AdminCollectionDetailDto,
  type CreateCollectionDto,
  type UpdateCollectionDto,
} from "../types/collection.types";
```

Also add to the existing lecture exports block:

```typescript
  type CreateLectureDto,
  type AdminLectureListItemDto,
  type AdminLectureListDto,
  type AdminLectureDetailDto,
  type BulkActionDto,
  type BulkActionResultDto,
```

- [ ] **Step 2: Mirror exports in `index.ts`**

Add the same type exports to `packages/core-contracts/src/index.ts` following the existing
pattern.

- [ ] **Step 3: Update `endpoints.ts` admin section**

Replace the `admin` block in `packages/core-contracts/src/endpoints.ts` with:

```typescript
admin: {
  permissions: {
    me: "/admin/permissions/me",
    list: "/admin/permissions",
    grant: "/admin/permissions",
    revoke: (id: string) => `/admin/permissions/${id}`,
  },
  scholars: {
    create: "/admin/scholars",
    update: (id: string) => `/admin/scholars/${id}`,
  },
  topics: {
    create: "/admin/topics",
    update: (slug: string) => `/admin/topics/${slug}`,
    delete: (slug: string) => `/admin/topics/${slug}`,
  },
  lectures: {
    list: "/admin/lectures",
    detail: (id: string) => `/admin/lectures/${id}`,
    create: "/admin/lectures",
    update: (id: string) => `/admin/lectures/${id}`,
    publish: (id: string) => `/admin/lectures/${id}/publish`,
    archive: (id: string) => `/admin/lectures/${id}/archive`,
    bulk: "/admin/lectures/bulk",
  },
  series: {
    list: "/admin/series",
    detail: (id: string) => `/admin/series/${id}`,
    create: "/admin/series",
    update: (id: string) => `/admin/series/${id}`,
    publish: (id: string) => `/admin/series/${id}/publish`,
    archive: (id: string) => `/admin/series/${id}/archive`,
    bulk: "/admin/series/bulk",
  },
  collections: {
    list: "/admin/collections",
    detail: (id: string) => `/admin/collections/${id}`,
    create: "/admin/collections",
    update: (id: string) => `/admin/collections/${id}`,
    publish: (id: string) => `/admin/collections/${id}/publish`,
    archive: (id: string) => `/admin/collections/${id}/archive`,
    bulk: "/admin/collections/bulk",
  },
  live: {
    listChannels: "/admin/live/channels",
    createChannel: "/admin/live/channels",
    updateChannel: (id: string) => `/admin/live/channels/${id}`,
    createSession: "/admin/live/sessions",
    updateSession: (id: string) => `/admin/live/sessions/${id}`,
    updateStatus: (id: string) => `/admin/live/sessions/${id}/status`,
  },
  media: {
    presignedUrl: "/admin/media/presigned-url",
  },
},
```

- [ ] **Step 4: Verify the contracts package typechecks**

```bash
pnpm --filter core-contracts typecheck
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add packages/core-contracts/src/
git commit -m "feat(contracts): export new admin types and update endpoint map"
```

---

## Task 4: Create MediaModule with Presigned URL Endpoint

**Files:**

- Modify: `apps/api/src/shared/config/env.ts`
- Modify: `apps/api/src/shared/config/config.service.ts`
- Create: `apps/api/src/modules/media/media.service.ts`
- Create: `apps/api/src/modules/media/media.controller.ts`
- Create: `apps/api/src/modules/media/media.module.ts`
- Create: `apps/api/src/modules/media/media.service.spec.ts`
- Modify: `apps/api/src/app.module.ts`

Install AWS SDK packages (scoped to api):

```bash
pnpm --filter api add @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

- [ ] **Step 1: Add R2 environment variables to the Zod schema**

The API uses `env.ts` + Zod for fail-fast validation at bootstrap. Add the five R2 vars so the
server refuses to start if any are missing — matching the existing pattern for all other secrets.

In `apps/api/src/shared/config/env.ts`, add to `ApiEnvSchema`:

```typescript
R2_ACCOUNT_ID: z.string().min(1),
R2_ACCESS_KEY_ID: z.string().min(1),
R2_SECRET_ACCESS_KEY: z.string().min(1),
R2_BUCKET_NAME: z.string().min(1),
R2_PUBLIC_BASE_URL: z.string().url(),
```

Then add the corresponding typed getters to `apps/api/src/shared/config/config.service.ts`:

```typescript
get R2_ACCOUNT_ID(): string { return this.env.R2_ACCOUNT_ID; }
get R2_ACCESS_KEY_ID(): string { return this.env.R2_ACCESS_KEY_ID; }
get R2_SECRET_ACCESS_KEY(): string { return this.env.R2_SECRET_ACCESS_KEY; }
get R2_BUCKET_NAME(): string { return this.env.R2_BUCKET_NAME; }
get R2_PUBLIC_BASE_URL(): string { return this.env.R2_PUBLIC_BASE_URL; }
```

- [ ] **Step 2: Run the existing config tests to confirm no regression**

```bash
pnpm --filter api test -- src/shared/config
```

Expected: PASS (or no tests → acceptable). Also run `pnpm --filter api typecheck` to confirm
the new schema fields compile correctly.

- [ ] **Step 3: Write the failing MediaService test**

```typescript
// apps/api/src/modules/media/media.service.spec.ts
import { Test } from "@nestjs/testing";
import { MediaService } from "./media.service";
import { ConfigService } from "../../shared/config/config.module";

describe("MediaService", () => {
  let service: MediaService;

  beforeEach(async () => {
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

  it("generates an objectKey with the purpose prefix", async () => {
    const result = await service.getPresignedUploadUrl({
      filename: "lecture.mp3",
      contentType: "audio/mpeg",
      purpose: "audio",
    });

    expect(result.objectKey).toMatch(/^audio\//);
    expect(result.publicUrl).toContain("lecture.mp3");
    expect(result.uploadUrl).toBeTruthy();
  });
});
```

- [ ] **Step 4: Run test to confirm it fails**

```bash
pnpm --filter api test -- src/modules/media/media.service.spec.ts
```

Expected: FAIL — `MediaService` not found.

- [ ] **Step 5: Implement `media.service.ts`**

```typescript
// apps/api/src/modules/media/media.service.ts
import { Injectable } from "@nestjs/common";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { createId } from "@paralleldrive/cuid2";
import type { PresignedUrlRequestDto, PresignedUrlResponseDto } from "@sd/core-contracts";
import { ConfigService } from "../../shared/config/config.module";

@Injectable()
export class MediaService {
  private readonly s3: S3Client;
  private readonly bucket: string;
  private readonly publicBaseUrl: string;

  constructor(private readonly config: ConfigService) {
    this.bucket = config.R2_BUCKET_NAME;
    this.publicBaseUrl = config.R2_PUBLIC_BASE_URL;
    this.s3 = new S3Client({
      region: "auto",
      endpoint: `https://${config.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: config.R2_ACCESS_KEY_ID,
        secretAccessKey: config.R2_SECRET_ACCESS_KEY,
      },
    });
  }

  async getPresignedUploadUrl(dto: PresignedUrlRequestDto): Promise<PresignedUrlResponseDto> {
    const objectKey = `${dto.purpose}/${createId()}-${dto.filename}`;
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: objectKey,
      ContentType: dto.contentType,
    });
    const uploadUrl = await getSignedUrl(this.s3, command, { expiresIn: 300 });
    const publicUrl = `${this.publicBaseUrl}/${objectKey}`;
    return { uploadUrl, publicUrl, objectKey };
  }
}
```

- [ ] **Step 6: Run test to confirm it passes**

```bash
pnpm --filter api test -- src/modules/media/media.service.spec.ts
```

Expected: PASS.

- [ ] **Step 7: Create `media.controller.ts`**

```typescript
// apps/api/src/modules/media/media.controller.ts
import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import type { PresignedUrlRequestDto, PresignedUrlResponseDto } from "@sd/core-contracts";
import { ApiCommonErrors } from "../../shared/decorators/api-common-errors.decorator";
import { RequiresPermission } from "../../shared/decorators/requires-permission.decorator";
import { AdminPermissionGuard } from "../../shared/guards/admin-permission.guard";
import { MediaService } from "./media.service";

@ApiTags("Admin Media")
@ApiCommonErrors()
@Controller("admin/media")
@UseGuards(AdminPermissionGuard)
export class MediaController {
  constructor(private readonly service: MediaService) {}

  @Post("presigned-url")
  @RequiresPermission("manage:content")
  @ApiOperation({ summary: "Get a presigned R2 upload URL" })
  getPresignedUrl(@Body() dto: PresignedUrlRequestDto): Promise<PresignedUrlResponseDto> {
    return this.service.getPresignedUploadUrl(dto);
  }
}
```

- [ ] **Step 8: Create `media.module.ts`**

```typescript
// apps/api/src/modules/media/media.module.ts
import { Module } from "@nestjs/common";
import { MediaController } from "./media.controller";
import { MediaService } from "./media.service";

@Module({
  controllers: [MediaController],
  providers: [MediaService],
  exports: [MediaService],
})
export class MediaModule {}
```

- [ ] **Step 9: Register in `app.module.ts`**

Add `MediaModule` to the imports array in `apps/api/src/app.module.ts`:

```typescript
import { MediaModule } from "./modules/media/media.module";
// ... add MediaModule to the imports array
```

- [ ] **Step 10: Typecheck**

```bash
pnpm --filter api typecheck
```

Expected: no errors.

- [ ] **Step 11: Commit**

```bash
git add apps/api/src/shared/config/env.ts \
        apps/api/src/shared/config/config.service.ts \
        apps/api/src/modules/media/ \
        apps/api/src/app.module.ts
git commit -m "feat(api): add MediaModule with R2 presigned URL endpoint and env validation"
```

---

## Task 5: Admin Lecture List, Detail & Create Endpoints

**Files:**

- Modify: `apps/api/src/modules/lectures/admin-lectures.controller.ts`
- Modify: `apps/api/src/modules/lectures/lectures.service.ts`
- Modify: `apps/api/src/modules/lectures/lectures.repo.ts`
- Create: `apps/api/src/modules/lectures/dto/create-lecture.dto.ts`
- Modify: `apps/api/src/modules/lectures/lectures.service.spec.ts`

- [ ] **Step 1: Write failing tests for new service methods**

Add to `apps/api/src/modules/lectures/lectures.service.spec.ts`:

```typescript
describe("listAdmin", () => {
  it("returns paginated lecture list with scholar name", async () => {
    mockRepo.listAdmin.mockResolvedValue({
      items: [
        {
          id: "1",
          title: "Test Lecture",
          scholarName: "Sheikh Test",
          status: "published",
          durationSeconds: 3600,
          orderIndex: 1,
          createdAt: new Date().toISOString(),
        },
      ],
      total: 1,
      page: 1,
    });

    const result = await service.listAdmin({ page: 1, scholarId: undefined, status: undefined });
    expect(result.items).toHaveLength(1);
    expect(result.items[0].scholarName).toBe("Sheikh Test");
  });
});

describe("createLecture", () => {
  it("creates lecture and audio asset in a transaction", async () => {
    mockRepo.createWithAudioAsset.mockResolvedValue({ id: "new-id", title: "New Lecture" });
    const result = await service.createLecture({
      title: "New Lecture",
      audioKey: "audio/abc-file.mp3",
    });
    expect(result.id).toBe("new-id");
    expect(mockRepo.createWithAudioAsset).toHaveBeenCalledWith(
      expect.objectContaining({ audioKey: "audio/abc-file.mp3" }),
    );
  });
});
```

- [ ] **Step 2: Run to confirm failure**

```bash
pnpm --filter api test -- src/modules/lectures/lectures.service.spec.ts
```

Expected: FAIL — methods not found.

- [ ] **Step 3: Create `dto/create-lecture.dto.ts`**

```typescript
// apps/api/src/modules/lectures/dto/create-lecture.dto.ts
import { IsString, IsOptional, IsArray, IsNumber } from "class-validator";

export class CreateLectureDto {
  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsString()
  scholarId?: string;

  @IsOptional()
  @IsString()
  seriesId?: string;

  @IsOptional()
  @IsArray()
  topics?: string[];

  @IsString()
  audioKey!: string;

  @IsOptional()
  @IsString()
  format?: string;

  @IsOptional()
  @IsNumber()
  durationSeconds?: number;

  @IsOptional()
  @IsNumber()
  sizeBytes?: number;
}
```

- [ ] **Step 4: Add repo methods to `lectures.repo.ts`**

Add these methods to `LecturesRepository`:

```typescript
async listAdmin(params: {
  page: number;
  scholarId?: string;
  status?: string;
  search?: string;
}): Promise<import('@sd/core-contracts').AdminLectureListDto> {
  const pageSize = 50;
  const skip = (params.page - 1) * pageSize;

  const where: Prisma.LectureWhereInput = {
    deletedAt: null,
    ...(params.scholarId ? { scholarId: params.scholarId } : {}),
    ...(params.status ? { status: params.status as Status } : {}),
    ...(params.search
      ? { title: { contains: params.search, mode: 'insensitive' } }
      : {}),
  };

  const [records, total] = await Promise.all([
    this.prisma.lecture.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        status: true,
        durationSeconds: true,
        orderIndex: true,
        createdAt: true,
        scholar: { select: { name: true } },
      },
    }),
    this.prisma.lecture.count({ where }),
  ]);

  return {
    items: records.map((r) => ({
      id: r.id,
      title: r.title,
      scholarName: r.scholar.name,
      status: r.status as import('@sd/core-contracts').StatusValue,
      durationSeconds: r.durationSeconds ?? undefined,
      orderIndex: r.orderIndex ?? undefined,
      createdAt: r.createdAt.toISOString(),
    })),
    total,
    page: params.page,
  };
}

async findAdminDetail(
  id: string,
): Promise<import('@sd/core-contracts').AdminLectureDetailDto | null> {
  const lecture = await this.prisma.lecture.findFirst({
    where: { id, deletedAt: null },
    select: {
      id: true,
      slug: true,
      title: true,
      description: true,
      language: true,
      status: true,
      orderIndex: true,
      durationSeconds: true,
      createdAt: true,
      updatedAt: true,
      scholarId: true,
      seriesId: true,
      scholar: { select: { name: true } },
      topics: { select: { topic: { select: { id: true } } } },
      audioAssets: {
        where: { isPrimary: true },
        take: 1,
        select: { url: true },
      },
    },
  });
  if (!lecture) return null;

  return {
    id: lecture.id,
    slug: lecture.slug,
    title: lecture.title,
    description: lecture.description ?? undefined,
    language: lecture.language ?? undefined,
    status: lecture.status as import('@sd/core-contracts').StatusValue,
    orderIndex: lecture.orderIndex ?? undefined,
    durationSeconds: lecture.durationSeconds ?? undefined,
    scholarId: lecture.scholarId,
    scholarName: lecture.scholar.name,
    seriesId: lecture.seriesId ?? undefined,
    topics: lecture.topics.map((t) => t.topic.id),
    audioUrl: lecture.audioAssets[0]?.url,
    createdAt: lecture.createdAt.toISOString(),
    updatedAt: lecture.updatedAt?.toISOString(),
  };
}

async createWithAudioAsset(dto: import('./dto/create-lecture.dto').CreateLectureDto & {
  publicUrl: string;
}): Promise<{ id: string; title: string }> {
  const slug = dto.slug ?? dto.title.toLowerCase().replace(/\s+/g, '-');

  return this.prisma.$transaction(async (tx) => {
    const lecture = await tx.lecture.create({
      data: {
        title: dto.title,
        slug,
        scholarId: dto.scholarId ?? undefined,
        seriesId: dto.seriesId ?? undefined,
        status: Status.draft,
        durationSeconds: dto.durationSeconds ?? undefined,
        ...(dto.topics?.length
          ? {
              topics: {
                create: dto.topics.map((topicId) => ({ topicId })),
              },
            }
          : {}),
      },
      select: { id: true, title: true },
    });

    await tx.audioAsset.create({
      data: {
        lectureId: lecture.id,
        url: dto.publicUrl,
        format: dto.format ?? undefined,
        sizeBytes: dto.sizeBytes ?? undefined,
        durationSeconds: dto.durationSeconds ?? undefined,
        isPrimary: true,
        source: 'r2',
      },
    });

    return lecture;
  });
}
```

- [ ] **Step 5: Add service methods to `lectures.service.ts`**

```typescript
async listAdmin(params: {
  page: number;
  scholarId?: string;
  status?: string;
  search?: string;
}): Promise<AdminLectureListDto> {
  return this.repo.listAdmin(params);
}

async getAdminDetail(id: string): Promise<AdminLectureDetailDto> {
  const lecture = await this.repo.findAdminDetail(id);
  if (!lecture) throw new NotFoundException(`Lecture "${id}" not found`);
  return lecture;
}

async createLecture(
  dto: CreateLectureDto & { publicUrl: string },
): Promise<{ id: string; title: string }> {
  return this.repo.createWithAudioAsset(dto);
}
```

- [ ] **Step 6: Update `admin-lectures.controller.ts`**

Add these endpoints:

```typescript
@Get()
@RequiresPermission('manage:content')
@ApiOperation({ summary: 'List all lectures (admin)' })
listAdmin(
  @Query('page') page = '1',
  @Query('scholarId') scholarId?: string,
  @Query('status') status?: string,
  @Query('search') search?: string,
): Promise<AdminLectureListDto> {
  return this.lectures.listAdmin({
    page: Number(page),
    scholarId,
    status,
    search,
  });
}

@Get(':id')
@RequiresPermission('manage:content')
@ApiOperation({ summary: 'Get lecture detail (admin)' })
getAdminDetail(@Param('id') id: string): Promise<AdminLectureDetailDto> {
  return this.lectures.getAdminDetail(id);
}

@Post()
@RequiresPermission('manage:content')
@ApiOperation({ summary: 'Create a lecture after R2 upload' })
createLecture(@Body() dto: CreateLectureDto): Promise<{ id: string; title: string }> {
  // publicUrl is derived by the client from the presigned URL response;
  // the audioKey must resolve to a valid R2 object.
  const publicUrl = `${process.env['R2_PUBLIC_BASE_URL']}/${dto.audioKey}`;
  return this.lectures.createLecture({ ...dto, publicUrl });
}
```

Add imports as needed: `Get`, `Query`, `AdminLectureListDto`, `AdminLectureDetailDto`,
`CreateLectureDto`.

- [ ] **Step 7: Run tests**

```bash
pnpm --filter api test -- src/modules/lectures/lectures.service.spec.ts
```

Expected: all pass.

- [ ] **Step 8: Typecheck**

```bash
pnpm --filter api typecheck
```

- [ ] **Step 9: Commit**

```bash
git add apps/api/src/modules/lectures/
git commit -m "feat(api): add admin lecture list, detail, and create endpoints"
```

---

## Task 6: Admin Lecture Bulk Action Endpoint

**Files:**

- Modify: `apps/api/src/modules/lectures/admin-lectures.controller.ts`
- Modify: `apps/api/src/modules/lectures/lectures.service.ts`
- Modify: `apps/api/src/modules/lectures/lectures.repo.ts`
- Modify: `apps/api/src/modules/lectures/lectures.service.spec.ts`

- [ ] **Step 1: Write the failing test**

```typescript
describe("bulkAction", () => {
  it("publishes multiple lectures and returns succeeded ids", async () => {
    mockRepo.bulkUpdateStatus.mockResolvedValue({ succeeded: ["1", "2"], failed: [] });
    const result = await service.bulkAction({ action: "publish", ids: ["1", "2"] });
    expect(result.succeeded).toEqual(["1", "2"]);
    expect(result.failed).toEqual([]);
  });

  it("returns failed ids when a lecture is not found", async () => {
    mockRepo.bulkUpdateStatus.mockResolvedValue({ succeeded: ["1"], failed: ["missing"] });
    const result = await service.bulkAction({ action: "archive", ids: ["1", "missing"] });
    expect(result.failed).toContain("missing");
  });
});
```

- [ ] **Step 2: Run to confirm failure**

```bash
pnpm --filter api test -- src/modules/lectures/lectures.service.spec.ts
```

- [ ] **Step 3: Add repo method**

```typescript
async bulkUpdateStatus(
  ids: string[],
  status: Status,
): Promise<BulkActionResultDto> {
  const succeeded: string[] = [];
  const failed: string[] = [];

  await Promise.all(
    ids.map(async (id) => {
      try {
        const updated = await this.prisma.lecture.updateMany({
          where: { id, deletedAt: null },
          data: { status, ...(status === Status.published ? { publishedAt: new Date() } : {}) },
        });
        if (updated.count > 0) {
          succeeded.push(id);
        } else {
          failed.push(id);
        }
      } catch {
        failed.push(id);
      }
    }),
  );

  return { succeeded, failed };
}
```

- [ ] **Step 4: Add service method**

```typescript
async bulkAction(dto: BulkActionDto): Promise<BulkActionResultDto> {
  const status = dto.action === 'publish' ? Status.published : Status.archived;
  return this.repo.bulkUpdateStatus(dto.ids, status);
}
```

- [ ] **Step 5: Add controller endpoint**

```typescript
@Post('bulk')
@RequiresPermission('manage:content')
@ApiOperation({ summary: 'Bulk publish or archive lectures' })
bulkAction(@Body() dto: BulkActionDto): Promise<BulkActionResultDto> {
  return this.lectures.bulkAction(dto);
}
```

- [ ] **Step 6: Run tests**

```bash
pnpm --filter api test -- src/modules/lectures/lectures.service.spec.ts
```

Expected: all pass.

- [ ] **Step 7: Commit**

```bash
git add apps/api/src/modules/lectures/
git commit -m "feat(api): add bulk publish/archive endpoint for lectures"
```

---

## Task 7: Admin Series Endpoints (within ScholarsModule)

**Files:**

- Create: `apps/api/src/modules/scholars/admin-series.controller.ts`
- Create: `apps/api/src/modules/scholars/dto/create-series.dto.ts`
- Create: `apps/api/src/modules/scholars/dto/update-series.dto.ts`
- Modify: `apps/api/src/modules/scholars/scholars.service.ts`
- Modify: `apps/api/src/modules/scholars/scholars.repo.ts`
- Modify: `apps/api/src/modules/scholars/scholars.module.ts`
- Modify: `apps/api/src/modules/scholars/scholars.service.spec.ts`

- [ ] **Step 1: Write failing tests**

Add to `apps/api/src/modules/scholars/scholars.service.spec.ts`:

```typescript
describe("listAdminSeries", () => {
  it("returns series filtered by scholarId", async () => {
    mockRepo.listAdminSeries.mockResolvedValue([
      {
        id: "s1",
        title: "Series One",
        status: "published",
        publishedLectureCount: 5,
        orderIndex: 1,
      },
    ]);
    const result = await service.listAdminSeries("scholar-1");
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe("Series One");
  });
});

describe("createSeries", () => {
  it("creates a series for the scholar", async () => {
    mockRepo.createSeries.mockResolvedValue({ id: "new-series" });
    const result = await service.createSeries({ scholarId: "sc1", title: "New Series" });
    expect(result.id).toBe("new-series");
  });
});
```

- [ ] **Step 2: Run to confirm failure**

```bash
pnpm --filter api test -- src/modules/scholars/scholars.service.spec.ts
```

- [ ] **Step 3: Create DTOs**

```typescript
// apps/api/src/modules/scholars/dto/create-series.dto.ts
import { IsString, IsOptional, IsNumber } from "class-validator";

export class CreateSeriesDto {
  @IsString()
  scholarId!: string;

  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  coverImageUrl?: string;

  @IsOptional()
  @IsString()
  language?: string;

  @IsOptional()
  @IsNumber()
  orderIndex?: number;
}
```

```typescript
// apps/api/src/modules/scholars/dto/update-series.dto.ts
import { IsString, IsOptional, IsNumber } from "class-validator";

export class UpdateSeriesDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  coverImageUrl?: string;

  @IsOptional()
  @IsString()
  language?: string;

  @IsOptional()
  @IsNumber()
  orderIndex?: number;
}
```

- [ ] **Step 4: Add repo methods to `scholars.repo.ts`**

```typescript
async listAdminSeries(scholarId: string): Promise<AdminSeriesListItemDto[]> {
  const records = await this.prisma.series.findMany({
    where: { scholarId, deletedAt: null },
    orderBy: [{ orderIndex: 'asc' }, { createdAt: 'asc' }],
    select: {
      id: true,
      title: true,
      status: true,
      orderIndex: true,
      _count: {
        select: {
          lectures: { where: { status: Status.published, deletedAt: null } },
        },
      },
    },
  });
  return records.map((r) => ({
    id: r.id,
    title: r.title,
    status: r.status as StatusValue,
    publishedLectureCount: r._count.lectures,
    orderIndex: r.orderIndex ?? undefined,
  }));
}

async findAdminSeriesDetail(id: string): Promise<AdminSeriesDetailDto | null> {
  const record = await this.prisma.series.findFirst({
    where: { id, deletedAt: null },
    select: {
      id: true, scholarId: true, title: true, description: true,
      coverImageUrl: true, language: true, status: true, orderIndex: true,
    },
  });
  if (!record) return null;
  return { ...record, status: record.status as StatusValue,
    description: record.description ?? undefined,
    coverImageUrl: record.coverImageUrl ?? undefined,
    language: record.language ?? undefined,
    orderIndex: record.orderIndex ?? undefined };
}

async createSeries(dto: CreateSeriesDto): Promise<{ id: string }> {
  return this.prisma.series.create({
    data: {
      scholarId: dto.scholarId,
      title: dto.title,
      slug: dto.title.toLowerCase().replace(/\s+/g, '-'),
      description: dto.description,
      coverImageUrl: dto.coverImageUrl,
      language: dto.language as Language | undefined,
      orderIndex: dto.orderIndex,
      status: Status.draft,
    },
    select: { id: true },
  });
}

async updateSeries(id: string, dto: UpdateSeriesDto): Promise<{ id: string } | null> {
  try {
    return await this.prisma.series.update({
      where: { id, deletedAt: null },
      data: dto,
      select: { id: true },
    });
  } catch {
    return null;
  }
}

async updateSeriesStatus(id: string, status: Status): Promise<boolean> {
  const result = await this.prisma.series.updateMany({
    where: { id, deletedAt: null },
    data: { status },
  });
  return result.count > 0;
}

async bulkUpdateSeriesStatus(ids: string[], status: Status): Promise<BulkActionResultDto> {
  const succeeded: string[] = [];
  const failed: string[] = [];
  await Promise.all(
    ids.map(async (id) => {
      const ok = await this.updateSeriesStatus(id, status);
      (ok ? succeeded : failed).push(id);
    }),
  );
  return { succeeded, failed };
}
```

- [ ] **Step 5: Add service methods to `scholars.service.ts`**

```typescript
listAdminSeries(scholarId: string) { return this.repo.listAdminSeries(scholarId); }

async getAdminSeriesDetail(id: string): Promise<AdminSeriesDetailDto> {
  const s = await this.repo.findAdminSeriesDetail(id);
  if (!s) throw new NotFoundException(`Series "${id}" not found`);
  return s;
}

createSeries(dto: CreateSeriesDto) { return this.repo.createSeries(dto); }

async updateSeries(id: string, dto: UpdateSeriesDto) {
  const updated = await this.repo.updateSeries(id, dto);
  if (!updated) throw new NotFoundException(`Series "${id}" not found`);
  return updated;
}

async publishSeries(id: string) {
  const ok = await this.repo.updateSeriesStatus(id, Status.published);
  if (!ok) throw new NotFoundException(`Series "${id}" not found`);
  return { success: true };
}

async archiveSeries(id: string) {
  const ok = await this.repo.updateSeriesStatus(id, Status.archived);
  if (!ok) throw new NotFoundException(`Series "${id}" not found`);
  return { success: true };
}

bulkSeriesAction(dto: BulkActionDto): Promise<BulkActionResultDto> {
  const status = dto.action === 'publish' ? Status.published : Status.archived;
  return this.repo.bulkUpdateSeriesStatus(dto.ids, status);
}
```

- [ ] **Step 6: Create `admin-series.controller.ts`**

```typescript
// apps/api/src/modules/scholars/admin-series.controller.ts
import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import type {
  AdminSeriesListItemDto,
  AdminSeriesDetailDto,
  BulkActionDto,
  BulkActionResultDto,
} from "@sd/core-contracts";
import { ApiCommonErrors } from "../../shared/decorators/api-common-errors.decorator";
import { RequiresPermission } from "../../shared/decorators/requires-permission.decorator";
import { AdminPermissionGuard } from "../../shared/guards/admin-permission.guard";
import { ScholarsService } from "./scholars.service";
import { CreateSeriesDto } from "./dto/create-series.dto";
import { UpdateSeriesDto } from "./dto/update-series.dto";

@ApiTags("Admin Series")
@ApiCommonErrors()
@Controller("admin/series")
@UseGuards(AdminPermissionGuard)
export class AdminSeriesController {
  constructor(private readonly service: ScholarsService) {}

  @Get()
  @RequiresPermission("manage:content")
  @ApiOperation({ summary: "List series (optionally filtered by scholarId)" })
  list(@Query("scholarId") scholarId?: string): Promise<AdminSeriesListItemDto[]> {
    return this.service.listAdminSeries(scholarId ?? "");
  }

  @Get(":id")
  @RequiresPermission("manage:content")
  @ApiOperation({ summary: "Get series detail" })
  detail(@Param("id") id: string): Promise<AdminSeriesDetailDto> {
    return this.service.getAdminSeriesDetail(id);
  }

  @Post()
  @RequiresPermission("manage:content")
  @ApiOperation({ summary: "Create a series" })
  create(@Body() dto: CreateSeriesDto) {
    return this.service.createSeries(dto);
  }

  @Patch(":id")
  @RequiresPermission("manage:content")
  @ApiOperation({ summary: "Update a series" })
  update(@Param("id") id: string, @Body() dto: UpdateSeriesDto) {
    return this.service.updateSeries(id, dto);
  }

  @Post(":id/publish")
  @RequiresPermission("manage:content")
  @ApiOperation({ summary: "Publish a series" })
  publish(@Param("id") id: string) {
    return this.service.publishSeries(id);
  }

  @Post(":id/archive")
  @RequiresPermission("manage:content")
  @ApiOperation({ summary: "Archive a series" })
  archive(@Param("id") id: string) {
    return this.service.archiveSeries(id);
  }

  @Post("bulk")
  @RequiresPermission("manage:content")
  @ApiOperation({ summary: "Bulk publish or archive series" })
  bulk(@Body() dto: BulkActionDto): Promise<BulkActionResultDto> {
    return this.service.bulkSeriesAction(dto);
  }
}
```

- [ ] **Step 7: Register in `scholars.module.ts`**

Add `AdminSeriesController` to the `controllers` array.

- [ ] **Step 8: Run tests**

```bash
pnpm --filter api test -- src/modules/scholars/scholars.service.spec.ts
```

Expected: all pass.

- [ ] **Step 9: Commit**

```bash
git add apps/api/src/modules/scholars/
git commit -m "feat(api): add admin series CRUD and bulk action endpoints"
```

---

## Task 8: Admin Collections Endpoints

**Files:** Same module as series — follow the identical pattern from Task 7 but for
`Collection` model.

- Create: `apps/api/src/modules/scholars/admin-collections.controller.ts`
- Create: `apps/api/src/modules/scholars/dto/create-collection.dto.ts`
- Create: `apps/api/src/modules/scholars/dto/update-collection.dto.ts`
- Modify: `scholars.service.ts`, `scholars.repo.ts`, `scholars.module.ts`

The implementation mirrors Task 7 exactly, replacing `series` with `collection` throughout
(model: `this.prisma.collection`). Follow the same test → repo → service → controller →
register → test → commit sequence.

- [ ] **Step 1–9:** Mirror Task 7 with `collection` substituted for `series`.

```bash
git commit -m "feat(api): add admin collections CRUD and bulk action endpoints"
```

---

## Task 9: Add GET /admin/live/channels

**Files:**

- Modify: `apps/api/src/modules/live/admin-live.controller.ts`
- Modify: `apps/api/src/modules/live/live.service.ts`
- Modify: `apps/api/src/modules/live/live.repo.ts`

- [ ] **Step 1: Write failing test**

In `apps/api/src/modules/live/live.service.spec.ts`, add:

```typescript
describe("listChannels", () => {
  it("returns all channels", async () => {
    mockRepo.listChannels.mockResolvedValue([
      {
        id: "c1",
        displayName: "Channel 1",
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ]);
    const result = await service.listChannels();
    expect(result).toHaveLength(1);
  });
});
```

- [ ] **Step 2: Add repo method**

```typescript
async listChannels(): Promise<LivestreamChannelDto[]> {
  const records = await this.prisma.livestreamChannel.findMany({
    orderBy: { displayName: 'asc' },
    select: {
      id: true, displayName: true, telegramSlug: true,
      language: true, isActive: true, createdAt: true, updatedAt: true,
      scholar: { select: { name: true, slug: true, imageUrl: true } },
    },
  });
  return records.map((r) => ({
    id: r.id,
    displayName: r.displayName,
    telegramSlug: r.telegramSlug ?? undefined,
    language: r.language ?? undefined,
    isActive: r.isActive,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
    scholarName: r.scholar?.name,
    scholarSlug: r.scholar?.slug,
    scholarImageUrl: r.scholar?.imageUrl ?? undefined,
  }));
}
```

- [ ] **Step 3: Add service method**

```typescript
listChannels(): Promise<LivestreamChannelDto[]> { return this.repo.listChannels(); }
```

- [ ] **Step 4: Add controller endpoint**

```typescript
@Get('channels')
@RequiresPermission('manage:livestreams')
@ApiOperation({ summary: 'List all livestream channels' })
listChannels(): Promise<LivestreamChannelDto[]> {
  return this.service.listChannels();
}
```

- [ ] **Step 5: Run tests**

```bash
pnpm --filter api test -- src/modules/live/live.service.spec.ts
```

- [ ] **Step 6: Full typecheck and test run**

```bash
pnpm typecheck:api+web
pnpm test:api+web
```

Expected: all pass.

- [ ] **Step 7: Commit**

```bash
git add apps/api/src/modules/live/
git commit -m "feat(api): add GET /admin/live/channels endpoint"
```

---

## Final Validation

- [ ] Run the full API test suite: `pnpm --filter api test`
- [ ] Run typecheck across api + web: `pnpm typecheck:api+web`
- [ ] Confirm all new routes appear in Swagger: start the API with `pnpm dev:api` and visit
      `/api/docs`

Plan 1 complete. Proceed to Plan 2 (Web UI) once the API is deployed or running locally.
