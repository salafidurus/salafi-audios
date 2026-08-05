import { ReplaceUserAccessRequestSchema } from '@sd/core-contracts';
import { createZodDto } from 'nestjs-zod';

export class ReplaceUserAccessDto extends createZodDto(ReplaceUserAccessRequestSchema) {}
