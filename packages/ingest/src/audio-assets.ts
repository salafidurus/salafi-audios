import * as path from "node:path";
import { access } from "node:fs/promises";
import { S3Client } from "@aws-sdk/client-s3";
import { Prisma } from "@sd/db/client";
import { z } from "zod";
import { LectureDef, audioAssetSchema } from "./content-schema";
import { R2Config, uploadAudioFile } from "./r2";

function normalizePrimaryAudioAssets(assets: LectureDef["audioAssets"]): LectureDef["audioAssets"] {
  if (assets.length === 0) return assets;

  const primaryCount = assets.filter((asset) => asset.isPrimary === true).length;
  if (primaryCount === 0) {
    const [first, ...rest] = assets;
    if (!first) return assets;
    return [{ ...first, isPrimary: true }, ...rest];
  }

  if (primaryCount > 1) {
    throw new Error("A lecture cannot contain more than one primary audio asset.");
  }

  return assets;
}

function ensureAudioAssetShape(
  asset: z.infer<typeof audioAssetSchema>,
  resolvedAudioFile: string | null,
): void {
  if (!asset.url && !asset.file && !resolvedAudioFile) {
    throw new Error(
      "Each audio asset must include either `url`, `file`, or a matching local file.",
    );
  }
}

type SyncLectureAudioAssetsInput = {
  lectureId: string;
  scholarSlug: string;
  lectureSlug: string;
  audioAssets: LectureDef["audioAssets"];
  ingestionBatchId: string;
  environment: string;
  batchTag: string;
  strictAudioUpload: boolean;
  r2Client: S3Client | null;
  r2Config: R2Config | null;
  audioBaseDir?: string;
};

async function resolveAudioFilePath(
  asset: z.infer<typeof audioAssetSchema>,
  input: SyncLectureAudioAssetsInput,
): Promise<string | null> {
  if (asset.file) {
    return asset.file;
  }

  const baseDir = input.audioBaseDir;
  if (!baseDir) {
    return null;
  }

  const conventionalPath = path.join(baseDir, input.scholarSlug, `${input.lectureSlug}.mp3`);

  try {
    await access(path.resolve(process.cwd(), conventionalPath));
    return conventionalPath;
  } catch {
    return null;
  }
}

export async function syncLectureAudioAssets(
  tx: Prisma.TransactionClient,
  input: SyncLectureAudioAssetsInput,
): Promise<void> {
  if (input.audioAssets.length === 0) {
    return;
  }

  const normalizedAssets = normalizePrimaryAudioAssets(input.audioAssets);
  const upsertedUrls: string[] = [];

  for (const asset of normalizedAssets) {
    let url = asset.url;
    let source = asset.source ?? "ingestion";
    const resolvedAudioFile = await resolveAudioFilePath(asset, input);
    ensureAudioAssetShape(asset, resolvedAudioFile);

    if (!url || resolvedAudioFile) {
      if (!resolvedAudioFile) {
        throw new Error("Audio asset file path is required when url is missing.");
      }

      if (!input.r2Client || !input.r2Config) {
        if (input.strictAudioUpload) {
          throw new Error("R2 is not configured. Set R2_* environment variables.");
        }

        const absolutePath = path.resolve(process.cwd(), resolvedAudioFile);
        url = `file://${absolutePath.replace(/\\/g, "/")}`;
        source = "ingestion-local";
      } else {
        url = await uploadAudioFile(input.r2Client, input.r2Config, {
          environment: input.environment,
          batchTag: input.batchTag,
          scholarSlug: input.scholarSlug,
          lectureSlug: input.lectureSlug,
          filePath: resolvedAudioFile,
        });
        source = asset.source ?? "r2";
      }
    }

    const existing = await tx.audioAsset.findFirst({
      where: { lectureId: input.lectureId, url },
      select: { id: true },
    });

    if (existing) {
      await tx.audioAsset.update({
        where: { id: existing.id },
        data: {
          format: asset.format,
          bitrateKbps: asset.bitrateKbps,
          sizeBytes: typeof asset.sizeBytes === "number" ? BigInt(asset.sizeBytes) : null,
          durationSeconds: asset.durationSeconds,
          source,
          isPrimary: asset.isPrimary === true,
          ingestionBatchId: input.ingestionBatchId,
        },
      });
    } else {
      await tx.audioAsset.create({
        data: {
          lectureId: input.lectureId,
          url,
          format: asset.format,
          bitrateKbps: asset.bitrateKbps,
          sizeBytes: typeof asset.sizeBytes === "number" ? BigInt(asset.sizeBytes) : null,
          durationSeconds: asset.durationSeconds,
          source,
          isPrimary: asset.isPrimary === true,
          ingestionBatchId: input.ingestionBatchId,
        },
      });
    }

    upsertedUrls.push(url);
  }

  await tx.audioAsset.updateMany({
    where: {
      lectureId: input.lectureId,
      url: { notIn: upsertedUrls },
      ingestionBatchId: input.ingestionBatchId,
    },
    data: { isPrimary: false },
  });
}
