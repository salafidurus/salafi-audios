import { createZodDto } from 'nestjs-zod';
import { BatchPresignAudioRequestDtoSchema } from '@sd/core-contracts';

/** media application module responsible for batch presign.dto behavior at the backend boundary. */
/** NestJS batch presign audio request dto service or controller coordinating the API boundary for this responsibility. */
export class BatchPresignAudioRequestDto extends createZodDto(BatchPresignAudioRequestDtoSchema) {}
