import { createZodDto } from 'nestjs-zod';
import { UpdateProfileDtoSchema } from '@sd/core-contracts';

/** Core API update profile.dto module providing shared backend infrastructure and authority-boundary services. */
/** NestJS update profile dto service or controller coordinating the API boundary for this responsibility. */
export class UpdateProfileDto extends createZodDto(UpdateProfileDtoSchema) {}
