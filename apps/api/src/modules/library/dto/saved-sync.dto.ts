import { createZodDto } from 'nestjs-zod';
import { SavedSyncDtoSchema } from '@sd/core-contracts';

export class SavedSyncDto extends createZodDto(SavedSyncDtoSchema) {}
