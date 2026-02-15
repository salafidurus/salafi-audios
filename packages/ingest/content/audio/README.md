# Local Audio Staging

Place local audio files here before running ingestion.

Notes:

- This directory is git-ignored except for `README.md` and `.gitignore`.
- Use `audioAssets[].file` in `phase-02-sample.json` when files are stored in nested folders.

Folder layout:

- `packages/ingest/content/audio/<scholar-slug>/<lecture-slug>.mp3`

Optional nested layout (when using explicit `audioAssets[].file`):

- `packages/ingest/content/audio/<scholar-slug>/<series-slug>/<file>.mp3`

Examples:

- `packages/ingest/content/audio/abdul-aziz-ibn-baz/kitab-al-iman-lesson-01.mp3`
- `packages/ingest/content/audio/salih-al-fawzan/muhadarah-on-fear-of-allah.mp3`

How ingestion resolves audio:

1. If `audioAssets[].file` is set in JSON, that path is used.
2. Otherwise, it checks this folder using `<scholar-slug>/<lecture-slug>.mp3`.
3. If found and R2 is configured, it uploads to R2 and stores only the relative R2 key in DB.
4. API returns CDN URL by prefixing `ASSET_CDN_BASE_URL`.

Quick sample audio generation (requires ffmpeg):

```bash
ffmpeg -f lavfi -i anullsrc=r=44100:cl=mono -t 5 -q:a 9 -acodec libmp3lame packages/ingest/content/audio/abdul-aziz-ibn-baz/kitab-al-iman-lesson-01.mp3
```
