import { createZodDto } from 'nestjs-zod';
import { UpdateLocaleDtoSchema } from '@sd/core-contracts';

/** Core API update locale.dto module providing shared backend infrastructure and authority-boundary services. */
/** NestJS update locale dto service or controller coordinating the API boundary for this responsibility. */
export class UpdateLocaleDto extends createZodDto(UpdateLocaleDtoSchema) {}
