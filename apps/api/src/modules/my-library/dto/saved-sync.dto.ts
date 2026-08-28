import { createZodDto } from 'nestjs-zod';
import { SavedSyncDtoSchema } from '@sd/core-contracts';

/** my library application module responsible for saved sync.dto behavior at the backend boundary. */
/** NestJS saved sync dto service or controller coordinating the API boundary for this responsibility. */
export class SavedSyncDto extends createZodDto(SavedSyncDtoSchema) {}
