import { z } from "zod";

export const PresignedUrlPurposeSchema = z.enum(["audio", "image"]);
export type PresignedUrlPurpose = z.infer<typeof PresignedUrlPurposeSchema>;

export const PresignedUrlRequestDtoSchema = z.object({
  filename: z.string().min(1, "Filename must not be empty"),
  contentType: z.string().min(1, "Content type must not be empty"),
  purpose: PresignedUrlPurposeSchema,
  slug: z.string().optional(), // For slug-based naming (e.g., scholar images at /images/scholars/{slug}.{ext})
});
export type PresignedUrlRequestDto = z.infer<typeof PresignedUrlRequestDtoSchema>;

export const PresignedUrlResponseDtoSchema = z.object({
  uploadUrl: z.string().url(),
  publicUrl: z.string().url(),
  objectKey: z.string(),
});
export type PresignedUrlResponseDto = z.infer<typeof PresignedUrlResponseDtoSchema>;
