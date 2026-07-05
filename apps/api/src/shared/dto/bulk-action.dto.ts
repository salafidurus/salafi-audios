import { createZodDto } from 'nestjs-zod';
import { BulkActionDtoSchema } from '@sd/core-contracts';

export class BulkActionDto extends createZodDto(BulkActionDtoSchema) {}
