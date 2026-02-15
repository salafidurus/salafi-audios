# @sd/ingest

Deterministic Phase 02 content ingestion tooling.

Core modules:

- `src/commands/` command entrypoints
- `src/cli/` CLI arg parsing and input resolution
- `src/schema/content-schema.ts` schema validation and typed content model
- `src/core/run-ingestion.ts` orchestration and DB upsert flow
- `src/core/topic-sync.ts` topic + join-table synchronization
- `src/core/audio-assets.ts` audio asset normalization and upsert logic
- `src/storage/r2.ts` R2 upload adapter

## Run

From repo root:

```bash
pnpm ingest:content -- --tag phase-02-seed
```

Fix grouped series collections:

```bash
pnpm --filter @sd/ingest fix:series-collections -- --tag phase-02-series-fix
```

Optional prefixes override:

```bash
pnpm --filter @sd/ingest fix:series-collections -- --tag phase-02-series-fix --prefixes shAbadSB,shBnBazSB
```

Remove a tagged ingestion batch:

```bash
pnpm ingest:remove -- --tag phase-02-seed --environment development
```

Or scoped directly:

```bash
pnpm --filter @sd/ingest ingest:content -- --tag phase-02-seed
```

## Options

- `--file <path>`: JSON content definition path
- `--tag <name>`: ingestion batch tag (required)
- `--environment <name>`: ingestion environment label
- `--dry-run`: validate and execute ingestion transaction, then rollback
- `--strict-audio-upload`: fail if an audio asset needs upload and R2 is not configured
- `--audio-dir <path>`: directory to look for local audio files (default: `packages/ingest/content/audio`)

Default sample file:

- `packages/ingest/content/phase-02-sample.json`

Default local audio directory convention:

- `packages/ingest/content/audio/<scholar-slug>/<lecture-slug>.mp3`

## Environment

Required (one of):

- `DATABASE_URL`
- `DIRECT_DB_URL`

Used by API responses (in `apps/api` env):

- `ASSET_CDN_BASE_URL`

Required for uploading `audioAssets[].file` to R2:

- `R2_ACCOUNT_ID`
- `R2_BUCKET`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_PUBLIC_BASE_URL`

## Removal Options

- `--tag <name>`: ingestion batch tag
- `--environment <name>`: ingestion environment label
- `--dry-run`: report rows/keys without deleting
- `--skip-r2`: remove only DB rows and keep R2 objects

Removal also cleans up orphan topics that are no longer referenced by any lecture, series, or collection.
