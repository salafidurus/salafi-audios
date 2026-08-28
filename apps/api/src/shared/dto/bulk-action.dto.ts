import { createZodDto } from 'nestjs-zod';
import { BulkActionDtoSchema } from '@sd/core-contracts';

/** Shared API bulk action.dto utilities and boundary definitions used by backend modules. */
/** NestJS bulk action dto service or controller coordinating the API boundary for this responsibility. */
export class BulkActionDto extends createZodDto(BulkActionDtoSchema) {}
