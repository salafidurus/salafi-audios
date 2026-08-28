import { z } from "zod";

/** Media upload, presigned-URL, and audio-file request and response contracts. */
/** Defines the runtime contract value for presigned url purpose schema. */
export const PresignedUrlPurposeSchema = z.enum(["audio", "image"]);
/** Defines the contract type for presigned url purpose. */
export type PresignedUrlPurpose = z.infer<typeof PresignedUrlPurposeSchema>;

/** Defines the runtime contract value for presigned url request dto schema. */
export const PresignedUrlRequestDtoSchema = z.object({
  filename: z.string().min(1, "Filename must not be empty"),
  contentType: z.string().min(1, "Content type must not be empty"),
  purpose: PresignedUrlPurposeSchema,
  slug: z.string().optional(), // For slug-based naming (e.g., scholar images at /images/scholars/{slug}.{ext})
  entityType: z.enum(["scholar", "listing"]).optional(), // Entity type for image organization (default: scholar)
});
/** Defines the contract type for presigned url request dto. */
export type PresignedUrlRequestDto = z.infer<typeof PresignedUrlRequestDtoSchema>;

/** Defines the runtime contract value for presigned url response dto schema. */
export const PresignedUrlResponseDtoSchema = z.object({
  uploadUrl: z.url(),
  publicUrl: z.url(),
  objectKey: z.string(),
});
/** Defines the contract type for presigned url response dto. */
export type PresignedUrlResponseDto = z.infer<typeof PresignedUrlResponseDtoSchema>;

/** Defines the runtime contract value for batch presign audio file schema. */
export const BatchPresignAudioFileSchema = z.object({
  clientId: z.string().min(1, "Client id must not be empty"),
  filename: z.string().min(1, "Filename must not be empty"),
  contentType: z.string().min(1, "Content type must not be empty"),
  slug: z.string().min(1, "Slug must not be empty"),
});
/** Defines the contract type for batch presign audio file. */
export type BatchPresignAudioFile = z.infer<typeof BatchPresignAudioFileSchema>;

/** Defines the runtime contract value for batch presign audio request dto schema. */
export const BatchPresignAudioRequestDtoSchema = z.object({
  rootSlug: z.string().min(1, "Root slug must not be empty"),
  files: z.array(BatchPresignAudioFileSchema).min(1).max(200),
});
/** Defines the contract type for batch presign audio request dto. */
export type BatchPresignAudioRequestDto = z.infer<typeof BatchPresignAudioRequestDtoSchema>;

/** Defines the runtime contract value for batch presign audio response dto schema. */
export const BatchPresignAudioResponseDtoSchema = z.object({
  files: z.array(
    z.object({
      clientId: z.string(),
      uploadUrl: z.url(),
      publicUrl: z.url(),
      objectKey: z.string(),
    }),
  ),
  expiresInSeconds: z.number(),
});
/** Defines the contract type for batch presign audio response dto. */
export type BatchPresignAudioResponseDto = z.infer<typeof BatchPresignAudioResponseDtoSchema>;
