import { createReadStream } from "node:fs";
import * as path from "node:path";
import {
  DeleteObjectsCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

export type R2Config = {
  accountId: string;
  bucket: string;
  accessKeyId: string;
  secretAccessKey: string;
  publicBaseUrl: string;
};

function sanitizePathSegment(input: string): string {
  return input.replace(/[^a-zA-Z0-9-_]/g, "-");
}

function detectContentType(filePath: string): string {
  const extension = path.extname(filePath).toLowerCase();
  if (extension === ".mp3") return "audio/mpeg";
  if (extension === ".m4a") return "audio/mp4";
  if (extension === ".ogg") return "audio/ogg";
  if (extension === ".wav") return "audio/wav";
  return "application/octet-stream";
}

export function parseR2Config(): R2Config | null {
  const accountId = process.env.R2_ACCOUNT_ID;
  const bucket = process.env.R2_BUCKET;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const publicBaseUrl = process.env.R2_PUBLIC_BASE_URL;

  if (!accountId || !bucket || !accessKeyId || !secretAccessKey || !publicBaseUrl) {
    return null;
  }

  return {
    accountId,
    bucket,
    accessKeyId,
    secretAccessKey,
    publicBaseUrl: publicBaseUrl.replace(/\/$/, ""),
  };
}

export function createR2Client(config: R2Config): S3Client {
  return new S3Client({
    region: "auto",
    endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  });
}

export async function uploadAudioFile(
  r2Client: S3Client,
  r2Config: R2Config,
  input: {
    environment: string;
    batchTag: string;
    scholarSlug: string;
    lectureSlug: string;
    filePath: string;
  },
): Promise<string> {
  const absolutePath = path.resolve(process.cwd(), input.filePath);
  const basename = path.basename(absolutePath);
  const key = [
    "ingestion",
    sanitizePathSegment(input.environment),
    sanitizePathSegment(input.batchTag),
    sanitizePathSegment(input.scholarSlug),
    sanitizePathSegment(input.lectureSlug),
    sanitizePathSegment(basename),
  ].join("/");

  await r2Client.send(
    new PutObjectCommand({
      Bucket: r2Config.bucket,
      Key: key,
      Body: createReadStream(absolutePath),
      ContentType: detectContentType(absolutePath),
    }),
  );

  return key;
}

export async function listKeysByPrefix(
  r2Client: S3Client,
  r2Config: R2Config,
  prefix: string,
): Promise<string[]> {
  const keys: string[] = [];
  let continuationToken: string | undefined;

  do {
    const response = await r2Client.send(
      new ListObjectsV2Command({
        Bucket: r2Config.bucket,
        Prefix: prefix,
        ContinuationToken: continuationToken,
      }),
    );

    for (const entry of response.Contents ?? []) {
      if (entry.Key) {
        keys.push(entry.Key);
      }
    }

    continuationToken = response.IsTruncated ? response.NextContinuationToken : undefined;
  } while (continuationToken);

  return keys;
}

export async function deleteKeys(
  r2Client: S3Client,
  r2Config: R2Config,
  keys: string[],
): Promise<number> {
  if (keys.length === 0) {
    return 0;
  }

  let deleted = 0;

  for (let index = 0; index < keys.length; index += 1000) {
    const chunk = keys.slice(index, index + 1000);
    const response = await r2Client.send(
      new DeleteObjectsCommand({
        Bucket: r2Config.bucket,
        Delete: {
          Objects: chunk.map((key) => ({ Key: key })),
          Quiet: true,
        },
      }),
    );

    deleted += response.Deleted?.length ?? 0;
  }

  return deleted;
}
