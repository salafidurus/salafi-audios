import { createZodDto } from 'nestjs-zod';
import { BatchPresignAudioRequestDtoSchema } from '@sd/core-contracts';

export class BatchPresignAudioRequestDto extends createZodDto(BatchPresignAudioRequestDtoSchema) {}
