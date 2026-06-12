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
