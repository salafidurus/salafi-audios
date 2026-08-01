import { createZodDto } from 'nestjs-zod';
import { ArrangeCommitDtoSchema } from '@sd/core-contracts';

export class ArrangeCommitDto extends createZodDto(ArrangeCommitDtoSchema) {}
