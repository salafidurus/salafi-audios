import { createZodDto } from 'nestjs-zod';
import { ArrangeCommitDtoSchema } from '@sd/core-contracts';

/** listing application module responsible for arrange commit.dto behavior at the backend boundary. */
/** NestJS arrange commit dto service or controller coordinating the API boundary for this responsibility. */
export class ArrangeCommitDto extends createZodDto(ArrangeCommitDtoSchema) {}
