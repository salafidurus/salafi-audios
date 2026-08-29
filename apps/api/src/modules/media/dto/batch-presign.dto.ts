import {
  BatchPresignAudioRequestDtoSchema,
  type BatchPresignAudioRequestDto as BatchPresignAudioRequestDtoType,
} from '@sd/core-contracts';

/** Defines the validated request contract for issuing batch media URLs. */
export { BatchPresignAudioRequestDtoSchema };
/** Audio object keys for which the API should issue a batch of signed URLs. */
export type BatchPresignAudioRequestDto = BatchPresignAudioRequestDtoType;
