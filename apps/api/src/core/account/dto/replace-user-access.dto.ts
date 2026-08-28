import { ReplaceUserAccessRequestSchema } from '@sd/core-contracts';
import { createZodDto } from 'nestjs-zod';

/** Core API replace user access.dto module providing shared backend infrastructure and authority-boundary services. */
/** NestJS replace user access dto service or controller coordinating the API boundary for this responsibility. */
export class ReplaceUserAccessDto extends createZodDto(ReplaceUserAccessRequestSchema) {}
