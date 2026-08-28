import { z } from "zod";

/** Media upload, presigned-URL, and audio-file request and response contracts. */
export const PresignedUrlPurposeSchema = z.enum(["audio", "image"]);
export type PresignedUrlPurpose = z.infer<typeof PresignedUrlPurposeSchema>;

export const PresignedUrlRequestDtoSchema = z.object({
  filename: z.string().min(1, "Filename must not be empty"),
  contentType: z.string().min(1, "Content type must not be empty"),
  purpose: PresignedUrlPurposeSchema,
  slug: z.string().optional(), // For slug-based naming (e.g., scholar images at /images/scholars/{slug}.{ext})
  entityType: z.enum(["scholar", "listing"]).optional(), // Entity type for image organization (default: scholar)
});
export type PresignedUrlRequestDto = z.infer<typeof PresignedUrlRequestDtoSchema>;

export const PresignedUrlResponseDtoSchema = z.object({
  uploadUrl: z.url(),
  publicUrl: z.url(),
  objectKey: z.string(),
});
export type PresignedUrlResponseDto = z.infer<typeof PresignedUrlResponseDtoSchema>;

export const BatchPresignAudioFileSchema = z.object({
  clientId: z.string().min(1, "Client id must not be empty"),
  filename: z.string().min(1, "Filename must not be empty"),
  contentType: z.string().min(1, "Content type must not be empty"),
  slug: z.string().min(1, "Slug must not be empty"),
});
export type BatchPresignAudioFile = z.infer<typeof BatchPresignAudioFileSchema>;

export const BatchPresignAudioRequestDtoSchema = z.object({
  rootSlug: z.string().min(1, "Root slug must not be empty"),
  files: z.array(BatchPresignAudioFileSchema).min(1).max(200),
});
export type BatchPresignAudioRequestDto = z.infer<typeof BatchPresignAudioRequestDtoSchema>;

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
export type BatchPresignAudioResponseDto = z.infer<typeof BatchPresignAudioResponseDtoSchema>;
