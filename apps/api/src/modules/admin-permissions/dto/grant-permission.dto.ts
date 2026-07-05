import { createZodDto } from 'nestjs-zod';
import { GrantPermissionDtoSchema } from '@sd/core-contracts';

export class GrantPermissionDto extends createZodDto(GrantPermissionDtoSchema) {}
